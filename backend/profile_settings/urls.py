from django.urls import path
from .views import UserProfileView, UpdateUserProfileView, ProfilePictureUploadView

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('update/', UpdateUserProfileView.as_view(), name='update-profile'),
    path('upload-picture/', ProfilePictureUploadView.as_view(), name='upload-profile-picture'),
]
