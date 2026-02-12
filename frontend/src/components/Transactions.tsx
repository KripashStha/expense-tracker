import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionAPI, incomeAPI, expenseAPI, categoryAPI } from '../api';
import { useAuth } from '../AuthContext';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    category: string | null;
    date: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
    category_type: string;
}

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { username, logout } = useAuth();

    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingType, setEditingType] = useState<string>('');
    const [editForm, setEditForm] = useState({ amount: '', category: '', date: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transRes, catRes] = await Promise.all([
                transactionAPI.getAll(),
                categoryAPI.getAll()
            ]);
            setTransactions(transRes.data);
            setCategories(catRes.data);
        } catch (err) {
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterCategory) params.category = filterCategory;
            if (filterType) params.type = filterType;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const response = await transactionAPI.getAll(params);
            setTransactions(response.data);
        } catch (err) {
            setError('Failed to filter transactions');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilterCategory('');
        setFilterType('');
        setStartDate('');
        setEndDate('');
        fetchData();
    };

    const handleDelete = async (id: number, type: string) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;

        try {
            if (type === 'income') {
                await incomeAPI.delete(id);
            } else {
                await expenseAPI.delete(id);
            }
            setTransactions(transactions.filter(t => !(t.id === id && t.type === type)));
        } catch (err) {
            alert('Failed to delete transaction');
        }
    };

    const startEdit = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setEditingType(transaction.type);
        setEditForm({
            amount: transaction.amount.toString(),
            category: transaction.category || '',
            date: transaction.date,
            description: transaction.description
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingType('');
        setEditForm({ amount: '', category: '', date: '', description: '' });
    };

    const saveEdit = async () => {
        try {
            const data = {
                amount: parseFloat(editForm.amount),
                category: editForm.category || undefined,
                date: editForm.date,
                description: editForm.description
            };

            if (editingType === 'income') {
                await incomeAPI.update(editingId!, data);
            } else {
                await expenseAPI.update(editingId!, data);
            }

            fetchData();
            cancelEdit();
        } catch (err: any) {
            alert(err.response?.data?.category?.[0] || 'Failed to update transaction');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard">
            <header className="header">
                <h1>Clarity</h1>
                <div className="header-right">
                    <span>Welcome, {username}</span>
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </header>

            <nav className="nav">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/transactions" className="nav-link active">Transactions</Link>
                <Link to="/add-income" className="nav-link">Add Income</Link>
                <Link to="/add-expense" className="nav-link">Add Expense</Link>
                <Link to="/categories" className="nav-link">Categories</Link>
            </nav>

            <main className="main-content">
                <h2>All Transactions</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="filters">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Category</label>
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Type</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="">All</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-buttons">
                            <button onClick={applyFilters} className="btn-primary">Filter</button>
                            <button onClick={clearFilters} className="btn-secondary">Clear</button>
                        </div>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <p className="no-data">No transactions found</p>
                ) : (
                    <div className="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={`${t.type}-${t.id}`}>
                                        {editingId === t.id && editingType === t.type ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="date"
                                                        value={editForm.date}
                                                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                    />
                                                </td>
                                                <td className={t.type}>{t.type}</td>
                                                <td>
                                                    <select
                                                        value={editForm.category}
                                                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                    >
                                                        <option value="">None</option>
                                                        {categories
                                                            .filter(c => c.category_type === t.type)
                                                            .map(cat => (
                                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editForm.amount}
                                                        onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                                    />
                                                </td>
                                                <td>
                                                    <button onClick={saveEdit} className="btn-small btn-save">Save</button>
                                                    <button onClick={cancelEdit} className="btn-small btn-cancel">Cancel</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{t.date}</td>
                                                <td className={t.type}>{t.type}</td>
                                                <td>{t.category || '-'}</td>
                                                <td>{t.description || '-'}</td>
                                                <td className={`amount ${t.type}`}>
                                                    {t.type === 'income' ? '+' : '-'} Rs. {Number(t.amount).toFixed(2)}
                                                </td>
                                                <td>
                                                    <button onClick={() => startEdit(t)} className="btn-small btn-edit">Edit</button>
                                                    <button onClick={() => handleDelete(t.id, t.type)} className="btn-small btn-delete">Delete</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Transactions;
