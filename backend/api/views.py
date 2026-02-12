from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, IncomeSerializer, ExpenseSerializer, CategorySerializer, TransactionSerializer
from .models import Income, Expense, Category
from rest_framework.permissions import IsAuthenticated, AllowAny


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Category.objects.filter(is_default=True) | Category.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Category.objects.filter(user=user)


# Income Views
class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Income.objects.filter(user=user)
        
        category = self.request.query_params.get('category')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Income.objects.filter(user=user)


# Expense Views
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Expense.objects.filter(user=user)
        
        category = self.request.query_params.get('category')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Expense.objects.filter(user=user)


# All Transactions View
class TransactionsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        category = request.query_params.get('category')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type')
        
        incomes = Income.objects.filter(user=user)
        expenses = Expense.objects.filter(user=user)
        
        if category:
            incomes = incomes.filter(category__name__iexact=category)
            expenses = expenses.filter(category__name__iexact=category)
        if start_date:
            incomes = incomes.filter(date__gte=start_date)
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            incomes = incomes.filter(date__lte=end_date)
            expenses = expenses.filter(date__lte=end_date)
        
        income_data = []
        expense_data = []
        
        if transaction_type != 'expense':
            income_data = [
                {
                    'id': item.id,
                    'type': 'income',
                    'amount': item.amount,
                    'category': item.category.name if item.category else None,
                    'date': item.date,
                    'description': item.description,
                    'created_at': item.created_at,
                    'updated_at': item.updated_at,
                }
                for item in incomes
            ]
        
        if transaction_type != 'income':
            expense_data = [
                {
                    'id': item.id,
                    'type': 'expense',
                    'amount': item.amount,
                    'category': item.category.name if item.category else None,
                    'date': item.date,
                    'description': item.description,
                    'created_at': item.created_at,
                    'updated_at': item.updated_at,
                }
                for item in expenses
            ]
        
        all_transactions = income_data + expense_data
        all_transactions.sort(key=lambda x: x['date'], reverse=True)
        
        serializer = TransactionSerializer(all_transactions, many=True)
        return Response(serializer.data)


# Dashboard View
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date:
            start_date = today.replace(day=1)
        if not end_date:
            end_date = today
        
        incomes = Income.objects.filter(user=user, date__gte=start_date, date__lte=end_date)
        expenses = Expense.objects.filter(user=user, date__gte=start_date, date__lte=end_date)
        
        total_income = incomes.aggregate(total=Sum('amount'))['total'] or 0
        total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0
        balance = total_income - total_expense
        
        expense_by_category = expenses.values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        income_by_category = incomes.values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        recent_transactions = []
        for item in incomes.order_by('-date')[:5]:
            recent_transactions.append({
                'id': item.id,
                'type': 'income',
                'amount': item.amount,
                'category': item.category.name if item.category else None,
                'date': item.date,
                'description': item.description,
            })
        for item in expenses.order_by('-date')[:5]:
            recent_transactions.append({
                'id': item.id,
                'type': 'expense',
                'amount': item.amount,
                'category': item.category.name if item.category else None,
                'date': item.date,
                'description': item.description,
            })
        recent_transactions.sort(key=lambda x: x['date'], reverse=True)
        recent_transactions = recent_transactions[:5]
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date,
            },
            'summary': {
                'total_income': total_income,
                'total_expense': total_expense,
                'balance': balance,
            },
            'expense_by_category': [
                {'category': item['category__name'] or 'Uncategorized', 'total': item['total']}
                for item in expense_by_category
            ],
            'income_by_category': [
                {'category': item['category__name'] or 'Uncategorized', 'total': item['total']}
                for item in income_by_category
            ],
            'recent_transactions': recent_transactions,
        })