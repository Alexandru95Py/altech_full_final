from django.urls import path, include


urlpatterns = [
    path('split/', include('altech_pdf.basic_plan.split.urls')),
    path('merge/', include('altech_pdf.basic_plan.merge.urls')),
    path('delete/', include('altech_pdf.basic_plan.delete.urls')),
    path('reorder/', include('altech_pdf.basic_plan.reorder.urls')),
    path('compress/', include('altech_pdf.basic_plan.compress.urls')),
    path('extract_pages/', include('altech_pdf.basic_plan.extract_pages.urls')),
    path('rotate/', include('altech_pdf.basic_plan.rotate.urls')),
]