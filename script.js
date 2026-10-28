
const budgetForm = document.getElementById("budgetForm");
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const filterCategory = document.getElementById("filterCategory");

let budget = Number(localStorage.getItem("studentBudget")) || 0;
let expenses = JSON.parse(
    localStorage.getItem("studentExpenses") || "[]"
);

document.getElementById("date").value =
    new Date().toLocaleDateString("en-CA");

function formatMoney(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function saveData() {
    localStorage.setItem("studentBudget", budget);
    localStorage.setItem("studentExpenses", JSON.stringify(expenses));
}

budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newBudget = Number(
        document.getElementById("budgetInput").value
    );

    if (!Number.isFinite(newBudget) || newBudget < 0) {
        alert("Please enter a valid budget.");
        return;
    }

    budget = newBudget;
    saveData();
    updateDisplay();
    budgetForm.reset();
});

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description")
        .value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (
        !description ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !category ||
        !date
    ) {
        alert("Please enter valid expense details.");
        return;
    }

    expenses.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        description,
        amount,
        category,
        date
    });

    saveData();
    updateDisplay();

    expenseForm.reset();
    document.getElementById("date").value =
        new Date().toLocaleDateString("en-CA");
});

function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    expenses = expenses.filter(expense => expense.id !== id);
    saveData();
    updateDisplay();
}

filterCategory.addEventListener("change", updateDisplay);

function updateDisplay() {
    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount, 0
    );

    document.getElementById("budgetDisplay").textContent =
        formatMoney(budget);

    document.getElementById("totalDisplay").textContent =
        formatMoney(total);

    document.getElementById("balanceDisplay").textContent =
        formatMoney(budget - total);

    const selectedCategory = filterCategory.value;

    const filteredExpenses = expenses
        .filter(expense =>
            selectedCategory === "All" ||
            expense.category === selectedCategory
        )
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));

    expenseList.replaceChildren();

    document.getElementById("emptyMessage").style.display =
        filteredExpenses.length === 0 ? "block" : "none";

    filteredExpenses.forEach(expense => {
        const row = document.createElement("tr");

        [
            expense.description,
            expense.category,
            formatMoney(expense.amount),
            expense.date
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => {
            deleteExpense(expense.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        expenseList.appendChild(row);
    });
}

updateDisplay();
