from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import psutil
import json
from .logging import LoggerMixin

class MonitoringService(LoggerMixin):
    """Service for monitoring application metrics"""

    def __init__(self):
        """Initialize monitoring service"""
        self.metrics_prefix = 'metrics:'
        self.metrics_timeout = 3600  # 1 hour

    def record_metric(
        self,
        name: str,
        value: Any,
        tags: Optional[Dict[str, str]] = None
    ) -> None:
        """Record a metric"""
        try:
            metric = {
                'name': name,
                'value': value,
                'tags': tags or {},
                'timestamp': datetime.now().isoformat()
            }
            
            # Store in cache
            cache_key = f"{self.metrics_prefix}{name}:{datetime.now().strftime('%Y%m%d%H')}"
            metrics = cache.get(cache_key) or []
            metrics.append(metric)
            cache.set(cache_key, metrics, self.metrics_timeout)
            
        except Exception as e:
            self.log_error(f"Error recording metric {name}: {str(e)}")

    def get_metrics(
        self,
        name: str,
        hours: int = 1
    ) -> list:
        """Get metrics for specified period"""
        try:
            metrics = []
            now = datetime.now()
            
            # Collect metrics for specified hours
            for i in range(hours):
                time = now - timedelta(hours=i)
                cache_key = f"{self.metrics_prefix}{name}:{time.strftime('%Y%m%d%H')}"
                hour_metrics = cache.get(cache_key) or []
                metrics.extend(hour_metrics)
            
            return metrics
            
        except Exception as e:
            self.log_error(f"Error getting metrics for {name}: {str(e)}")
            return []

    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system metrics"""
        try:
            cpu = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu': {
                    'percent': cpu,
                    'count': psutil.cpu_count()
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent
                },
                'disk': {
                    'total': disk.total,
                    'free': disk.free,
                    'percent': disk.percent
                }
            }
        except Exception as e:
            self.log_error(f"Error getting system metrics: {str(e)}")
            return {}

    def get_database_metrics(self) -> Dict[str, Any]:
        """Get database metrics"""
        try:
            with connection.cursor() as cursor:
                # Get connection count
                cursor.execute("""
                    SELECT count(*) 
                    FROM pg_stat_activity;
                """)
                connection_count = cursor.fetchone()[0]
                
                # Get database size
                cursor.execute("""
                    SELECT pg_database_size(current_database());
                """)
                db_size = cursor.fetchone()[0]
                
                # Get table statistics
                cursor.execute("""
                    SELECT 
                        schemaname,
                        relname,
                        n_live_tup,
                        n_dead_tup,
                        last_vacuum,
                        last_autovacuum
                    FROM pg_stat_user_tables;
                """)
                tables = []
                for row in cursor.fetchall():
                    tables.append({
                        'schema': row[0],
                        'name': row[1],
                        'live_rows': row[2],
                        'dead_rows': row[3],
                        'last_vacuum': row[4],
                        'last_autovacuum': row[5]
                    })
                
                return {
                    'connections': connection_count,
                    'size': db_size,
                    'tables': tables
                }
                
        except Exception as e:
            self.log_error(f"Error getting database metrics: {str(e)}")
            return {}

    def get_cache_metrics(self) -> Dict[str, Any]:
        """Get cache metrics"""
        try:
            info = cache.client.info()
            return {
                'used_memory': info['used_memory'],
                'connected_clients': info['connected_clients'],
                'uptime_seconds': info['uptime_in_seconds'],
                'total_commands': info['total_commands_processed'],
                'hits': info['keyspace_hits'],
                'misses': info['keyspace_misses']
            }
        except Exception as e:
            self.log_error(f"Error getting cache metrics: {str(e)}")
            return {}

    def get_request_metrics(self) -> Dict[str, Any]:
        """Get request metrics"""
        try:
            metrics = self.get_metrics('request', hours=1)
            
            # Calculate statistics
            total_requests = len(metrics)
            status_codes = {}
            total_duration = 0
            
            for metric in metrics:
                status = metric['tags'].get('status_code')
                if status:
                    status_codes[status] = status_codes.get(status, 0) + 1
                total_duration += float(metric['value'])
            
            avg_duration = total_duration / total_requests if total_requests > 0 else 0
            
            return {
                'total_requests': total_requests,
                'average_duration_ms': avg_duration,
                'status_codes': status_codes
            }
            
        except Exception as e:
            self.log_error(f"Error getting request metrics: {str(e)}")
            return {}

    def export_metrics(self, hours: int = 24) -> str:
        """Export all metrics as JSON"""
        try:
            data = {
                'timestamp': datetime.now().isoformat(),
                'period_hours': hours,
                'system': self.get_system_metrics(),
                'database': self.get_database_metrics(),
                'cache': self.get_cache_metrics(),
                'requests': self.get_request_metrics()
            }
            
            return json.dumps(data, indent=2)
            
        except Exception as e:
            self.log_error(f"Error exporting metrics: {str(e)}")
            return '{}'

# Create singleton instance
monitoring_service = MonitoringService() 