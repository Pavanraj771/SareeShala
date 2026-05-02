from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from products.models import Product
from .models import CartItem

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    user = request.user
    
    if request.method == 'GET':
        items = CartItem.objects.filter(user=user).select_related('product')
        data = []
        total = 0
        for item in items:
            product = item.product
            item_total = product.price * item.quantity
            total += item_total
            data.append({
                'id': product.id,
                'name': product.name,
                'price': str(product.price),
                'image1': request.build_absolute_uri(product.image1.url) if product.image1 else None,
                'quantity': item.quantity,
                'item_total': str(item_total),
            })
        return Response({'items': data, 'cart_total': str(total)})
        
    elif request.method == 'POST':
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        cart_item, created = CartItem.objects.get_or_create(user=user, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()
        
        return Response({'message': 'Added to cart successfully'})
        
    elif request.method == 'DELETE':
        product_id = request.data.get('product_id')
        try:
            CartItem.objects.filter(user=user, product_id=product_id).delete()
            return Response({'message': 'Removed from cart'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
