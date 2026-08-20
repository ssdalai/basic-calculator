const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const themeToggle = document.getElementById("theme-toggle");

const THEME_KEY = "basic-calculator-theme";

let current = "0";
let stored = null;
let operator = null;
let justEvaluated = false;

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const asString = String(value);
  if (asString.includes("e")) {
    return value.toPrecision(10).replace(/\.?0+$/, "");
  }

  const [whole, fraction] = asString.split(".");
  if (!fraction) {
    return whole;
  }

  return `${whole}.${fraction.slice(0, 10).replace(/0+$/, "")}`.replace(
    /\.$/,
    ""
  );
}

function updateDisplay() {
  expressionEl.textContent =
    stored !== null && operator ? `${formatNumber(stored)} ${operator}` : "";
  resultEl.textContent = current;
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    stored = null;
    operator = null;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  current = current === "0" ? digit : current + digit;
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated) {
    current = "0.";
    stored = null;
    operator = null;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  if (!current.includes(".")) {
    current += ".";
    updateDisplay();
  }
}

function clearAll() {
  current = "0";
  stored = null;
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

function backspace() {
  if (justEvaluated) {
    return;
  }

  current = current.length <= 1 ? "0" : current.slice(0, -1);
  if (current === "-") {
    current = "0";
  }
  updateDisplay();
}

function applyPercent() {
  const value = Number(current);
  current = formatNumber(value / 100);
  updateDisplay();
}

function compute(a, op, b) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function setOperator(nextOperator) {
  const value = Number(current);

  if (stored === null) {
    stored = value;
  } else if (!justEvaluated) {
    stored = compute(stored, operator, value);
  }

  operator = nextOperator;
  current = "0";
  justEvaluated = false;
  updateDisplay();
}

function equals() {
  if (stored === null || !operator) {
    return;
  }

  const result = compute(stored, operator, Number(current));
  current = formatNumber(result);
  stored = Number.isFinite(result) ? result : null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);

  const isDark = next === "dark";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
  themeToggle.querySelector(".theme-toggle-icon").textContent = isDark
    ? "☀️"
    : "🌙";
  themeToggle.querySelector(".theme-toggle-label").textContent = isDark
    ? "Light"
    : "Dark";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.digit) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.operator) {
    setOperator(button.dataset.operator);
  } else if (button.dataset.action === "decimal") {
    inputDecimal();
  } else if (button.dataset.action === "clear") {
    clearAll();
  } else if (button.dataset.action === "backspace") {
    backspace();
  } else if (button.dataset.action === "percent") {
    applyPercent();
  } else if (button.dataset.action === "equals") {
    equals();
  }
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^\d$/.test(key)) {
    inputDigit(key);
    return;
  }

  const operatorMap = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  if (operatorMap[key]) {
    event.preventDefault();
    setOperator(operatorMap[key]);
    return;
  }

  if (key === "." || key === ",") {
    inputDecimal();
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    applyPercent();
  }
});

initTheme();
updateDisplay();
