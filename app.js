/**
 * CONFIGURACIÓN PRINCIPAL DE LA FECHA OBJETIVO
 * Puedes modificar directamente esta fecha o usar el panel de control en pantalla.
 * Formato ISO: 'YYYY-MM-DDTHH:mm:ss'
 */
const DEFAULT_TARGET_EPOCH = 1796497200000;
let DEFAULT_TARGET_DATE_STR = '2026-12-05T23:59:59';
let targetDate = new Date(DEFAULT_TARGET_EPOCH);

// Standard state object
let previousValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
let countdownInterval = null;
let isMinimized = false;

// Element References
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const daysBar = document.getElementById('days-bar');
const hoursBar = document.getElementById('hours-bar');
const minutesBar = document.getElementById('minutes-bar');
const secondsBar = document.getElementById('seconds-bar');

const timerGrid = document.getElementById('timer-grid');
const finishedMsg = document.getElementById('finished-message');
const datetimePicker = document.getElementById('datetime-picker');
const targetDateDisplay = document.getElementById('target-date-display');
const eventTitleEl = document.getElementById('event-title');

/**
 * Initialize Timer and Controls on Load
 */
window.addEventListener('DOMContentLoaded', () => {
    // Set initial datetime picker value
    initDatetimePicker();

    // Format date text display
    // updateDateLabelDisplay();

    // Start main interval loop
    startCountdown();

    // Check URL parameters (e.g. ?obs=true or ?title=Mi+Evento)
    parseUrlParameters();
});

/**
 * Core Countdown Calculation Logic
 */
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
        // Event Finished
        clearInterval(countdownInterval);
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';

        // Progress bars to 0%
        daysBar.style.width = '0%';
        hoursBar.style.width = '0%';
        minutesBar.style.width = '0%';
        secondsBar.style.width = '0%';

        // Show finished message & hide timer grid
        timerGrid.classList.add('hidden');
        finishedMsg.classList.remove('hidden');
        return;
    }

    // Ensure timer grid is visible if reset
    timerGrid.classList.remove('hidden');
    finishedMsg.classList.add('hidden');

    // Time Math
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Format values with leading zero
    const dStr = days < 10 ? '0' + days : days.toString();
    const hStr = hours < 10 ? '0' + hours : hours.toString();
    const mStr = minutes < 10 ? '0' + minutes : minutes.toString();
    const sStr = seconds < 10 ? '0' + seconds : seconds.toString();

    // Update UI & apply subtle pop animations when digits tick
    updateValueWithAnim(daysEl, dStr, previousValues.days !== days);
    updateValueWithAnim(hoursEl, hStr, previousValues.hours !== hours);
    updateValueWithAnim(minutesEl, mStr, previousValues.minutes !== minutes);
    updateValueWithAnim(secondsEl, sStr, previousValues.seconds !== seconds);

    // Update Progress bar percentages
    daysBar.style.width = `${Math.min(100, (days / 365) * 100)}%`;
    hoursBar.style.width = `${(hours / 24) * 100}%`;
    minutesBar.style.width = `${(minutes / 60) * 100}%`;
    secondsBar.style.width = `${(seconds / 60) * 100}%`;

    // Save state
    previousValues = { days, hours, minutes, seconds };
}

/**
 * Helper to update text content and trigger tick animation
 */
function updateValueWithAnim(element, newValue, hasChanged) {
    if (element.textContent !== newValue) {
        element.textContent = newValue;
        if (hasChanged) {
            element.classList.remove('tick-pop');
            // Force DOM Reflow for CSS animation restart
            void element.offsetWidth;
            element.classList.add('tick-pop');
        }
    }
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Format ISO date for datetime-local input field
 */
function initDatetimePicker() {
    const tzOffset = targetDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(targetDate.getTime() - tzOffset)).toISOString().slice(0, 16);
    datetimePicker.value = localISOTime;
}

/**
 * Handle date picker change from UI
 */
function updateTargetFromInput() {
    const inputVal = datetimePicker.value;
    if (inputVal) {
        targetDate = new Date(inputVal);
        // updateDateLabelDisplay();
        startCountdown();
    }
}

/**
 * Formats Spanish date text display in footer
 */
// function updateDateLabelDisplay() {
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     try {
//         const formatted = targetDate.toLocaleDateString('es-ES', options);
//         targetDateDisplay.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
//     } catch (e) {
//         targetDateDisplay.textContent = targetDate.toLocaleString();
//     }
// }

/**
 * Change overlay background mode for testing in browser
 */
function setBgPreview(mode) {
    document.body.className = ''; // reset
    if (mode === 'dark') {
        document.body.classList.add('bg-preview-dark');
    } else if (mode === 'chroma') {
        document.body.classList.add('bg-preview-chroma');
    } else if (mode === 'gameplay') {
        document.body.classList.add('bg-preview-gameplay');
    }
    // 'transparent' leaves body background transparent
}

/**
 * Custom Title text updater
 */
function updateTitleText(val) {
    eventTitleEl.textContent = val.trim() || 'TOKEN PIRATA FORTNITE';
}

/**
 * Switch between standard layout, horizontal bar, and minimal
 */
function changeLayout(layoutType) {
    const mainCard = document.getElementById('main-card');
    const timerGrid = document.getElementById('timer-grid');
    const footerBar = document.getElementById('footer-bar');

    if (layoutType === 'horizontal') {
        mainCard.className = "relative w-full max-w-4xl bg-slate-950/85 border-2 border-amber-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-row items-center justify-between gap-4";
        timerGrid.className = "flex flex-row items-center gap-2 flex-grow";
        footerBar.classList.add('hidden');
    } else if (layoutType === 'minimal') {
        mainCard.className = "relative w-full max-w-md bg-transparent border-0 p-2 text-center";
        timerGrid.className = "grid grid-cols-4 gap-1.5";
        footerBar.classList.add('hidden');
    } else {
        // Standard
        mainCard.className = "relative w-full max-w-2xl bg-slate-950/80 border-2 border-amber-500/60 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md";
        timerGrid.className = "grid grid-cols-4 gap-2 md:gap-4 relative z-10";
        footerBar.classList.remove('hidden');
    }
}

/**
 * Toggle Control Panel Minimize / Expand
 */
function toggleControlsMinimize() {
    const panelContent = document.getElementById('panel-content');
    const minIcon = document.getElementById('minimize-icon');
    isMinimized = !isMinimized;

    if (isMinimized) {
        panelContent.classList.add('hidden');
        minIcon.className = 'fa-solid fa-chevron-down';
    } else {
        panelContent.classList.remove('hidden');
        minIcon.className = 'fa-solid fa-minus';
    }
}

/**
 * Keyboard Shortcut Handler
 * Press 'H' key to hide/show the control panel completely for clean testing
 */
window.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        const panel = document.getElementById('controls-panel');
        panel.classList.toggle('opacity-0');
        panel.classList.toggle('pointer-events-none');
    }
});

/**
 * Parse custom URL parameters for quick StreamElements / OBS URL setup
 * Example: index.html?title=COPA+PIRATA&date=2026-12-05T23:59:59&hidecontrols=1
 */
function parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Custom Title param
    if (urlParams.has('title')) {
        const titleVal = urlParams.get('title');
        document.getElementById('title-input').value = titleVal;
        updateTitleText(titleVal);
    }

    // Custom Date param
    if (urlParams.has('date')) {
        const dateVal = urlParams.get('date');
        targetDate = new Date(dateVal);
        initDatetimePicker();
        // updateDateLabelDisplay();
        startCountdown();
    }

    // Hide controls by default if specified or in OBS browser mode
    if (urlParams.has('hidecontrols') || urlParams.has('obs')) {
        const panel = document.getElementById('controls-panel');
        panel.classList.add('opacity-0', 'pointer-events-none');
    }
}
