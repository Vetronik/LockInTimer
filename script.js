const state = {
  mode: "target",
  running: false,
  endAt: null,
  totalSeconds: 0,
  remainingSeconds: 0,
  intervalPhase: "focus",
  intervalRound: 1,
  completedMinutes: Number(localStorage.getItem("completedMinutes") || 0),
  tickId: null,
  mascotId: null,
  sound: true
};

const el = {
  modeStatus: document.querySelector("#modeStatus"),
  sessionLabel: document.querySelector("#sessionLabel"),
  timeDisplay: document.querySelector("#timeDisplay"),
  timerNote: document.querySelector("#timerNote"),
  progressBar: document.querySelector("#progressBar"),
  startPauseButton: document.querySelector("#startPauseButton"),
  resetButton: document.querySelector("#resetButton"),
  completeButton: document.querySelector("#completeButton"),
  targetTime: document.querySelector("#targetTime"),
  durationHours: document.querySelector("#durationHours"),
  durationMinutes: document.querySelector("#durationMinutes"),
  focusMinutes: document.querySelector("#focusMinutes"),
  breakMinutes: document.querySelector("#breakMinutes"),
  sessionCount: document.querySelector("#sessionCount"),
  skipIntervalButton: document.querySelector("#skipIntervalButton"),
  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  taskList: document.querySelector("#taskList"),
  completedCount: document.querySelector("#completedCount"),
  sessionStats: document.querySelector("#sessionStats"),
  focusNote: document.querySelector("#focusNote"),
  mascotLayer: document.querySelector("#mascotLayer"),
  mascotToggle: document.querySelector("#mascotToggle"),
  rarityRange: document.querySelector("#rarityRange"),
  testMascotButton: document.querySelector("#testMascotButton"),
  soundToggleButton: document.querySelector("#soundToggleButton")
};

const modeCopy = {
  target: ["Zieluhrzeit", "Lernen bis zur eingestellten Uhrzeit"],
  duration: ["Countdown", "Eigener Fokus-Countdown"],
  interval: ["Intervall", "Intervalllernen mit Fokus- und Pausenphasen"]
};

const mascots = [
  { type: "mouse", main: "#ffd85a", accent: "#2e2f34" },
  { type: "runner", main: "#3b8eea", accent: "#f6f6f6" },
  { type: "plumber", main: "#e85045", accent: "#3559a6" },
  { type: "star", main: "#f7a8d8", accent: "#ffe56d" },
  { type: "mouse", main: "#74d36f", accent: "#f5f0df" },
  { type: "star", main: "#f4cf49", accent: "#f27b56" }
];

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
el.focusNote.value = localStorage.getItem("focusNote") || "";

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
}

function targetDateFromInput() {
  const [hours, minutes] = el.targetTime.value.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  return target;
}

function getDurationSeconds() {
  const hours = clampNumber(el.durationHours.value, 0, 12);
  const minutes = clampNumber(el.durationMinutes.value, 0, 59);
  return Math.max(60, (hours * 60 + minutes) * 60);
}

function getIntervalSeconds() {
  const focus = clampNumber(el.focusMinutes.value, 1, 120) * 60;
  const pause = clampNumber(el.breakMinutes.value, 1, 45) * 60;
  return state.intervalPhase === "focus" ? focus : pause;
}

function setMode(mode) {
  state.mode = mode;
  stopTimer();
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  document.querySelectorAll(".mode-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${mode}Panel`);
  });
  el.modeStatus.textContent = modeCopy[mode][0];
  el.sessionLabel.textContent = modeCopy[mode][1];
  resetTimer();
}

function prepareTimer() {
  if (state.mode === "target") {
    const endAt = targetDateFromInput();
    state.endAt = endAt;
    state.totalSeconds = Math.max(1, Math.round((endAt - new Date()) / 1000));
    state.remainingSeconds = state.totalSeconds;
    const targetDay = endAt.toDateString() === new Date().toDateString() ? "heute" : "morgen";
    el.timerNote.textContent = `Ziel: ${el.targetTime.value} Uhr ${targetDay}.`;
  }

  if (state.mode === "duration") {
    state.endAt = Date.now() + getDurationSeconds() * 1000;
    state.totalSeconds = getDurationSeconds();
    state.remainingSeconds = state.totalSeconds;
    el.timerNote.textContent = "Eigener Countdown ist bereit.";
  }

  if (state.mode === "interval") {
    state.totalSeconds = getIntervalSeconds();
    state.remainingSeconds = state.totalSeconds;
    state.endAt = Date.now() + state.remainingSeconds * 1000;
    updateIntervalText();
  }
}

function startTimer() {
  if (!state.running) {
    if (!state.endAt || state.remainingSeconds <= 0) prepareTimer();
    if (state.mode !== "target") state.endAt = Date.now() + state.remainingSeconds * 1000;
    state.running = true;
    el.startPauseButton.textContent = "Pause";
    scheduleMascot();
    state.tickId = window.setInterval(tick, 250);
    tick();
  }
}

function pauseTimer() {
  state.running = false;
  el.startPauseButton.textContent = "Weiter";
  window.clearInterval(state.tickId);
  window.clearTimeout(state.mascotId);
}

function stopTimer() {
  state.running = false;
  window.clearInterval(state.tickId);
  window.clearTimeout(state.mascotId);
  el.startPauseButton.textContent = "Start";
}

function resetTimer() {
  stopTimer();
  state.endAt = null;
  state.intervalPhase = "focus";
  state.intervalRound = 1;
  prepareTimer();
  renderTime();
}

function completeTimer() {
  const studied = Math.max(0, Math.round((state.totalSeconds - state.remainingSeconds) / 60));
  state.completedMinutes += studied;
  localStorage.setItem("completedMinutes", String(state.completedMinutes));
  updateStats();
  stopTimer();
  state.remainingSeconds = 0;
  renderTime();
  playBeep();
  el.timerNote.textContent = "Session abgeschlossen.";
}

function tick() {
  const remaining = state.mode === "target"
    ? Math.round((state.endAt - new Date()) / 1000)
    : Math.round((state.endAt - Date.now()) / 1000);
  state.remainingSeconds = Math.max(0, remaining);

  if (state.remainingSeconds <= 0) {
    if (state.mode === "interval") {
      advanceInterval();
      return;
    }
    completeTimer();
    return;
  }

  renderTime();
}

function renderTime() {
  el.timeDisplay.textContent = formatTime(state.remainingSeconds);
  const elapsed = state.totalSeconds - state.remainingSeconds;
  const progress = state.totalSeconds > 0 ? Math.min(100, Math.max(0, (elapsed / state.totalSeconds) * 100)) : 0;
  el.progressBar.style.width = `${progress}%`;
}

function advanceInterval() {
  playBeep();
  const maxRounds = clampNumber(el.sessionCount.value, 1, 12);
  if (state.intervalPhase === "focus") {
    state.completedMinutes += clampNumber(el.focusMinutes.value, 1, 120);
    localStorage.setItem("completedMinutes", String(state.completedMinutes));
    updateStats();
    state.intervalPhase = "break";
  } else if (state.intervalRound < maxRounds) {
    state.intervalRound += 1;
    state.intervalPhase = "focus";
  } else {
    completeTimer();
    el.timerNote.textContent = "Alle Intervalle geschafft.";
    return;
  }

  state.totalSeconds = getIntervalSeconds();
  state.remainingSeconds = state.totalSeconds;
  state.endAt = Date.now() + state.remainingSeconds * 1000;
  updateIntervalText();
  renderTime();
}

function updateIntervalText() {
  const phase = state.intervalPhase === "focus" ? "Fokus" : "Pause";
  el.timerNote.textContent = `${phase} - Runde ${state.intervalRound} von ${clampNumber(el.sessionCount.value, 1, 12)}.`;
  el.sessionLabel.textContent = state.intervalPhase === "focus" ? "Jetzt fokussiert lernen" : "Kurze Pause";
}

function scheduleMascot() {
  window.clearTimeout(state.mascotId);
  if (!el.mascotToggle.checked || !state.running) return;
  const rarity = Number(el.rarityRange.value);
  const delay = 1000 * (18 + rarity * 12 + Math.random() * rarity * 18);
  state.mascotId = window.setTimeout(() => {
    spawnMascot();
    scheduleMascot();
  }, delay);
}

function spawnMascot() {
  if (!el.mascotToggle.checked) return;
  const data = mascots[Math.floor(Math.random() * mascots.length)];
  const mascot = document.createElement("div");
  mascot.className = `mascot ${data.type}`;
  mascot.style.setProperty("--mascot-main", data.main);
  mascot.style.setProperty("--mascot-accent", data.accent);
  mascot.innerHTML = '<span class="ears"></span><span class="cap"></span><span class="spike"></span><span class="body"></span><span class="face"></span><span class="feet"></span>';
  el.mascotLayer.append(mascot);
  window.setTimeout(() => mascot.remove(), 2800);
}

function playBeep() {
  if (!state.sound) return;
  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 740;
  gain.gain.setValueAtTime(0.001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.24);
}

function renderTasks() {
  el.taskList.innerHTML = "";
  tasks.forEach((task) => {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    const label = document.createElement("span");
    const remove = document.createElement("button");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    label.textContent = task.text;
    label.className = task.done ? "done" : "";
    remove.type = "button";
    remove.textContent = "x";
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
    });
    remove.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
    });
    item.append(checkbox, label, remove);
    el.taskList.append(item);
  });
  const done = tasks.filter((task) => task.done).length;
  el.completedCount.textContent = `${done} erledigt`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function updateStats() {
  el.sessionStats.textContent = `${state.completedMinutes} min heute`;
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll("[data-target-offset]").forEach((button) => {
  button.addEventListener("click", () => {
    const date = new Date(Date.now() + Number(button.dataset.targetOffset) * 60000);
    el.targetTime.value = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    resetTimer();
  });
});

document.querySelectorAll("[data-target-time]").forEach((button) => {
  button.addEventListener("click", () => {
    el.targetTime.value = button.dataset.targetTime;
    resetTimer();
  });
});

document.querySelectorAll("[data-duration]").forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.duration);
    el.durationHours.value = Math.floor(minutes / 60);
    el.durationMinutes.value = minutes % 60;
    resetTimer();
  });
});

el.startPauseButton.addEventListener("click", () => {
  state.running ? pauseTimer() : startTimer();
});
el.resetButton.addEventListener("click", resetTimer);
el.completeButton.addEventListener("click", completeTimer);
el.skipIntervalButton.addEventListener("click", () => {
  if (state.mode === "interval") advanceInterval();
});
el.testMascotButton.addEventListener("click", spawnMascot);
el.soundToggleButton.addEventListener("click", () => {
  state.sound = !state.sound;
  el.soundToggleButton.textContent = state.sound ? "Ton an" : "Ton aus";
  el.soundToggleButton.setAttribute("aria-pressed", String(state.sound));
});
el.mascotToggle.addEventListener("change", scheduleMascot);
[el.targetTime, el.durationHours, el.durationMinutes, el.focusMinutes, el.breakMinutes, el.sessionCount].forEach((input) => {
  input.addEventListener("input", resetTimer);
});
el.focusNote.addEventListener("input", () => localStorage.setItem("focusNote", el.focusNote.value));
el.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = el.taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, done: false });
  el.taskInput.value = "";
  saveTasks();
});

renderTasks();
updateStats();
resetTimer();
