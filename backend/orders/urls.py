from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.cart_view, name='order-cart'),
    path('checkout/', views.checkout_view, name='checkout'),
    path('my-orders/', views.my_orders_view, name='my-orders'),
    path('admin/orders/', views.admin_orders_view, name='admin-orders'),
    path('admin/orders/<int:order_id>/status/', views.admin_orders_view, name='admin-order-status'),
]
