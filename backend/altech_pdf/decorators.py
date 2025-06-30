
from django.http import JsonResponse

def free_or_pro_required(view_func):
    def wrapper(request, *args, **kwargs):
        print("== DEBUG DECORATOR ==")
        print("Request user:", request.user)
        print("Este autentificat:", request.user.is_authenticated)
        print("Are atribut plan?:", hasattr(request.user, "plan"))
        user = request.user

        # Verifică dacă utilizatorul este autentificat
        if not user.is_authenticated:
            return JsonResponse({"error": "Autentificare necesară."}, status=403)

        # Verifică dacă planul este valid (free sau pro)
        plan = getattr(user, 'plan', None)
        if plan not in ['free', 'pro']:
            return JsonResponse({"error": "Acces interzis: plan invalid."}, status=403)

        return view_func(request, *args, **kwargs)

    return wrapper