const KEY = 'langlearn_plan_tracker_v2';
const phaseTabs = document.getElementById('phase-tabs');
const phaseDetail = document.getElementById('phase-detail');
const checklist = document.getElementById('daily-checklist');
const todayDate = document.getElementById('today-date');
const dailyNote = document.getElementById('daily-note');
const saveNoteBtn = document.getElementById('save-note');
const resetTodayBtn = document.getElementById('reset-today');
const reviewForm = document.getElementById('review-form');
const coachFeedback = document.getElementById('coach-feedback');

const phaseData = [
  {
    id: 'phase1',
    name: 'Giai đoạn 1',
    range: 'Bây giờ → 15 ngày',
    weeklyGoal: '8-10 giờ/tuần',
    description: 'Giai đoạn vàng: tận dụng lúc rảnh ở công ty, học ngắt quãng để build nền IELTS/TOEIC.',
    tasks: [
      { label: 'Đi làm (sáng): listening warm-up', duration: 15 },
      { label: 'Công ty sáng sớm: reading 1 đoạn + 5 từ mới', duration: 25 },
      { label: 'Sau ăn trưa: review vocab (Anki)', duration: 15 },
      { label: 'Công ty chiều: grammar correction', duration: 20 },
      { label: 'Tối (2-3 ngày/tuần): viết 1 body paragraph', duration: 25 }
    ],
    tips: 'Ưu tiên Vocabulary + Reading để làm nền cho cả IELTS và TOEIC.'
  },
  {
    id: 'phase2',
    name: 'Giai đoạn 2',
    range: 'Ngày 15 → Cuối tháng 7',
    weeklyGoal: '5-7 giờ/tuần',
    description: 'Tiếng Anh song song tiếng Hàn: giảm tải nhưng giữ nhịp đều.',
    tasks: [
      { label: 'Trước lớp tiếng Hàn: 10 từ cũ', duration: 10 },
      { label: 'Giải lao/di chuyển: passive listening', duration: 15 },
      { label: 'Ăn trưa: TOEIC Part 7 / grammar review', duration: 20 },
      { label: 'Tối (2-3 ngày/tuần): 1 thử thách Speaking hoặc Writing', duration: 35 }
    ],
    tips: 'Duy trì > tăng tốc: không mất gốc đã là thành công.'
  },
  {
    id: 'phase3',
    name: 'Giai đoạn 3',
    range: 'Tháng 8 trở đi',
    weeklyGoal: '4-5 giờ/tuần',
    description: 'Ít giờ hơn nhưng tập trung mock test và readiness để đi thi.',
    tasks: [
      { label: 'Sáng: mini listening test', duration: 15 },
      { label: 'Lúc rảnh: timed reading', duration: 20 },
      { label: 'Cuối tuần: mock 1 kỹ năng', duration: 75 }
    ],
    tips: 'Thi TOEIC trước để build confidence, sau đó tập trung IELTS 6.5.'
  }
];

let state = JSON.parse(localStorage.getItem(KEY) || '{}');
if (!state.activePhase) state.activePhase = 'phase1';
if (!state.days) state.days = {};
if (!state.reviews) state.reviews = [];

const dateKey = new Date().toISOString().slice(0, 10);

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function getActivePhase() {
  return phaseData.find(p => p.id === state.activePhase) || phaseData[0];
}

function ensureToday() {
  if (!state.days[dateKey]) {
    const tasks = getActivePhase().tasks.map((task, idx) => ({ id: idx, done: false, ...task }));
    state.days[dateKey] = { tasks, note: '' };
  }
}

function renderTabs() {
  phaseTabs.innerHTML = '';
  phaseData.forEach(phase => {
    const btn = document.createElement('button');
    btn.textContent = `${phase.name} · ${phase.range}`;
    btn.className = `tab ${phase.id === state.activePhase ? 'active' : ''}`;
    btn.onclick = () => {
      state.activePhase = phase.id;
      delete state.days[dateKey];
      ensureToday();
      saveState();
      renderAll();
    };
    phaseTabs.appendChild(btn);
  });
}

function renderPhaseDetail() {
  const phase = getActivePhase();
  phaseDetail.innerHTML = `
    <h3>${phase.name} — ${phase.range}</h3>
    <p>${phase.description}</p>
    <p><strong>Mục tiêu tuần:</strong> ${phase.weeklyGoal}</p>
    <p><strong>Tips:</strong> ${phase.tips}</p>
  `;
}

function renderChecklist() {
  ensureToday();
  const today = state.days[dateKey];
  todayDate.textContent = `Hôm nay: ${dateKey}`;
  checklist.innerHTML = '';

  today.tasks.forEach(task => {
    const item = document.createElement('label');
    item.className = 'task-item';
    item.innerHTML = `<input type="checkbox" ${task.done ? 'checked' : ''}> <span>${task.label}</span> <small>${task.duration} phút</small>`;
    item.querySelector('input').addEventListener('change', (e) => {
      task.done = e.target.checked;
      saveState();
      renderStats();
    });
    checklist.appendChild(item);
  });
  dailyNote.value = today.note || '';
}

function renderStats() {
  const days = Object.keys(state.days);
  const completedDays = days.filter(day => state.days[day].tasks.length && state.days[day].tasks.every(t => t.done)).length;

  const today = state.days[dateKey] || { tasks: [] };
  const totalToday = today.tasks.length || 1;
  const doneToday = today.tasks.filter(t => t.done).length;
  const todayPercent = Math.round((doneToday / totalToday) * 100);

  const sorted = days.sort();
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const d = sorted[i];
    if (state.days[d].tasks.length && state.days[d].tasks.every(t => t.done)) streak += 1;
    else break;
  }

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let weeklyMinutes = 0;
  days.forEach(day => {
    const t = new Date(day).getTime();
    if (Number.isNaN(t) || now - t > weekMs) return;
    state.days[day].tasks.filter(task => task.done).forEach(task => {
      weeklyMinutes += task.duration;
    });
  });

  document.getElementById('completed-days').textContent = completedDays;
  document.getElementById('today-progress').textContent = `${todayPercent}%`;
  document.getElementById('streak').textContent = streak;
  document.getElementById('weekly-time').textContent = `${(weeklyMinutes / 60).toFixed(1)}h`;
}

saveNoteBtn.addEventListener('click', () => {
  ensureToday();
  state.days[dateKey].note = dailyNote.value.trim();
  saveState();
  alert('Đã lưu ghi chú hôm nay ✅');
});

resetTodayBtn.addEventListener('click', () => {
  if (!confirm('Bạn muốn reset checklist hôm nay?')) return;
  delete state.days[dateKey];
  ensureToday();
  saveState();
  renderAll();
});

reviewForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const focus = Number(document.getElementById('focus-score').value);
  const energy = Number(document.getElementById('energy-score').value);
  const effectiveness = Number(document.getElementById('effectiveness').value);
  state.reviews.push({ date: dateKey, focus, energy, effectiveness });
  saveState();

  if (effectiveness >= 80) {
    coachFeedback.textContent = 'Rất tốt! Mai giữ đúng khung giờ này, tăng nhẹ 1 task khó (writing/speaking).';
  } else if (effectiveness >= 60) {
    coachFeedback.textContent = 'Ổn rồi 👍 Mai giảm 1 task nếu bận, nhưng giữ chuỗi học để không mất momentum.';
  } else {
    coachFeedback.textContent = 'Hôm nay hơi đuối. Mai chỉ cần hoàn thành 2 task cốt lõi: listening + vocab review.';
  }
});

function renderAll() {
  renderTabs();
  renderPhaseDetail();
  renderChecklist();
  renderStats();
}

ensureToday();
renderAll();
