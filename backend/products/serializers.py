from rest_framework import serializers
from .models import Product, Category, Review

class ProductSerializer(serializers.ModelSerializer):
    color_variants = serializers.SerializerMethodField()
    total_sales = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_color_variants(self, obj):
        # Find the root product (either the parent or itself if it has no parent)
        root = obj.parent_product if obj.parent_product else obj
        
        # Get all variants belonging to the same parent, plus the parent itself in memory
        variants = [root] + list(root.variants.all())
        
        return [
            {'id': v.id, 'color_name': v.color_name, 'color_hex': v.color_hex} 
            for v in variants 
            if v.color_name or v.color_hex
        ]

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_initial = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'user_initial', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

    def get_user_initial(self, obj):
        return obj.user.username[0].upper() if obj.user.username else 'U'
