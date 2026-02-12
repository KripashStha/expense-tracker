from django.contrib.auth.models import User 
from rest_framework import serializers
from .models import Income, Expense, Category


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'category_type', 'is_default']
        read_only_fields = ['is_default']


class IncomeSerializer(serializers.ModelSerializer):
    category = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = Income
        fields = ['id', 'amount', 'category', 'date', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_category(self, value):
        if not value:
            return None
        user = self.context['request'].user
        try:
            category = Category.objects.get(
                name__iexact=value,
                category_type='income'
            )
            if category.user is not None and category.user != user:
                raise serializers.ValidationError("Category not found")
            return category
        except Category.DoesNotExist:
            raise serializers.ValidationError(f"Category '{value}' not found for income")

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category'] = instance.category.name if instance.category else None
        return data


class ExpenseSerializer(serializers.ModelSerializer):
    category = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'amount', 'category', 'date', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_category(self, value):
        if not value:
            return None
        user = self.context['request'].user
        try:
            category = Category.objects.get(
                name__iexact=value,
                category_type='expense'
            )
            if category.user is not None and category.user != user:
                raise serializers.ValidationError("Category not found")
            return category
        except Category.DoesNotExist:
            raise serializers.ValidationError(f"Category '{value}' not found for expense")

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category'] = instance.category.name if instance.category else None
        return data


class TransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    category = serializers.CharField(allow_null=True)
    date = serializers.DateField()
    description = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()