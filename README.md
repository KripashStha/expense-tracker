# Clarity - Personal Expense Tracker

A full-stack expense tracking application to help you understand your finances better.

## Features

- **Add Expenses & Income** - Track transactions with amount, category, date, and description
- **Edit & Delete Transactions** - Modify or remove entries as needed
- **View All Transactions** - See your complete transaction history
- **Filter by Category or Date Range** - Find specific transactions easily
- **Dashboard** - Overview of your spending with summary cards and category breakdowns
- **Email-based Authentication** - Secure login with JWT tokens

## Tech Stack

**Backend:**
- Django 6.0
- Django REST Framework
- SimpleJWT for authentication
- PostgreSQL (production) / SQLite (development)

**Frontend:**
- React 18 with TypeScript
- Axios for API calls
- React Router for navigation

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/KripashStha/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

```bash
# Run migrations
python manage.py migrate

# Start the backend server
python manage.py runserver
```

The backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Register a new account with your email
3. Log in with your credentials
4. Start tracking your expenses and income!
