from django.urls import path
from . import views

urlpatterns = [
    path('register/',       views.register,        name='user-register'),
    path('login/',          views.login,            name='user-login'),
    path('send-otp/',       views.send_otp,         name='user-send-otp'),
    path('reset-password/', views.reset_password,   name='user-reset-password'),
    path('me/',             views.me,               name='user-me'),
    path('me/update/',      views.update_profile,   name='user-update-profile'),
    path('google/',         views.google_login,     name='user-google-login'),
    path('wishlist/',       views.wishlist_view,    name='user-wishlist'),
    
    # Admin User Management
    path('admin/users/', views.admin_get_users, name='admin-get-users'),
    path('admin/users/<int:user_id>/details/', views.admin_user_details, name='admin-user-details'),
    path('admin/users/<int:user_id>/toggle-block/', views.admin_toggle_user, name='admin-toggle-user'),
    path('admin/users/<int:user_id>/', views.admin_delete_user, name='admin-delete-user'),
    
    # Notifications & Reviews
    path('notifications/', views.notifications_view, name='user-notifications'),
    path('reviews/submit/', views.submit_review, name='submit-review'),
    path('reviews/product/<int:product_id>/', views.product_reviews, name='product-reviews'),
    path('reviews/my-reviews/', views.user_reviews, name='user-reviews'),
]
