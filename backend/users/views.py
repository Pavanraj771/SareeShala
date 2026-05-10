from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings as django_settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils.crypto import get_random_string
import traceback
import requests
from .models import CustomUser, OTPVerification, Wishlist
from orders.models import Order
from products.models import Review


# ─────────────────────────────────────────────
#  Helper
# ─────────────────────────────────────────────

def get_tokens(user):
    """Return JWT access + refresh tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'token':   str(refresh.access_token),
        'refresh': str(refresh),
    }


def send_welcome_email(user):
    from django.core.mail import send_mail
    try:
        subject = 'Welcome to SareeShala! ✨'
        message = f"Hi {user.first_name or user.username},\n\nThank you for joining SareeShala! We are thrilled to have you.\n\nEnjoy an exclusive 10% off on your first purchase.\n\nHappy Shopping,\nThe SareeShala Team"
        send_mail(
            subject,
            message,
            'sareeshala@outlook.com',
            [user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Failed to send welcome email: {e}")


def _send_otp_email(email, otp_code, purpose):
    """Send the OTP code to the user's email address."""
    if purpose == OTPVerification.PURPOSE_REGISTRATION:
        subject = 'SareeShala – Verify Your Email'
        body = (
            f"Welcome to SareeShala! 🛍️\n\n"
            f"Your OTP for account registration is:\n\n"
            f"  {otp_code}\n\n"
            f"This code is valid for 10 minutes. Do not share it with anyone.\n\n"
            f"– Team SareeShala"
        )
    else:
        subject = 'SareeShala – Password Reset OTP'
        body = (
            f"Hello,\n\n"
            f"Your OTP to reset your SareeShala password is:\n\n"
            f"  {otp_code}\n\n"
            f"This code is valid for 10 minutes. If you did not request this, ignore this email.\n\n"
            f"– Team SareeShala"
        )

    send_mail(
        subject=subject,
        message=body,
        from_email=django_settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


# ─────────────────────────────────────────────
#  OTP – Send
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    POST /api/users/send-otp/
    Body: { email, purpose }   purpose = 'registration' | 'password_reset'
    """
    email   = request.data.get('email', '').strip().lower()
    purpose = request.data.get('purpose', '').strip()

    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    valid_purposes = [OTPVerification.PURPOSE_REGISTRATION, OTPVerification.PURPOSE_PASSWORD_RESET]
    if purpose not in valid_purposes:
        return Response({'error': 'Invalid purpose.'}, status=status.HTTP_400_BAD_REQUEST)

    # For password reset — email must exist
    if purpose == OTPVerification.PURPOSE_PASSWORD_RESET:
        if not CustomUser.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'No account found with this email address.'},
                status=status.HTTP_404_NOT_FOUND
            )

    # For registration — email must NOT already exist
    if purpose == OTPVerification.PURPOSE_REGISTRATION:
        if CustomUser.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'An account with this email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Generate and send OTP
    otp = OTPVerification.generate(email, purpose)

    try:
        _send_otp_email(email, otp.otp_code, purpose)
    except Exception as e:
        # In development with console backend, this won't fail.
        # Log for debugging.
        print(f"[SareeShala] Email send error: {e}")
        return Response(
            {'error': 'Failed to send OTP. Check email configuration.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response({'message': f'OTP sent to {email}.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  OTP – Verify (standalone check, no side effects)
# ─────────────────────────────────────────────

def _verify_otp(email, otp_code, purpose):
    """
    Internal helper — verifies OTP.
    Returns (True, otp_obj) or (False, error_message).
    """
    try:
        otp = OTPVerification.objects.filter(
            email__iexact=email,
            purpose=purpose,
            is_used=False,
        ).latest('created_at')
    except OTPVerification.DoesNotExist:
        return False, 'No OTP found for this email. Please request a new one.'

    if otp.is_expired():
        return False, 'OTP has expired. Please request a new one.'

    if otp.otp_code != str(otp_code).strip():
        return False, 'Invalid OTP. Please check and try again.'

    return True, otp


# ─────────────────────────────────────────────
#  Register (with OTP verification)
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/users/register/
    Body: { username, email, password, first_name, last_name, phone_number, otp_code }
    """
    data = request.data

    required = ['username', 'email', 'password', 'otp_code']
    for field in required:
        if not data.get(field):
            return Response({'error': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify OTP before creating account
    ok, result = _verify_otp(
        email=data['email'],
        otp_code=data['otp_code'],
        purpose=OTPVerification.PURPOSE_REGISTRATION,
    )
    if not ok:
        return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username=data['username']).exists():
        return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email__iexact=data['email']).exists():
        return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    # Mark OTP as used
    result.is_used = True
    result.save()

    user = CustomUser.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        phone_number=data.get('phone_number', ''),
    )

    send_welcome_email(user)

    tokens = get_tokens(user)
    return Response({
        'username':   user.username,
        'first_name': user.first_name,
        'last_name':  user.last_name,
        'email':      user.email,
        **tokens,
    }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────
#  Login
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/users/login/
    Body: { username, password }  (username can be email too)
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if not user:
        try:
            user_obj = CustomUser.objects.get(email__iexact=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except CustomUser.DoesNotExist:
            user = None

    if not user:
        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'error': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)

    tokens = get_tokens(user)
    return Response({
        'username':   user.username,
        'first_name': user.first_name,
        'last_name':  user.last_name,
        'email':      user.email,
        'is_staff':   user.is_staff,
        **tokens,
    })


# ─────────────────────────────────────────────
#  Google Login
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    POST /api/users/google/
    Body: { token } (Google ID Token or Access Token)
    """
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Try as ID token first
        idinfo = None
        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                idinfo = None
        except Exception:
            idinfo = None

        if not idinfo:
            # Try as access token
            resp = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'},
                timeout=10
            )
            if not resp.ok:
                return Response({'error': 'Invalid Google token or failed to fetch user info.'}, status=status.HTTP_400_BAD_REQUEST)
            idinfo = resp.json()

        email = idinfo.get('email')
        if not email:
            return Response({'error': 'Google account did not provide an email.'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        
        try:
            user = CustomUser.objects.get(email__iexact=email)
        except CustomUser.DoesNotExist:
            # Create a new user
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=get_random_string(16),
                first_name=first_name,
                last_name=last_name,
            )
            send_welcome_email(user)
            
        tokens = get_tokens(user)
        return Response({
            'username':   user.username,
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'email':      user.email,
            'is_staff':   user.is_staff,
            **tokens,
        })
    except Exception as e:
        print(f"[Google Auth Error] {str(e)}")
        traceback.print_exc()
        return Response({'error': f'Internal server error during Google login: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
#  Password Reset (with OTP)
# ─────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    POST /api/users/reset-password/
    Body: { email, otp_code, new_password }
    """
    email        = request.data.get('email', '').strip().lower()
    otp_code     = request.data.get('otp_code', '').strip()
    new_password = request.data.get('new_password', '')

    if not email or not otp_code or not new_password:
        return Response({'error': 'email, otp_code, and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    ok, result = _verify_otp(email, otp_code, OTPVerification.PURPOSE_PASSWORD_RESET)
    if not ok:
        return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        return Response({'error': 'No account found with this email.'}, status=status.HTTP_404_NOT_FOUND)

    # Mark OTP used & set new password
    result.is_used = True
    result.save()
    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successful. You can now log in.'})


# ─────────────────────────────────────────────
#  Profile endpoints
# ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'username':     user.username,
        'first_name':   user.first_name,
        'last_name':    user.last_name,
        'email':        user.email,
        'phone_number': user.phone_number,
        'address':      user.address,
        'date_joined':  user.date_joined.strftime('%d %b %Y'),
        'stats': {
            'total_orders': Order.objects.filter(user=user).count(),
            'wishlist_count': Wishlist.objects.filter(user=user).count(),
            'review_count': Review.objects.filter(user=user).count(),
            'delivered_count': Order.objects.filter(user=user, status='DELIVERED').count(),
        }
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    for field in ['first_name', 'last_name', 'phone_number', 'address']:
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()
    return Response({'message': 'Profile updated successfully.'})

# ─────────────────────────────────────────────
#  Wishlist
# ─────────────────────────────────────────────
from products.models import Product
from .models import Wishlist

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    user = request.user
    if request.method == 'GET':
        items = Wishlist.objects.filter(user=user).select_related('product')
        data = []
        for item in items:
            product = item.product
            data.append({
                'id': product.id,
                'name': product.name,
                'price': str(product.price),
                'image1': request.build_absolute_uri(product.image1.url) if product.image1 else product.image1_url,
            })
        return Response(data)
    
    elif request.method == 'POST':
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        wishlist_item, created = Wishlist.objects.get_or_create(user=user, product=product)
        if not created:
            # Toggle behavior: remove if it exists
            wishlist_item.delete()
            return Response({'message': 'Removed from wishlist', 'liked': False})
        return Response({'message': 'Added to wishlist', 'liked': True})

# ─────────────────────────────────────────────
#  Admin User Management
# ─────────────────────────────────────────────

from rest_framework.decorators import authentication_classes
from orders.models import Order, CartItem

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_user_details(request, user_id):
    """
    GET /api/users/admin/users/<id>/details/
    """
    auth_header = request.headers.get('Authorization', '')
    if 'admin_token_123' not in auth_header:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            if user_auth_tuple is None or not user_auth_tuple[0].is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(id=user_id)
        
        # Gather Orders
        orders = Order.objects.filter(user=user).prefetch_related('items__product').order_by('-created_at')
        total_spent = sum(o.total_amount for o in orders)
        
        orders_data = []
        for o in orders:
            items_data = []
            for item in o.items.all():
                image_url = None
                if item.product and item.product.image1:
                    image_url = request.build_absolute_uri(item.product.image1.url)
                elif item.product and item.product.image1_url:
                    image_url = item.product.image1_url
                    
                items_data.append({
                    'id': item.id,
                    'product_id': item.product.id if item.product else None,
                    'product_name': item.product.name if item.product else 'Unknown Product',
                    'quantity': item.quantity,
                    'price': str(item.price_at_purchase),
                    'image': image_url
                })
                
            orders_data.append({
                'id': o.id,
                'status': o.status,
                'total_amount': o.total_amount,
                'created_at': o.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'items': items_data
            })
        
        # Gather Cart & Wishlist
        cart_items = CartItem.objects.filter(user=user).select_related('product')
        cart_data = [{
            'id': c.id,
            'product_id': c.product.id,
            'product_name': c.product.name,
            'quantity': c.quantity,
            'price': str(c.product.price),
            'added_at': c.added_at.strftime('%Y-%m-%d %H:%M:%S'),
            'image': request.build_absolute_uri(c.product.image1.url) if c.product and c.product.image1 else (c.product.image1_url if c.product else None)
        } for c in cart_items]
        
        wishlist_items = Wishlist.objects.filter(user=user).select_related('product')
        wishlist_data = [{
            'id': w.id,
            'product_id': w.product.id,
            'product_name': w.product.name,
            'price': str(w.product.price),
            'added_at': w.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'image': request.build_absolute_uri(w.product.image1.url) if w.product and w.product.image1 else (w.product.image1_url if w.product else None)
        } for w in wishlist_items]
        
        return Response({
            'profile': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'address': user.address,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
            },
            'stats': {
                'total_orders': orders.count(),
                'total_spent': total_spent,
                'cart_items': len(cart_data),
                'wishlist_items': len(wishlist_data),
            },
            'all_orders': orders_data,
            'cart_items': cart_data,
            'wishlist_items': wishlist_data,
            'recent_orders': orders_data[:5] # send top 5 recent
        })
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_get_users(request):
    """
    GET /api/users/admin/users/
    """
    auth_header = request.headers.get('Authorization', '')
    if 'admin_token_123' not in auth_header:
        # We also support real admin users
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            if user_auth_tuple is None or not user_auth_tuple[0].is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    users = CustomUser.objects.all().order_by('-date_joined')
    data = []
    for u in users:
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'is_active': u.is_active,
            'is_staff': u.is_staff,
            'date_joined': u.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
        })
    return Response(data)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_toggle_user(request, user_id):
    """
    POST /api/users/admin/users/<id>/toggle-block/
    """
    auth_header = request.headers.get('Authorization', '')
    if 'admin_token_123' not in auth_header:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            if user_auth_tuple is None or not user_auth_tuple[0].is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(id=user_id)
        if user.is_superuser:
            return Response({'error': 'Cannot modify superuser.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_active = not user.is_active
        user.save()
        return Response({'message': f'User {"unblocked" if user.is_active else "blocked"} successfully.', 'is_active': user.is_active})
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_delete_user(request, user_id):
    """
    DELETE /api/users/admin/users/<id>/
    """
    auth_header = request.headers.get('Authorization', '')
    if 'admin_token_123' not in auth_header:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            if user_auth_tuple is None or not user_auth_tuple[0].is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(id=user_id)
        if user.is_superuser:
            return Response({'error': 'Cannot delete superuser.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': 'User deleted successfully.'})
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

