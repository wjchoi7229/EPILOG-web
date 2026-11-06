from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('web_epilepsy.urls')),
    path('admin/', admin.site.urls),
]
