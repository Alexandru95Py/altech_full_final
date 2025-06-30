from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    #File_manager
    path('file/', include('file_manager.urls')),

    #Fill and sign
    path('fill-and-sign/', include(('fill_and_sign.urls', 'fill_and_sign'), namespace='fill_and_sign')),
    # Home
    path('', include('altech_pdf.home.urls')),
   
    # Basic Plan
    path('basic/', include('altech_pdf.basic_plan.urls')),
   
    # Pro Plan
    path('pro/', include('altech_pdf.pro_plan.urls')),

    # Autentificare
    path('auth/', include('custom_auth.urls')),

    # Analytics (opțional, dacă e activ)
    path('analytics/', include('analytics.urls')),
    
    path('api/cv/', include('cv_generator.urls')),

    path('notifications/', include('notifications.urls')),
    path('support/', include('support.urls')),
   
    


    path('api/create/free/', include('create_pdf.urls.urls_free')),
    path('api/create/pro/', include('create_pdf.urls.urls_pro', namespace='create_pdf')),
    path('api/create/ai/', include('create_pdf.urls.urls_ai')),
    
    path('free/', include(('ProtectDocument.free_plan.urls', 'free'), namespace='free')),
    
    # MyFiles
    path('api/myfiles/', include('myfiles.urls')),
    path('myfiles/', include('myfiles.urls')),
    
    path("convert/", include("convert.urls")),
    # celelalte path-uri: split, reorder, delete etc.

]