from django.contrib import admin
from .models import Income, Expense, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'user', 'is_default']
    list_filter = ['category_type', 'is_default']
    search_fields = ['name']


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'category', 'date', 'description']
    list_filter = ['date', 'category']
    search_fields = ['description']
    date_hierarchy = 'date'


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'category', 'date', 'description']
    list_filter = ['date', 'category']
    search_fields = ['description']
    date_hierarchy = 'date'