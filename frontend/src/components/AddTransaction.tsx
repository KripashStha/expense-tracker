import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { incomeAPI, expenseAPI, categoryAPI } from '../api';
import { useAuth } from '../AuthContext';

interface Category {
    id: number;
    name: string;
    category_type: string;
}

interface AddTransactionProps {
    type: 'income' | 'expense';
}

const AddTransaction: React.FC<AddTransactionProps> = ({ type }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { username, logout } = useAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                setCategories(response.data.filter((c: Category) => c.category_type === type));
            } catch (err) {
                console.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = {
                amount: parseFloat(amount),
                category: category || undefined,
                date,
                description
            };

            if (type === 'income') {
                await incomeAPI.create(data);
            } else {
                await expenseAPI.create(data);
            }

            navigate('/transactions');
        } catch (err: any) {
            setError(err.response?.data?.category?.[0] || err.response?.data?.amount?.[0] || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

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
                <Link to="/transactions" className="nav-link">Transactions</Link>
                <Link to="/add-income" className={`nav-link ${type === 'income' ? 'active' : ''}`}>Add Income</Link>
                <Link to="/add-expense" className={`nav-link ${type === 'expense' ? 'active' : ''}`}>Add Expense</Link>
                <Link to="/categories" className="nav-link">Categories</Link>
            </nav>

            <main className="main-content">
                <h2>Add {type === 'income' ? 'Income' : 'Expense'}</h2>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label>Amount (Rs.)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="">Select category (optional)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <small>Don't see your category? <Link to="/categories">Add one</Link></small>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description (optional)"
                                maxLength={500}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className={`btn-primary ${type}`}>
                                {loading ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
                            </button>
                            <button type="button" onClick={() => navigate('/transactions')} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddTransaction;
