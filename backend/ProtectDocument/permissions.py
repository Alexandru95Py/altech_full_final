from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsProUser(BasePermission):
    """
    Permite accesul doar utilizatorilor cu plan PRO.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'is_pro', False)


class IsOwnerOrReadOnly(BasePermission):
    """
    Permite doar citirea pentru ceilalți, scrierea doar pentru owner.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user