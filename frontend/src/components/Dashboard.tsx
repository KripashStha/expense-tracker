import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { useAuth } from '../AuthContext';

interface DashboardData {
    period: {
        start_date: string;
        end_date: string;
    };
    summary: {
        total_income: number;
        total_expense: number;
        balance: number;
    };
    expense_by_category: Array<{ category: string; total: number }>;
    income_by_category: Array<{ category: string; total: number }>;
    recent_transactions: Array<{
        id: number;
        type: string;
        amount: number;
        category: string | null;
        date: string;
        description: string;
    }>;
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await dashboardAPI.get();
            setData(response.data);
        } catch (err) {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!data) return null;

    return (
        <div className="dashboard">
            <header className="header">
                <h1>Clarity</h1>
                <div className="header-right">
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </header>

            <nav className="nav">
                <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                <Link to="/transactions" className="nav-link">Transactions</Link>
                <Link to="/add-income" className="nav-link">Add Income</Link>
                <Link to="/add-expense" className="nav-link">Add Expense</Link>
                <Link to="/categories" className="nav-link">Categories</Link>
            </nav>

            <main className="main-content">
                <h2>Spending Overview</h2>
                <p className="period">
                    {data.period.start_date} to {data.period.end_date}
                </p>

                <div className="summary-cards">
                    <div className="card income-card">
                        <h3>Total Income</h3>
                        <p className="amount">Rs. {Number(data.summary.total_income).toFixed(2)}</p>
                    </div>
                    <div className="card expense-card">
                        <h3>Total Expenses</h3>
                        <p className="amount">Rs. {Number(data.summary.total_expense).toFixed(2)}</p>
                    </div>
                    <div className={`card balance-card ${Number(data.summary.balance) >= 0 ? 'positive' : 'negative'}`}>
                        <h3>Balance</h3>
                        <p className="amount">Rs. {Number(data.summary.balance).toFixed(2)}</p>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="category-breakdown">
                        <h3>Expenses by Category</h3>
                        {data.expense_by_category.length === 0 ? (
                            <p className="no-data">No expenses yet</p>
                        ) : (
                            <ul className="category-list">
                                {data.expense_by_category.map((item, index) => (
                                    <li key={index}>
                                        <span className="category-name">{item.category}</span>
                                        <span className="category-amount">Rs. {Number(item.total).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="category-breakdown">
                        <h3>Income by Category</h3>
                        {data.income_by_category.length === 0 ? (
                            <p className="no-data">No income yet</p>
                        ) : (
                            <ul className="category-list">
                                {data.income_by_category.map((item, index) => (
                                    <li key={index}>
                                        <span className="category-name">{item.category}</span>
                                        <span className="category-amount">Rs. {Number(item.total).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="recent-transactions">
                    <h3>Recent Transactions</h3>
                    {data.recent_transactions.length === 0 ? (
                        <p className="no-data">No transactions yet</p>
                    ) : (
                        <ul className="transaction-list">
                            {data.recent_transactions.map((item) => (
                                <li key={`${item.type}-${item.id}`} className={`transaction-item ${item.type}`}>
                                    <div className="transaction-info">
                                        <span className="transaction-desc">{item.description || 'No description'}</span>
                                        <span className="transaction-category">{item.category || 'Uncategorized'}</span>
                                    </div>
                                    <div className="transaction-details">
                                        <span className={`transaction-amount ${item.type}`}>
                                            {item.type === 'income' ? '+' : '-'} Rs. {Number(item.amount).toFixed(2)}
                                        </span>
                                        <span className="transaction-date">{item.date}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
