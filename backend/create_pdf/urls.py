from django.urls import include, path



urlpatterns = [
    path('free/', include('create_pdf.urls_free')),
    path('pro/', include('create_pdf.urls_pro')),
    path('ai/', include('create_pdf.urls_ai')),

    
]