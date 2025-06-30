from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .decorators import free_or_pro_required
from .serializers import FillPDFSerializer, SignPDFSerializer
from .utils.sign_helper import fill_pdf_fields, sign_pdf_with_image
from .models import save_fill_or_sign_action


class FillPDFView(APIView):
    permission_classes = [IsAuthenticated]

    @free_or_pro_required
    def post(self, request):
        serializer = FillPDFSerializer(data=request.data)
        if serializer.is_valid():
            filled_pdf_path = fill_pdf_fields(
                serializer.validated_data["file"],
                serializer.validated_data["fields"]
            )

            # Salvăm în baza de date
            save_fill_or_sign_action(
                user=request.user,
                action_type="sign",
                original_file=serializer.validated_data["file"],
                result_file=filled_pdf_path,
                page=serializer.validated_data.get("page"),
                x=serializer.validated_data.get("x"),
                y=serializer.validated_data.get("y"),
                details={
                    "signature": True,
                    "page": serializer.validated_data.get("page"),
                    "x": serializer.validated_data.get("x"),
                    "y": serializer.validated_data.get("y")
                }
            )
            return Response({"file_path": filled_pdf_path}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignPDFView(APIView):
    permission_classes = [IsAuthenticated]

    @free_or_pro_required
    def post(self, request):
        serializer = SignPDFSerializer(data=request.data)
        if serializer.is_valid():
            signed_pdf_path = sign_pdf_with_image(
                serializer.validated_data["file"],
                serializer.validated_data["signature_image"],
                serializer.validated_data["page"],
                serializer.validated_data["x"],
                serializer.validated_data["y"]
            )

            # Salvăm în baza de date
            save_fill_or_sign_action(
                user=request.user,
                action_type="sign",
                original_file=serializer.validated_data["file"],
                result_file=signed_pdf_path,  # ✅ acest nume trebuie să fie exact ca în models
                page=serializer.validated_data.get("page"),
                x=serializer.validated_data.get("x"),
                y=serializer.validated_data.get("y"),
                details={  # ✅ eliminăm referința la "fields"
                    "signature": True,
                    "page": serializer.validated_data.get("page"),
                    "x": serializer.validated_data.get("x"),
                    "y": serializer.validated_data.get("y")
                }
            )

            return Response({"file_path": signed_pdf_path}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)