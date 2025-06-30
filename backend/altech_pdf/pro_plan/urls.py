from django.urls import path, include

app_name = 'pro'

urlpatterns = [
    path('split/', include(('altech_pdf.pro_plan.split.urls', 'split'), namespace='split')),
    path('merge/', include(('altech_pdf.pro_plan.merge.urls', 'merge'), namespace='merge')),
    path('delete/', include(('altech_pdf.pro_plan.delete.urls', 'delete'), namespace='delete')),
    path('reorder/', include(('altech_pdf.pro_plan.reorder.urls', 'reorder'), namespace='reorder')),
]