const DAILY_GOAL = 8;
const STORAGE_KEY = 'hidratacao_copos_hoje';
const RING_CIRCUMFERENCE = 2 * Math.PI * 86; // r = 86 -> 540.35

// Estado inicial (começa em 3 como na referência se não houver registro salvo)
let cupsCount = loadSavedCups();

const screens = document.querySelectorAll('.screen');
const cupsGrid = document.getElementById('cups-grid');
const counterDisplay = document.getElementById('counter-display');
const progressPercent = document.getElementById('progress-percent');
const progressRingFill = document.getElementById('progress-ring-fill');
const motivationText = document.getElementById('motivation-text');

function loadSavedCups() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= DAILY_GOAL) {
      return parsed;
    }
  }
  return 3;
}

function saveCups(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });
}

function createCupSVG(filled) {
  if (filled) {
    return `
      <svg class="cup-svg" viewBox="0 0 64 76" fill="none" aria-hidden="true">
        <!-- Corpo do copo cheio -->
        <path d="M11 10 L53 10 L47 66 C46.6 69.5 43.8 72 40.3 72 L23.7 72 C20.2 72 17.4 69.5 17 66 L11 10 Z" fill="#E3F3FE" />
        <!-- Água azul -->
        <path d="M13.2 25 L50.8 25 L46.6 65.5 C46.2 68.8 43.5 71 40.2 71 L23.8 71 C20.5 71 17.8 68.8 17.4 65.5 L13.2 25 Z" fill="#62B6F6" />
        <!-- Superfície da água -->
        <ellipse cx="32" cy="25" rx="18.8" ry="3.2" fill="#8CD0FC" />
        <!-- Borda superior -->
        <ellipse cx="32" cy="10" rx="21" ry="3.5" fill="#F4FAFF" stroke="#1A2B3C" stroke-width="2.6" />
        <!-- Contorno do copo -->
        <path d="M11 10 L17 66 C17.4 69.5 20.2 72 23.7 72 L40.3 72 C43.8 72 46.6 69.5 47 66 L53 10" stroke="#1A2B3C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  return `
    <svg class="cup-svg" viewBox="0 0 64 76" fill="none" aria-hidden="true">
      <!-- Corpo do copo vazio -->
      <path d="M11 10 L53 10 L47 66 C46.6 69.5 43.8 72 40.3 72 L23.7 72 C20.2 72 17.4 69.5 17 66 L11 10 Z" fill="#EAF1F6" />
      <!-- Borda superior -->
      <ellipse cx="32" cy="10" rx="21" ry="3.5" fill="#F8FBFD" stroke="#5F6F7E" stroke-width="2.4" />
      <!-- Contorno do copo -->
      <path d="M11 10 L17 66 C17.4 69.5 20.2 72 23.7 72 L40.3 72 C43.8 72 46.6 69.5 47 66 L53 10" stroke="#5F6F7E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function renderCups() {
  cupsGrid.innerHTML = '';

  for (let i = 0; i < DAILY_GOAL; i++) {
    const isFilled = i < cupsCount;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cup-btn';
    btn.setAttribute('aria-label', `Copo ${i + 1}: ${isFilled ? 'bebido' : 'vazio'}`);
    btn.innerHTML = createCupSVG(isFilled);

    btn.addEventListener('click', () => {
      // Se clicar no último copo cheio, esvazia ele; caso contrário preenche até o copo clicado
      if (isFilled && i === cupsCount - 1) {
        updateCups(i);
      } else {
        updateCups(i + 1);
      }
    });

    cupsGrid.appendChild(btn);
  }
}

function updateProgressUI() {
  // Contador 3/8
  counterDisplay.textContent = `${cupsCount}/${DAILY_GOAL}`;
  counterDisplay.classList.remove('bump');
  void counterDisplay.offsetWidth;
  counterDisplay.classList.add('bump');

  // Percentual (ex.: 3/8 = 37%)
  const percentage = Math.floor((cupsCount / DAILY_GOAL) * 100);
  progressPercent.textContent = `${percentage}%`;

  const offset = RING_CIRCUMFERENCE - (percentage / 100) * RING_CIRCUMFERENCE;
  progressRingFill.style.strokeDashoffset = offset;

  // Mensagem motivacional dinâmica
  if (cupsCount === 0) {
    motivationText.textContent = 'Vamos começar!';
  } else if (cupsCount < DAILY_GOAL) {
    motivationText.textContent = 'Continue assim!';
  } else {
    motivationText.textContent = 'Meta concluída!';
  }
}

function updateCups(newCount) {
  cupsCount = Math.max(0, Math.min(DAILY_GOAL, newCount));
  saveCups(cupsCount);
  renderCups();
  updateProgressUI();
}

// Eventos de navegação
document.getElementById('btn-go-register').addEventListener('click', () => {
  showScreen('screen-register');
});

document.querySelectorAll('.btn-back, .nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    if (target) showScreen(target);
  });
});

// Botão + ADICIONAR COPO
document.getElementById('btn-add-cup').addEventListener('click', () => {
  if (cupsCount < DAILY_GOAL) {
    updateCups(cupsCount + 1);
  }
});

// Botão zerar contagem
document.getElementById('btn-reset').addEventListener('click', () => {
  updateCups(0);
});

// Inicialização
renderCups();
updateProgressUI();
