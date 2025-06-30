from rest_framework import serializers

class CVDataSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.CharField(allow_blank=True)

    phone = serializers.CharField(allow_blank=True)
    linkedin_url = serializers.CharField(allow_blank=True)
    website_url = serializers.CharField(allow_blank=True)
    location = serializers.CharField(allow_blank=True)
    professional_summary = serializers.CharField(allow_blank=True)

    skills = serializers.CharField()
    languages = serializers.CharField()
    work_experience = serializers.CharField()
    education = serializers.CharField()
    certifications = serializers.CharField()

    profile_photo = serializers.ImageField(required=False, allow_null=True)

    def validate(self, data):
        print("✅ DEBUG — Date validate în serializer:")
        for k, v in data.items():
            print(f"   - {k}: {str(v)[:100]}{'...' if len(str(v)) > 100 else ''}")  # limităm la 100 caractere pentru claritate
        return data
