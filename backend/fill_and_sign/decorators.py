from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def free_or_pro_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):
        user = request.user

        # Aici e locul pentru logica de plan
        # Exemplu: verificare dacă userul e Pro
        # if not user.profile.is_pro:
        #     return Response({"detail": "Funcția este disponibilă doar pentru planul Pro."}, status=status.HTTP_403_FORBIDDEN)

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view