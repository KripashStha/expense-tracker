import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../api';
import { useAuth } from '../AuthContext';

interface Category {
    id: number;
    name: string;
    category_type: string;
    is_default: boolean;
}

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { username, logout } = useAuth();

    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');
    const [addError, setAddError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');

        if (!newName.trim()) {
            setAddError('Category name is required');
            return;
        }

        try {
            await categoryAPI.create(newName.trim(), newType);
            setNewName('');
            fetchCategories();
        } catch (err: any) {
            setAddError(err.response?.data?.name?.[0] || 'Failed to create category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryAPI.delete(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const incomeCategories = categories.filter(c => c.category_type === 'income');
    const expenseCategories = categories.filter(c => c.category_type === 'expense');

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
                <Link to="/transactions" className="nav-link">Transactions</Link>
                <Link to="/add-income" className="nav-link">Add Income</Link>
                <Link to="/add-expense" className="nav-link">Add Expense</Link>
                <Link to="/categories" className="nav-link active">Categories</Link>
            </nav>

            <main className="main-content">
                <h2>Manage Categories</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="add-category-form">
                    <h3>Add New Category</h3>
                    <form onSubmit={handleAdd}>
                        {addError && <div className="error-message">{addError}</div>}
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter category name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Type</label>
                                <select value={newType} onChange={(e) => setNewType(e.target.value as 'income' | 'expense')}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-primary">Add Category</button>
                        </div>
                    </form>
                </div>

                <div className="categories-grid">
                    <div className="category-section">
                        <h3>Income Categories</h3>
                        {incomeCategories.length === 0 ? (
                            <p className="no-data">No income categories</p>
                        ) : (
                            <ul className="category-list-manage">
                                {incomeCategories.map(cat => (
                                    <li key={cat.id}>
                                        <span>{cat.name}</span>
                                        {!cat.is_default && (
                                            <button 
                                                onClick={() => handleDelete(cat.id)} 
                                                className="btn-small btn-delete"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="category-section">
                        <h3>Expense Categories</h3>
                        {expenseCategories.length === 0 ? (
                            <p className="no-data">No expense categories</p>
                        ) : (
                            <ul className="category-list-manage">
                                {expenseCategories.map(cat => (
                                    <li key={cat.id}>
                                        <span>{cat.name}</span>
                                        {!cat.is_default && (
                                            <button 
                                                onClick={() => handleDelete(cat.id)} 
                                                className="btn-small btn-delete"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Categories;
