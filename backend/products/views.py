from django.shortcuts import render
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

from django.db.models import Sum, functions
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Product.objects.annotate(
            total_sales=functions.Coalesce(Sum('order_items__quantity'), 0)
        ).order_by('-created_at')
    
    serializer_class = ProductSerializer

