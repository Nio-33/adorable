from typing import Dict, Any, List
import psutil
import redis
from django.db import connections
from django.conf import settings
from datetime import datetime
import requests
from .logging import LoggerMixin
from .cache import cache_service

class HealthCheck(LoggerMixin):
    """Health check system for monitoring service status"""

    def __init__(self):
        """Initialize health check system"""
        self.services = {
            'database': self.check_database,
            'redis': self.check_redis,
            'firebase': self.check_firebase,
            'mapbox': self.check_mapbox,
            'system': self.check_system_resources
        }

    def check_all(self) -> Dict[str, Any]:
        """Check health of all services"""
        results = {}
        overall_status = 'healthy'

        for service, check_func in self.services.items():
            try:
                result = check_func()
                results[service] = result
                if result['status'] != 'healthy':
                    overall_status = 'degraded'
            except Exception as e:
                self.log_error(f"Error checking {service}: {str(e)}")
                results[service] = {
                    'status': 'error',
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                }
                overall_status = 'degraded'

        return {
            'status': overall_status,
            'timestamp': datetime.now().isoformat(),
            'services': results
        }

    def check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            for name, conn in connections.items():
                conn.cursor().execute('SELECT 1')
            
            return {
                'status': 'healthy',
                'name': 'PostgreSQL',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'name': 'PostgreSQL',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity"""
        try:
            cache_service.redis_client.ping()
            info = cache_service.redis_client.info()
            
            return {
                'status': 'healthy',
                'name': 'Redis',
                'version': info['redis_version'],
                'connected_clients': info['connected_clients'],
                'used_memory_human': info['used_memory_human'],
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'name': 'Redis',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def check_firebase(self) -> Dict[str, Any]:
        """Check Firebase connectivity"""
        try:
            from ..services.firebase.service import firebase_service
            # Try to access Firebase
            firebase_service.get_realtime_data('health_check')
            
            return {
                'status': 'healthy',
                'name': 'Firebase',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'name': 'Firebase',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def check_mapbox(self) -> Dict[str, Any]:
        """Check MapBox API connectivity"""
        try:
            response = requests.get(
                'https://api.mapbox.com/geocoding/v5/mapbox.places/test.json',
                params={'access_token': settings.MAPBOX_ACCESS_TOKEN},
                timeout=5
            )
            response.raise_for_status()
            
            return {
                'status': 'healthy',
                'name': 'MapBox',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'name': 'MapBox',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def check_system_resources(self) -> Dict[str, Any]:
        """Check system resources"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            status = 'healthy'
            warnings = []
            
            # Check thresholds
            if cpu_percent > 80:
                status = 'warning'
                warnings.append('High CPU usage')
            
            if memory.percent > 80:
                status = 'warning'
                warnings.append('High memory usage')
            
            if disk.percent > 80:
                status = 'warning'
                warnings.append('High disk usage')
            
            return {
                'status': status,
                'warnings': warnings,
                'metrics': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available': f"{memory.available / (1024*1024*1024):.2f}GB",
                    'disk_percent': disk.percent,
                    'disk_free': f"{disk.free / (1024*1024*1024):.2f}GB"
                },
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'name': 'System Resources',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_service_metrics(self) -> List[Dict[str, Any]]:
        """Get detailed metrics for all services"""
        metrics = []
        
        # Database metrics
        try:
            for name, conn in connections.items():
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT sum(n_live_tup) as row_count
                        FROM pg_stat_user_tables;
                    """)
                    row_count = cursor.fetchone()[0]
                    
                    cursor.execute("""
                        SELECT count(*) as connection_count 
                        FROM pg_stat_activity;
                    """)
                    connection_count = cursor.fetchone()[0]
                    
                    metrics.append({
                        'service': 'database',
                        'name': name,
                        'metrics': {
                            'total_rows': row_count,
                            'active_connections': connection_count
                        }
                    })
        except Exception as e:
            self.log_error(f"Error getting database metrics: {str(e)}")

        # Redis metrics
        try:
            info = cache_service.redis_client.info()
            metrics.append({
                'service': 'redis',
                'metrics': {
                    'connected_clients': info['connected_clients'],
                    'used_memory': info['used_memory'],
                    'total_commands_processed': info['total_commands_processed'],
                    'keyspace_hits': info['keyspace_hits'],
                    'keyspace_misses': info['keyspace_misses']
                }
            })
        except Exception as e:
            self.log_error(f"Error getting Redis metrics: {str(e)}")

        return metrics

# Create singleton instance
health_check = HealthCheck() 