from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from custom_auth.models import PasswordResetCode

User = get_user_model()


class ForgotPasswordTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            password="oldpassword123"
        )

    def test_forgot_password_flow(self):
        """Test the complete forgot password flow"""
        
        # Step 1: Request password reset
        url = reverse("forgot-password")
        data = {"email": "test@example.com"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Password reset code sent successfully", response.data['detail'])
        
        # Verify code was created
        reset_code = PasswordResetCode.objects.get(user=self.user)
        self.assertIsNotNone(reset_code)
        self.assertEqual(len(reset_code.code), 6)
        
        # Step 2: Verify reset code
        url = reverse("verify-reset-code")
        data = {"email": "test@example.com", "code": reset_code.code}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Code verified successfully", response.data['detail'])
        
        # Step 3: Reset password
        url = reverse("reset-password")
        data = {
            "email": "test@example.com",
            "code": reset_code.code,
            "new_password": "newpassword123"
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Password reset successfully", response.data['detail'])
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))
        
        # Verify reset code was deleted
        self.assertFalse(PasswordResetCode.objects.filter(user=self.user).exists())

    def test_forgot_password_invalid_email(self):
        """Test forgot password with invalid email"""
        url = reverse("forgot-password")
        data = {"email": "nonexistent@example.com"}
        response = self.client.post(url, data, format='json')
        
        # Should still return success for security (don't reveal if email exists)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_verify_reset_code_invalid_code(self):
        """Test code verification with invalid code"""
        # First create a reset code
        url = reverse("forgot-password")
        data = {"email": "test@example.com"}
        self.client.post(url, data, format='json')
        
        # Try to verify with wrong code
        url = reverse("verify-reset-code")
        data = {"email": "test@example.com", "code": "123456"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid or expired code", response.data['detail'])

    def test_reset_password_short_password(self):
        """Test password reset with short password"""
        # First create and verify a reset code
        url = reverse("forgot-password")
        data = {"email": "test@example.com"}
        self.client.post(url, data, format='json')
        
        reset_code = PasswordResetCode.objects.get(user=self.user)
        
        # Try to reset with short password
        url = reverse("reset-password")
        data = {
            "email": "test@example.com",
            "code": reset_code.code,
            "new_password": "123"
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Password must be at least 8 characters", response.data['detail'])
