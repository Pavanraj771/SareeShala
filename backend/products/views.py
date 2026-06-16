from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from django.core.cache import cache
from .models import Product
from .serializers import ProductSerializer

from django.db.models import Sum, functions


PRODUCT_CACHE_KEY = 'products_list_cache'
PRODUCT_CACHE_TTL = 60 * 5  # 5 minutes


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.select_related(
            'parent_product'
        ).prefetch_related(
            'variants', 'parent_product__variants'
        ).annotate(
            total_sales=functions.Coalesce(Sum('order_items__quantity'), 0)
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        """Cache the full product list to speed up homepage loading."""
        cached_data = cache.get(PRODUCT_CACHE_KEY)
        if cached_data is not None:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        cache.set(PRODUCT_CACHE_KEY, response.data, PRODUCT_CACHE_TTL)
        return response

    def perform_create(self, serializer):
        serializer.save()
        cache.delete(PRODUCT_CACHE_KEY)

    def perform_update(self, serializer):
        serializer.save()
        cache.delete(PRODUCT_CACHE_KEY)

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete(PRODUCT_CACHE_KEY)
