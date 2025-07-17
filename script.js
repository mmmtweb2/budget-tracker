// הגדרות בסיסיות
var PASSWORD = 'MyBudget2025';
var incomes = [];
var expenses = [];
var comparisonChart = null;
var categoryChart = null;

// קטגוריות הוצאות
var categories = {
    'חיוני': '#ef4444',
    'חשוב': '#f97316',
    'רצוי': '#eab308',
    'בזבוז': '#84cc16'
};

// פונקציות אתחול
function init() {
    var isAuthenticated = localStorage.getItem('budget_auth') === 'true';
    if (isAuthenticated) {
        showMainApp();
        loadData();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

// פונקציות התחברות
function login() {
    var password = document.getElementById('passwordInput').value;
    if (password === PASSWORD) {
        localStorage.setItem('budget_auth', 'true');
        showMainApp();
        loadData();
        document.getElementById('passwordInput').value = '';
    } else {
        alert('סיסמה שגויה');
        document.getElementById('passwordInput').value = '';
    }
}

function logout() {
    localStorage.removeItem('budget_auth');
    incomes = [];
    expenses = [];
    showLoginScreen();
}

// פונקציות שמירה וטעינה
function loadData() {
    try {
        var savedIncomes = localStorage.getItem('budget_incomes');
        var savedExpenses = localStorage.getItem('budget_expenses');

        if (savedIncomes) {
            incomes = JSON.parse(savedIncomes);
        }
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
        }

        updateAll();
    } catch (e) {
        console.error('שגיאה בטעינת נתונים:', e);
    }
}

function saveData() {
    try {
        localStorage.setItem('budget_incomes', JSON.stringify(incomes));
        localStorage.setItem('budget_expenses', JSON.stringify(expenses));
    } catch (e) {
        console.error('שגיאה בשמירת נתונים:', e);
    }
}

// פונקציות הוספת נתונים
function addIncome() {
    var description = document.getElementById('incomeDescription').value.trim();
    var amount = parseFloat(document.getElementById('incomeAmount').value);

    if (!description || !amount || amount <= 0) {
        alert('אנא מלא את כל השדות בצורה תקינה');
        return;
    }

    incomes.push({
        id: Date.now(),
        description: description,
        amount: amount
    });

    document.getElementById('incomeDescription').value = '';
    document.getElementById('incomeAmount').value = '';

    updateAll();
    saveData();
}

function addExpense() {
    var description = document.getElementById('expenseDescription').value.trim();
    var category = document.getElementById('expenseCategory').value;
    var amount = parseFloat(document.getElementById('expenseAmount').value);

    if (!description || !amount || amount <= 0) {
        alert('אנא מלא את כל השדות בצורה תקינה');
        return;
    }

    expenses.push({
        id: Date.now(),
        description: description,
        category: category,
        amount: amount
    });

    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';

    updateAll();
    saveData();
}

// פונקציות מחיקה
function removeIncome(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
        incomes = incomes.filter(function (item) {
            return item.id !== id;
        });
        updateAll();
        saveData();
    }
}

function removeExpense(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
        expenses = expenses.filter(function (item) {
            return item.id !== id;
        });
        updateAll();
        saveData();
    }
}

// פונקציות עדכון תצוגה
function updateAll() {
    updateSummary();
    updateLists();
    updateCharts();
}

function updateSummary() {
    var totalIncome = 0;
    var totalExpenses = 0;

    for (var i = 0; i < incomes.length; i++) {
        totalIncome += incomes[i].amount;
    }

    for (var i = 0; i < expenses.length; i++) {
        totalExpenses += expenses[i].amount;
    }

    var balance = totalIncome - totalExpenses;

    document.getElementById('totalIncome').textContent = totalIncome.toLocaleString();
    document.getElementById('totalExpenses').textContent = totalExpenses.toLocaleString();
    document.getElementById('balance').textContent = balance.toLocaleString();

    var balanceCard = document.getElementById('balanceCard');
    if (balance < 0) {
        balanceCard.classList.add('negative');
    } else {
        balanceCard.classList.remove('negative');
    }
}

function updateLists() {
    updateIncomeList();
    updateExpenseList();
}

function updateIncomeList() {
    var incomeList = document.getElementById('incomeList');
    incomeList.innerHTML = '';

    if (incomes.length === 0) {
        incomeList.innerHTML = '<div class="empty-state">אין הכנסות להצגה</div>';
        return;
    }

    for (var i = 0; i < incomes.length; i++) {
        var income = incomes[i];
        var item = document.createElement('div');
        item.className = 'item';

        var content = document.createElement('div');
        content.className = 'item-content';

        var description = document.createElement('div');
        description.className = 'item-description';
        description.textContent = income.description;

        var amount = document.createElement('div');
        amount.className = 'item-amount';
        amount.textContent = income.amount.toLocaleString() + ' ש"ח';

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = 'מחק';
        deleteBtn.onclick = createDeleteHandler(income.id, 'income');

        content.appendChild(description);
        content.appendChild(amount);
        item.appendChild(content);
        item.appendChild(deleteBtn);
        incomeList.appendChild(item);
    }
}

function updateExpenseList() {
    var expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    if (expenses.length === 0) {
        expenseList.innerHTML = '<div class="empty-state">אין הוצאות להצגה</div>';
        return;
    }

    for (var i = 0; i < expenses.length; i++) {
        var expense = expenses[i];
        var item = document.createElement('div');
        item.className = 'item';

        var content = document.createElement('div');
        content.className = 'item-content';

        var description = document.createElement('div');
        description.className = 'item-description';
        description.textContent = expense.description;

        var categorySpan = document.createElement('span');
        categorySpan.className = 'item-category';
        categorySpan.style.backgroundColor = categories[expense.category];
        categorySpan.textContent = expense.category;

        var amount = document.createElement('div');
        amount.className = 'item-amount';
        amount.textContent = expense.amount.toLocaleString() + ' ש"ח';

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = 'מחק';
        deleteBtn.onclick = createDeleteHandler(expense.id, 'expense');

        content.appendChild(description);
        description.appendChild(categorySpan);
        content.appendChild(amount);
        item.appendChild(content);
        item.appendChild(deleteBtn);
        expenseList.appendChild(item);
    }
}

function createDeleteHandler(id, type) {
    return function () {
        if (type === 'income') {
            removeIncome(id);
        } else {
            removeExpense(id);
        }
    };
}

// פונקציות גרפים
function updateCharts() {
    updateComparisonChart();
    updateCategoryChart();
}

function updateComparisonChart() {
    var ctx = document.getElementById('comparisonChart').getContext('2d');

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    var totalIncome = 0;
    var totalExpenses = 0;

    for (var i = 0; i < incomes.length; i++) {
        totalIncome += incomes[i].amount;
    }

    for (var i = 0; i < expenses.length; i++) {
        totalExpenses += expenses[i].amount;
    }

    var balance = totalIncome - totalExpenses;

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['הכנסות', 'הוצאות', 'יתרה'],
            datasets: [{
                data: [totalIncome, totalExpenses, Math.abs(balance)],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    balance >= 0 ? '#10b981' : '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCategoryChart() {
    var ctx = document.getElementById('categoryChart').getContext('2d');

    if (categoryChart) {
        categoryChart.destroy();
    }

    var categoryTotals = {};

    for (var i = 0; i < expenses.length; i++) {
        var category = expenses[i].category;
        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }
        categoryTotals[category] += expenses[i].amount;
    }

    var labels = [];
    var data = [];
    var colors = [];

    for (var category in categoryTotals) {
        if (categoryTotals[category] > 0) {
            labels.push(category);
            data.push(categoryTotals[category]);
            colors.push(categories[category]);
        }
    }

    if (data.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('אין נתונים להצגה', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// מאזיני אירועים
document.addEventListener('DOMContentLoaded', function () {
    init();

    // כפתורים
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addIncomeBtn').addEventListener('click', addIncome);
    document.getElementById('addExpenseBtn').addEventListener('click', addExpense);

    // מקלדת
    document.getElementById('passwordInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    document.getElementById('incomeAmount').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addIncome();
        }
    });

    document.getElementById('expenseAmount').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addExpense();
        }
    });
});