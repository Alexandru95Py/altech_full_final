from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random

# AI Assistant simplificat (versiune de mijloc)
class AIAssistantView(APIView):
    def post(self, request):
        user_input = request.data.get("command", "").lower()
        suggestions = []

        if "tabel" in user_input or "table" in user_input:
            suggestions.append({
                "type": "table",
                "columns": 4,
                "rows": 3,
                "headers": ["Coloana 1", "Coloana 2", "Coloana 3", "Coloana 4"]
            })
        elif "scrie" in user_input or "write" in user_input:
            suggestions.append({
                "type": "text",
                "content": "Aceasta este o propunere de introducere pentru documentul tău PDF."
            })
        elif "imagine" in user_input or "image" in user_input:
            suggestions.append({
                "type": "image",
                "path": "/static/sample.jpg",
                "note": "Imagine sugestivă pentru CV/contract."
            })
        else:
            suggestions.append({
                "type": "hint",
                "content": "Încearcă comenzi precum 'creează tabel', 'scrie introducere', 'adaugă imagine'."
            })

        return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)