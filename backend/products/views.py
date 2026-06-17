from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.db.models import Sum, Avg, Count, functions
from .models import Product, Review
from .serializers import ProductSerializer


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

    @action(detail=True, methods=['get'], url_path='analytics')
    def analytics(self, request, pk=None):
        """Return product analytics: wishlist count, order stats, reviews."""
        from users.models import Wishlist
        from orders.models import OrderItem

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        wishlist_count = Wishlist.objects.filter(product=product).count()

        order_stats = OrderItem.objects.filter(product=product).aggregate(
            total_ordered=functions.Coalesce(Sum('quantity'), 0),
            total_orders=Count('order__id', distinct=True)
        )

        reviews = Review.objects.filter(product=product).select_related('user').order_by('-created_at')
        review_data = []
        for r in reviews:
            review_data.append({
                'id': r.id,
                'user': r.user.username,
                'rating': r.rating,
                'comment': r.comment,
                'created_at': r.created_at.isoformat()
            })

        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg']

        # Collect all images (file uploads or URLs)
        images = []
        for i in range(1, 6):
            img_field = getattr(product, f'image{i}', None)
            img_url = getattr(product, f'image{i}_url', None) or ''
            # ImageField: check .name to see if a file is actually stored
            if img_field and hasattr(img_field, 'name') and img_field.name:
                try:
                    images.append(img_field.url)
                except Exception:
                    if img_url:
                        images.append(img_url)
            elif img_url:
                images.append(img_url)

        return Response({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': str(product.price),
            'stock': product.stock,
            'images': images,
            'color_name': product.color_name or '',
            'color_hex': product.color_hex or '',
            'created_at': product.created_at.isoformat(),
            'wishlist_count': wishlist_count,
            'total_ordered': order_stats['total_ordered'],
            'total_orders': order_stats['total_orders'],
            'review_count': len(review_data),
            'avg_rating': round(avg_rating, 1) if avg_rating else None,
            'reviews': review_data
        })
