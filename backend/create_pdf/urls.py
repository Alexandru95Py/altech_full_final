from django.urls import include, path



urlpatterns = [
    path('', include('create_pdf.urls.free')),
    path('pro/', include('create_pdf.urls.pro')),
    path('ai/', include('create_pdf.urls.ai')),

    
]