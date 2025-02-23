from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Follow, Block, Report
from .serializers import FollowSerializer, BlockSerializer, ReportSerializer

class FollowViewSet(viewsets.ModelViewSet):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(Q(follower=self.request.user) | Q(followed=self.request.user))

    @action(detail=False, methods=['get'])
    def followers(self, request):
        followers = Follow.objects.filter(followed=request.user)
        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def following(self, request):
        following = Follow.objects.filter(follower=request.user)
        serializer = self.get_serializer(following, many=True)
        return Response(serializer.data)

class BlockViewSet(viewsets.ModelViewSet):
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Block.objects.filter(blocker=self.request.user)

    @action(detail=False, methods=['get'])
    def blocked_users(self, request):
        blocked = self.get_queryset()
        serializer = self.get_serializer(blocked, many=True)
        return Response(serializer.data)

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Report.objects.all()
        return Report.objects.filter(reporter=user)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only staff members can change report status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        report = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Report.STATUS_CHOICES):
            return Response(
                {'detail': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.status = new_status
        report.admin_notes = request.data.get('admin_notes', report.admin_notes)
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data) 