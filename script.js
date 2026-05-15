const exprPreview = document.getElementById('exprPreview');
const resultEl = document.getElementById('result');
const panelTitle = document.getElementById('panelTitle');
const panelDesc = document.getElementById('panelDesc');

const massValue = document.getElementById('massValue');
const massFrom = document.getElementById('massFrom');
const massTo = document.getElementById('massTo');
const massResult = document.getElementById('massResult');

const unitCategory = document.getElementById('unitCategory');
const unitValue = document.getElementById('unitValue');
const unitFrom = document.getElementById('unitFrom');
const unitTo = document.getElementById('unitTo');
const unitResult = document.getElementById('unitResult');

const tempValue = document.getElementById('tempValue');
const tempFrom = document.getElementById('tempFrom');
const tempTo = document.getElementById('tempTo');
const tempResult = document.getElementById('tempResult');

const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');

const degBtn = document.getElementById('degBtn');
const radBtn = document.getElementById('radBtn');
const thousandsToggle = document.getElementById('thousandsToggle');

const saveFavBtn = document.getElementById('saveFavBtn');
const copyBtn = document.getElementById('copyBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const clearFavBtn = document.getElementById('clearFavBtn');
const massConvertBtn = document.getElementById('massConvertBtn');
const unitConvertBtn = document.getElementById('unitConvertBtn');
const tempConvertBtn = document.getElementById('tempConvertBtn');

const navButtons = document.querySelectorAll('.nav-btn');
const views = {
  scientific: document.getElementById('view-scientific'),
  mass: document.getElementById('view-mass'),
  units: document.getElementById('view-units'),
  temperature: document.getElementById('view-temperature'),
  history: document.getElementById('view-history'),
  favorites: document.getElementById('view-favorites'),
  settings: document.getElementById('view-settings'),
  help: document.getElementById('view-help')
};

let expr = '';
let currentMode = 'DEG';
let history = [];
let favorites = [];

const massUnits = {
  kg: { label: 'Kilogramo (kg)', factor: 1000 },
  g: { label: 'Gramo (g)', factor: 1 },
  mg: { label: 'Miligramo (mg)', factor: 0.001 },
  lb: { label: 'Libra (lb)', factor: 453.59237 },
  oz: { label: 'Onza (oz)', factor: 28.349523125 }
};

const unitCategories = {
  longitud: {
    label: 'Longitud',
    units: {
      m: { label: 'Metro (m)', factor: 1 },
      km: { label: 'Kilómetro (km)', factor: 1000 },
      cm: { label: 'Centímetro (cm)', factor: 0.01 },
      mm: { label: 'Milímetro (mm)', factor: 0.001 },
      mi: { label: 'Milla (mi)', factor: 1609.344 },
      ft: { label: 'Pie (ft)', factor: 0.3048 }
    }
  },
  masa: {
    label: 'Masa',
    units: {
      kg: { label: 'Kilogramo (kg)', factor: 1000 },
      g: { label: 'Gramo (g)', factor: 1 },
      mg: { label: 'Miligramo (mg)', factor: 0.001 },
      lb: { label: 'Libra (lb)', factor: 453.59237 },
      oz: { label: 'Onza (oz)', factor: 28.349523125 }
    }
  }
};

function formatNumber(n) {
  if (!Number.isFinite(n)) return 'Error';
  const useThousands = thousandsToggle.checked;
  const rounded = Math.abs(n) >= 1e10 || (Math.abs(n) > 0 && Math.abs(n) < 1e-7)
    ? n.toExponential(8)
    : Number.parseFloat(n.toFixed(8)).toString();
  if (!useThousands) return rounded;
  const [intPart, decPart] = rounded.split('.');
  const formattedInt = Number(intPart).toLocaleString('en-US');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

function setView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));

  const titles = {
    scientific: ['🧮 Calculadora Científica', 'Pantalla principal para operaciones matemáticas y científicas.'],
    mass: ['⚖️ Calculadora de Masa', 'Una sola pantalla para convertir entre unidades de masa.'],
    units: ['🔁 Convertidora de Unidades', 'Selecciona categoría, origen y destino.'],
    temperature: ['🌡️ Convertidora de Temperatura', 'Convierte entre Celsius, Fahrenheit y Kelvin.'],
    history: ['🕘 Historial', 'Revisa las últimas operaciones realizadas.'],
    favorites: ['⭐ Favoritos', 'Guarda y reutiliza tus resultados.'],
    settings: ['⚙️ Ajustes', 'Personaliza la experiencia de la calculadora.'],
    help: ['❓ Ayuda', 'Guía rápida de uso y navegación.']
  };
  panelTitle.textContent = titles[name][0];
  panelDesc.textContent = titles[name][1];
}

function updateDisplay() {
  exprPreview.textContent = expr || ' ';
  if (!expr) resultEl.textContent = '0';
}

function appendToken(token) {
  expr += token;
  updateDisplay();
}

function clearExpr() {
  expr = '';
  updateDisplay();
}

function backspace() {
  expr = expr.slice(0, -1);
  updateDisplay();
}

function toRad(x) {
  return currentMode === 'DEG' ? x * Math.PI / 180 : x;
}

function fromRad(x) {
  return currentMode === 'DEG' ? x * 180 / Math.PI : x;
}

function factorial(n) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n) || n < 0) throw new Error('Factorial inválido');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evaluateExpression(raw) {
  let prepared = raw
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('π', 'pi')
    .replaceAll('^', '**');
  while (prepared.includes('!')) {
    prepared = prepared.replace(/(\d+(?:\.\d+)?)!/, 'fact($1)');
  }
  const scope = {
    pi: Math.PI,
    e: Math.E,
    sin: x => Math.sin(toRad(x)),
    cos: x => Math.cos(toRad(x)),
    tan: x => Math.tan(toRad(x)),
    asin: x => fromRad(Math.asin(x)),
    acos: x => fromRad(Math.acos(x)),
    atan: x => fromRad(Math.atan(x)),
    sqrt: x => Math.sqrt(x),
    log: x => Math.log10(x),
    ln: x => Math.log(x),
    abs: x => Math.abs(x),
    exp: x => Math.exp(x),
    fact: x => factorial(x)
  };
  const fn = new Function(...Object.keys(scope), `"use strict"; return (${prepared});`);
  return fn(...Object.values(scope));
}

function addHistory(text, value) {
  history.unshift({ text, value });
  history = history.slice(0, 8);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (!history.length) {
    historyList.innerHTML = '<span class="empty">Aún no hay operaciones.</span>';
    return;
  }
  history.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div><strong>${item.value}</strong><br><small>${item.text}</small></div><button type="button">↺</button>`;
    row.querySelector('button').addEventListener('click', () => {
      expr = item.text.split('=')[0].trim();
      updateDisplay();
      setView('scientific');
    });
    historyList.appendChild(row);
  });
}

function saveFavorite() {
  if (!expr.trim() && resultEl.textContent === '0') return;
  favorites.unshift({ text: expr || resultEl.textContent, value: resultEl.textContent });
  favorites = favorites.slice(0, 8);
  renderFavorites();
}

function renderFavorites() {
  favoritesList.innerHTML = '';
  if (!favorites.length) {
    favoritesList.innerHTML = '<span class="empty">Sin favoritos guardados.</span>';
    return;
  }
  favorites.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div><strong>${item.value}</strong><br><small>${item.text}</small></div><button type="button">×</button>`;
    row.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'button') return;
      expr = item.text;
      updateDisplay();
      setView('scientific');
    });
    row.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      favorites.splice(index, 1);
      renderFavorites();
    });
    favoritesList.appendChild(row);
  });
}

function populateSelect(select, options, selectedValue) {
  select.innerHTML = '';
  Object.entries(options).forEach(([value, opt]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = opt.label;
    if (value === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}

function convertMass() {
  const value = parseFloat(massValue.value);
  if (Number.isNaN(value)) return (massResult.textContent = 'Ingresa un valor');
  const result = (value * massUnits[massFrom.value].factor) / massUnits[massTo.value].factor;
  const formatted = formatNumber(result);
  massResult.textContent = `${formatted} ${massUnits[massTo.value].label}`;
  addHistory(`Masa: ${value} ${massUnits[massFrom.value].label} → ${formatted} ${massUnits[massTo.value].label}`, formatted);
}

function convertUnits() {
  const category = unitCategories[unitCategory.value];
  const value = parseFloat(unitValue.value);
  if (Number.isNaN(value)) return (unitResult.textContent = 'Ingresa un valor');
  const result = (value * category.units[unitFrom.value].factor) / category.units[unitTo.value].factor;
  const targetLabel = category.units[unitTo.value].label;
  const formatted = formatNumber(result);
  unitResult.textContent = `${formatted} ${targetLabel}`;
  addHistory(`Unidades: ${value} ${category.units[unitFrom.value].label} → ${formatted} ${targetLabel}`, formatted);
}

function convertTemperature(value, from, to) {
  let celsius;
  if (from === 'c') celsius = value;
  if (from === 'f') celsius = (value - 32) * 5 / 9;
  if (from === 'k') celsius = value - 273.15;
  if (to === 'c') return celsius;
  if (to === 'f') return (celsius * 9 / 5) + 32;
  if (to === 'k') return celsius + 273.15;
  return value;
}

function convertTemp() {
  const value = parseFloat(tempValue.value);
  if (Number.isNaN(value)) return (tempResult.textContent = 'Ingresa un valor');
  const result = convertTemperature(value, tempFrom.value, tempTo.value);
  const label = tempTo.options[tempTo.selectedIndex].textContent;
  const formatted = formatNumber(result);
  tempResult.textContent = `${formatted} ${label}`;
  addHistory(`Temperatura: ${value} ${tempFrom.options[tempFrom.selectedIndex].textContent} → ${formatted} ${label}`, formatted);
}

function evaluateAndSave() {
  if (!expr.trim()) return;
  try {
    const value = evaluateExpression(expr);
    const displayValue = formatNumber(value);
    resultEl.textContent = displayValue;
    addHistory(`${expr} = ${displayValue}`, displayValue);
    expr = String(value);
    updateDisplay();
  } catch {
    resultEl.textContent = 'Error';
  }
}

document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
document.querySelectorAll('[data-ins]').forEach(btn => btn.addEventListener('click', () => appendToken(btn.dataset.ins)));
document.querySelectorAll('[data-act="clear"]').forEach(btn => btn.addEventListener('click', clearExpr));
document.querySelectorAll('[data-act="back"]').forEach(btn => btn.addEventListener('click', backspace));
document.querySelectorAll('[data-act="eq"]').forEach(btn => btn.addEventListener('click', evaluateAndSave));

degBtn.addEventListener('click', () => {
  currentMode = 'DEG';
  degBtn.classList.add('active');
  radBtn.classList.remove('active');
});

radBtn.addEventListener('click', () => {
  currentMode = 'RAD';
  radBtn.classList.add('active');
  degBtn.classList.remove('active');
});

saveFavBtn.addEventListener('click', saveFavorite);
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent);
    copyBtn.textContent = 'Copiado';
    setTimeout(() => copyBtn.textContent = 'Copiar resultado', 1200);
  } catch {
    alert('No se pudo copiar.');
  }
});

clearHistoryBtn.addEventListener('click', () => { history = []; renderHistory(); });
clearFavBtn.addEventListener('click', () => { favorites = []; renderFavorites(); });
massConvertBtn.addEventListener('click', convertMass);
unitConvertBtn.addEventListener('click', convertUnits);
tempConvertBtn.addEventListener('click', convertTemp);

unitCategory.addEventListener('change', () => {
  const category = unitCategories[unitCategory.value];
  populateSelect(unitFrom, category.units, Object.keys(category.units)[0]);
  populateSelect(unitTo, category.units, Object.keys(category.units)[1] || Object.keys(category.units)[0]);
});

thousandsToggle.addEventListener('change', () => {
  if (!expr) updateDisplay();
});

document.addEventListener('keydown', (e) => {
  const allowed = '0123456789.+-*/()^';
  if (allowed.includes(e.key)) appendToken(e.key);
  else if (e.key === 'Enter') { e.preventDefault(); evaluateAndSave(); }
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearExpr();
});

populateSelect(massFrom, massUnits, 'kg');
populateSelect(massTo, massUnits, 'g');
populateSelect(unitCategory, unitCategories, 'longitud');
const firstCat = unitCategories[unitCategory.value];
populateSelect(unitFrom, firstCat.units, Object.keys(firstCat.units)[0]);
populateSelect(unitTo, firstCat.units, Object.keys(firstCat.units)[1] || Object.keys(firstCat.units)[0]);

updateDisplay();
renderHistory();
renderFavorites();
setView('scientific');
