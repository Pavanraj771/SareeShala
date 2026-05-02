from rest_framework import serializers
from .models import Product, Category, Review

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_initial = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'user_initial', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

    def get_user_initial(self, obj):
        return obj.user.username[0].upper() if obj.user.username else 'U'
