from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object
        return obj.user == request.user

class IsProfileOwner(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsLocationOwner(permissions.BasePermission):
    """
    Custom permission to only allow users to manage their own location data.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class CanAccessChat(permissions.BasePermission):
    """
    Custom permission to only allow chat participants to access the chat.
    """

    def has_object_permission(self, request, view, obj):
        return request.user in obj.participants.all()

class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users to access certain features.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_phone_verified)

class CanModifyPlace(permissions.BasePermission):
    """
    Custom permission for place modification.
    Owners can edit, staff can moderate, others can only read.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff can moderate
        if request.user.is_staff:
            return True
            
        # Owner can edit
        return obj.created_by == request.user 