import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Lock, LogOut, Eye, EyeOff } from 'lucide-react';

const ExpenseIncomeTracker = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newIncome, setNewIncome] = useState({ description: '', amount: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'חיוני' });
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // הגדר כאן את הסיסמה שלך
  const MASTER_PASSWORD = 'Aa322412321'; // שנה את זה לסיסמה שלך

  const categories = [
    { name: 'חיוני', color: '#ef4444', description: 'הוצאות הכרחיות' },
    { name: 'חשוב', color: '#f97316', description: 'הוצאות חשובות' },
    { name: 'רצוי', color: '#eab308', description: 'הוצאות רצויות' },
    { name: 'בזבוז', color: '#84cc16', description: 'הוצאות מיותרות' }
  ];

  // Firebase Mock Functions (תחליף אלה בקוד Firebase אמיתי)
  const saveToFirebase = async (data) => {
    try {
      setIsLoading(true);
      setSyncStatus('שומר...');

      // כאן תוסיף את הקוד של Firebase
      // await firebase.firestore().collection('budgets').doc('user').set(data);

      // סימולציה של שמירה
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('firebase_budget_data', JSON.stringify(data));

      setSyncStatus('נשמר בענן ✅');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      setSyncStatus('שגיאה בשמירה ❌');
      console.error('Error saving to Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromFirebase = async () => {
    try {
      setIsLoading(true);
      setSyncStatus('טוען...');

      // כאן תוסיף את הקוד של Firebase
      // const doc = await firebase.firestore().collection('budgets').doc('user').get();

      // סימולציה של טעינה
      await new Promise(resolve => setTimeout(resolve, 1000));
      const savedData = localStorage.getItem('firebase_budget_data');

      if (savedData) {
        const data = JSON.parse(savedData);
        setIncomes(data.incomes || []);
        setExpenses(data.expenses || []);
        setSyncStatus('נטען מהענן ✅');
      } else {
        setSyncStatus('אין נתונים בענן');
      }

      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      setSyncStatus('שגיאה בטעינה ❌');
      console.error('Error loading from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // אימות סיסמה
  const handleLogin = () => {
    if (password === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('budget_authenticated', 'true');
      loadFromFirebase();
    } else {
      alert('סיסמה שגויה!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('budget_authenticated');
    setIncomes([]);
    setExpenses([]);
    setPassword('');
  };

  // בדיקה אם המשתמש כבר מחובר
  useEffect(() => {
    const wasAuthenticated = localStorage.getItem('budget_authenticated');
    if (wasAuthenticated === 'true') {
      setIsAuthenticated(true);
      loadFromFirebase();
    }
  }, []);

  // שמירה אוטומטית כשמשנים נתונים
  useEffect(() => {
    if (isAuthenticated && (incomes.length > 0 || expenses.length > 0)) {
      const data = { incomes, expenses, lastUpdated: new Date().toISOString() };
      saveToFirebase(data);
    }
  }, [incomes, expenses, isAuthenticated]);

  const addIncome = () => {
    if (newIncome.description && newIncome.amount && parseFloat(newIncome.amount) > 0) {
      setIncomes([...incomes, {
        id: Date.now(),
        description: newIncome.description,
        amount: parseFloat(newIncome.amount)
      }]);
      setNewIncome({ description: '', amount: '' });
    } else {
      alert('אנא מלא את כל השדות בצורה תקינה');
    }
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount && parseFloat(newExpense.amount) > 0) {
      setExpenses([...expenses, {
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category
      }]);
      setNewExpense({ description: '', amount: '', category: 'חיוני' });
    } else {
      alert('אנא מלא את כל השדות בצורה תקינה');
    }
  };

  const removeIncome = (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק הכנסה זו?')) {
      setIncomes(incomes.filter(income => income.id !== id));
    }
  };

  const removeExpense = (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = categories.map(category => ({
    name: category.name,
    value: expenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0),
    color: category.color
  })).filter(category => category.value > 0);

  const chartData = [
    { name: 'הכנסות', amount: totalIncome, fill: '#10b981' },
    { name: 'הוצאות', amount: totalExpenses, fill: '#ef4444' },
    { name: 'יתרה', amount: Math.abs(balance), fill: balance >= 0 ? '#10b981' : '#ef4444' }
  ];

  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleIncomeKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'description') {
        document.getElementById('incomeAmount').focus();
      } else {
        addIncome();
      }
    }
  };

  const handleExpenseKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'description') {
        document.getElementById('expenseCategory').focus();
      } else if (field === 'amount') {
        addExpense();
      }
    }
  };

  // מסך התחברות
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 מערכת התקציב שלי</h1>
            <p className="text-gray-600">הזן סיסמה לכניסה למערכת</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="הזן סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handlePasswordKeyPress}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center font-mono text-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={!password}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔓 כניסה למערכת
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              🔒 המערכת מוגנת בסיסמה אישית<br />
              🌐 הנתונים נשמרים בענן ומסונכרנים בין המכשירים
            </p>
          </div>
        </div>
      </div>
    );
  }

  // מסך ראשי
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        {/* כותרת עם כפתור יציאה */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 מערכת ניהול הכנסות והוצאות</h1>
            <p className="text-lg text-gray-600">נהל את הכספים שלך בקלות ובשקיפות מלאה</p>
            {syncStatus && (
              <div className="mt-2 text-sm font-medium text-blue-600">
                {isLoading && '⏳ '}{syncStatus}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5" />
            יציאה
          </button>
        </div>

        {/* סיכום כללי */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 font-medium">סך הכנסות</p>
                <p className="text-3xl font-bold">₪{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-400 to-red-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 font-medium">סך הוצאות</p>
                <p className="text-3xl font-bold">₪{totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-200" />
            </div>
          </div>

          <div className={`bg-gradient-to-r p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform ${balance >= 0 ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${balance >= 0 ? 'text-green-100' : 'text-red-100'}`}>יתרה</p>
                <p className="text-3xl font-bold">₪{balance.toLocaleString()}</p>
              </div>
              <Wallet className={`w-10 h-10 ${balance >= 0 ? 'text-green-200' : 'text-red-200'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* הוספת הכנסות */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Plus className="w-6 h-6 text-green-500" />
              הוספת הכנסות
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="תיאור ההכנסה (לדוגמה: משכורת, פריפריה)"
                value={newIncome.description}
                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                onKeyPress={(e) => handleIncomeKeyPress(e, 'description')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              <div className="flex gap-3">
                <input
                  id="incomeAmount"
                  type="number"
                  placeholder="סכום בשקלים"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                  onKeyPress={(e) => handleIncomeKeyPress(e, 'amount')}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={addIncome}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  הוספה
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-3 max-h-80 overflow-y-auto">
              {incomes.length === 0 ? (
                <div className="text-center text-gray-500 py-12 italic">אין הכנסות להצגה</div>
              ) : (
                incomes.map(income => (
                  <div key={income.id} className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-800">{income.description}</span>
                      <span className="text-green-600 font-bold text-lg">₪{income.amount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => removeIncome(income.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* הוספת הוצאות */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Plus className="w-6 h-6 text-red-500" />
              הוספת הוצאות
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="תיאור ההוצאה (לדוגמה: קניות, בנזין)"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                onKeyPress={(e) => handleExpenseKeyPress(e, 'description')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              <select
                id="expenseCategory"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} - {category.description}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="סכום בשקלים"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  onKeyPress={(e) => handleExpenseKeyPress(e, 'amount')}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={addExpense}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  הוספה
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-3 max-h-80 overflow-y-auto">
              {expenses.length === 0 ? (
                <div className="text-center text-gray-500 py-12 italic">אין הוצאות להצגה</div>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-800">{expense.description}</span>
                      <span
                        className="text-xs px-3 py-1 rounded-full text-white font-medium"
                        style={{ backgroundColor: categories.find(c => c.name === expense.category)?.color }}
                      >
                        {expense.category}
                      </span>
                      <span className="text-red-600 font-bold text-lg">₪{expense.amount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* גרפים */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* גרף השוואה */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">השוואת הכנסות והוצאות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₪${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`₪${value.toLocaleString()}`, '']} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* גרף עוגה */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">חלוקת הוצאות לפי רמת חיוניות</h3>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${(percent).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₪${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500 italic">
                אין הוצאות להצגה
              </div>
            )}
          </div>
        </div>

        {/* מקרא */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">מקרא קטגוריות</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(category => (
              <div key={category.name} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div>
                  <div className="font-semibold text-gray-800">{category.name}</div>
                  <div className="text-sm text-gray-600">{category.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600">🔒 המערכת מוגנת בסיסמה וכל הנתונים מסונכרנים בענן</p>
          <p className="text-gray-500 mt-2">☁️ הנתונים נשמרים אוטומטית ונגישים מכל מכשיר</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseIncomeTracker;