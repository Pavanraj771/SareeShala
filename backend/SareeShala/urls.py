"""
URL configuration for SareeShala project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "Welcome to SareeShala API",
        "status": "Running",
        "endpoints": {
            "users": "/api/users/",
            "products": "/api/products/",
            "orders": "/api/orders/"
        }
    })

urlpatterns = [
    path('',                home,                  name='home'),
    path('admin/',          admin.site.urls),
    path('api/users/',      include('users.urls')),
    path('api/products/',   include('products.urls')),
    path('api/orders/',     include('orders.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

