from rest_framework import serializers


# ===== FREE PLAN =====

class BasicPDFSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField()


class ImagePDFSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField()
    image = serializers.ImageField()


class TablePDFSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    headers = serializers.ListField(child=serializers.CharField(), allow_empty=False)
    rows = serializers.ListField(child=serializers.ListField(child=serializers.CharField()), allow_empty=False)


# ===== PREMIUM PLAN =====

class AdvancedTablePDFSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    headers = serializers.ListField(child=serializers.CharField(), allow_empty=False)
    rows = serializers.ListField(child=serializers.ListField(child=serializers.CharField()), allow_empty=False)
    styles = serializers.DictField(child=serializers.CharField(), required=False)


class ContractPDFSerializer(serializers.Serializer):
    client_name = serializers.CharField()
    date = serializers.DateField()
    service = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    terms = serializers.CharField()


class InvoicePDFSerializer(serializers.Serializer):
    client = serializers.CharField()
    invoice_number = serializers.CharField()
    date = serializers.DateField()
    service = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    due_date = serializers.DateField()


class SignPDFSerializer(serializers.Serializer):
    pdf = serializers.FileField()
    signature = serializers.ImageField()
    position = serializers.JSONField(required=False, help_text="Ex: {'x': 100, 'y': 150}")