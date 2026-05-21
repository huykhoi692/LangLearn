const KEY = 'langlearn_ai_daily_v4';
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
const dateKey = getLocalDateKey();

const SUPABASE_URL = 'https://iuqnocgdycsqyghmlgqm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cW5vY2dkeWNzcXlnaG1sZ3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTY5MzgsImV4cCI6MjA5NDgzMjkzOH0.0_qLuj2STM7besYdmo05I2m12xwRbhKievZNEX5T0FM';
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const el = {
  apiKey: document.getElementById('api-key'),
  modelName: document.getElementById('model-name'),
  saveApi: document.getElementById('save-api'),
  clearApi: document.getElementById('clear-api'),
  testApi: document.getElementById('test-api'),
  apiStatus: document.getElementById('api-status'),
  generatePlan: document.getElementById('generate-plan'),
  heroCtaRow: document.getElementById('hero-cta-row'),
  genStatus: document.getElementById('gen-status'),
  checklist: document.getElementById('daily-checklist'),
  todayDate: document.getElementById('today-date'),
  completedDays: document.getElementById('completed-days'),
  todayProgress: document.getElementById('today-progress'),
  streak: document.getElementById('streak'),
  weeklyTime: document.getElementById('weekly-time'),
  readingBox: document.getElementById('reading-box'),
  listeningBox: document.getElementById('listening-box'),
  readingQa: document.getElementById('reading-qa'),
  checkReading: document.getElementById('check-reading'),
  readingFeedback: document.getElementById('reading-feedback'),
  speakingBox: document.getElementById('speaking-box'),
  writingBox: document.getElementById('writing-box'),
  vocabBox: document.getElementById('vocab-box'),
  grammarBox: document.getElementById('grammar-box'),
  speakingAnswer: document.getElementById('speaking-answer'),
  writingAnswer: document.getElementById('writing-answer'),
  checkSpeaking: document.getElementById('check-speaking'),
  checkWriting: document.getElementById('check-writing'),
  speakingFeedback: document.getElementById('speaking-feedback'),
  writingFeedback: document.getElementById('writing-feedback'),
  vocabFlashNext: document.getElementById('vocab-flash-next'),
  vocabFlashToggle: document.getElementById('vocab-flash-toggle'),
  vocabFlashcard: document.getElementById('vocab-flashcard'),
  vocabPractice: document.getElementById('vocab-practice'),
  vocabPracticeResult: document.getElementById('vocab-practice-result'),
  vocabQuizNext: document.getElementById('vocab-quiz-next'),
  vocabQuizUnknown: document.getElementById('vocab-quiz-unknown'),
  vocabQuizScore: document.getElementById('vocab-quiz-score'),
  grammarPractice: document.getElementById('grammar-practice'),
  checkGrammar: document.getElementById('check-grammar'),
  grammarResult: document.getElementById('grammar-result'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  authLogin: document.getElementById('auth-login'),
  authLogout: document.getElementById('auth-logout'),
  authStatus: document.getElementById('auth-status'),
  syncBackfill: document.getElementById('sync-backfill'),
  syncStatus: document.getElementById('sync-status'),
  phaseSelect: document.getElementById('phase-select'),
  phaseNote: document.getElementById('phase-note'),
  readingHighlight: document.getElementById('reading-highlight'),
  readingHidePassage: document.getElementById('reading-hide-passage'),
  readingTranslateToggle: document.getElementById('reading-translate-toggle'),
  readingTranslateStatus: document.getElementById('reading-translate-status'),
  readingTranslateTooltip: document.getElementById('reading-translate-tooltip'),
  readingKeywords: document.getElementById('reading-keywords'),
  readingNoteWordManual: document.getElementById('reading-note-word-manual'),
  readingNoteMeaningManual: document.getElementById('reading-note-meaning-manual'),
  readingNoteExampleManual: document.getElementById('reading-note-example-manual'),
  readingSaveWord: document.getElementById('reading-save-word'),
  readingWordList: document.getElementById('reading-word-list'),
  readingNoteStatus: document.getElementById('reading-note-status'),
  readingSaveSelected: document.getElementById('reading-save-selected'),
  readingUncheckAll: document.getElementById('reading-uncheck-all'),
  readingNoteSummary: document.getElementById('reading-note-summary'),
  phaseSummaryInline: document.getElementById('phase-summary-inline'),
  planPhaseSummary: document.getElementById('plan-phase-summary'),
  planStatusBadge: document.getElementById('plan-status-badge'),
  reviewTodayCard: document.getElementById('review-today-card'),
  coachMessage: document.getElementById('coach-message'),
  heroProgressRing: document.getElementById('hero-progress-ring'),
  heroProgressFraction: document.getElementById('hero-progress-fraction'),
  heroProgressPercent: document.getElementById('hero-progress-percent'),
  heroPhase: document.getElementById('hero-phase')
};

let state = JSON.parse(localStorage.getItem(KEY) || '{}');
if (!state.settings) state.settings = { apiKey: '', model: 'gemini-1.5-flash' };
if (!state.days) state.days = {};
if (!state.days[dateKey]) state.days[dateKey] = { plan: null, tasks: [] };
if (!state.phase) state.phase = 'phase1';
if (!state.readingNotebook) state.readingNotebook = [];
if (!state.readingNotes) state.readingNotes = [];
if (!state.days[dateKey].listening) state.days[dateKey].listening = { openedVideo: false, listened10Min: false, captured3Phrases: false, note: '' };
let cloudOnlyMode = false;
let readingTranslateEnabled = false;
let readingDraftNote = null;
let globalEventsBound = false;
let questCelebratedDate = null;
let lastReadingSelectionText = "";
let readingPopoverOpen = false;
let readingSelectionTimer = null;

function save() {
  const fullState = JSON.parse(localStorage.getItem(KEY) || '{}');
  fullState.settings = state.settings;
  fullState.phase = state.phase;
  fullState.days = state.days;
  fullState.readingNotebook = state.readingNotebook || [];
  fullState.readingNotes = state.readingNotes || [];
  localStorage.setItem(KEY, JSON.stringify(fullState));
}

function saveLocalUiState() {
  const fullState = JSON.parse(localStorage.getItem(KEY) || '{}');
  fullState.phase = state.phase;
  fullState.days = state.days;
  localStorage.setItem(KEY, JSON.stringify(fullState));
}

function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function sanitize(text = '') { return escapeHTML(text); }

const PHASE_CONFIG = {
  phase1: { label: 'Giai đoạn 1', levelBias: 'B1', focus: 'Nền tảng từ vựng + grammar cơ bản + reading ngắn' },
  phase2: { label: 'Giai đoạn 2', levelBias: 'B1+', focus: 'Cân bằng 4 kỹ năng + tăng độ dài bài đọc/listening' },
  phase3: { label: 'Giai đoạn 3', levelBias: 'B2/C1', focus: 'Bài sát đề thi IELTS/TOEIC, khó hơn, có bẫy từ vựng' }
};

function renderPhaseNote() {
  const c = PHASE_CONFIG[state.phase] || PHASE_CONFIG.phase1;
  const summary = `${c.label} · ${c.levelBias} · ${c.focus}`;
  if (el.phaseNote) el.phaseNote.textContent = `${c.label}: ${c.focus} (${c.levelBias})`;
  if (el.phaseSummaryInline) el.phaseSummaryInline.textContent = summary;
  if (el.planPhaseSummary) el.planPhaseSummary.textContent = `Thiết lập hiện tại: ${summary}`;
  const details = document.getElementById('ai-plan-settings');
  if (details && !details.hasAttribute('data-user-toggled')) {
    details.open = !state.days[dateKey]?.plan;
  }
}

async function callGemini(prompt) {
  const apiKey = state.settings.apiKey;
  const model = state.settings.model || 'gemini-1.5-flash';
  if (!apiKey) throw new Error('Chưa có API key');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json', temperature: 0.7 }
    })
  });
  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err?.error?.message || '';
    } catch (_) {}
    if (res.status === 404) {
      throw new Error('Model không tồn tại hoặc không được hỗ trợ với endpoint này. Hãy đổi model (gợi ý: gemini-1.5-flash). ' + detail);
    }
    throw new Error(`API lỗi ${res.status}${detail ? `: ${detail}` : ''}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text);
}


async function testApiConnection() {
  const result = await callGemini('Trả JSON thuần: {"ok":true,"message":"connected"}');
  return result;
}

function getDifficultyLevel() {
  const days = Object.keys(state.days || {}).sort();
  if (!days.length) return 1;
  const recent = days.slice(-7).map(d => state.days[d]).filter(Boolean);
  let doneScore = 0;
  recent.forEach(day => {
    const tasks = day.tasks || [];
    if (!tasks.length) return;
    doneScore += tasks.filter(t => t.done).length / tasks.length;
  });
  const avg = recent.length ? doneScore / recent.length : 0;
  return Math.max(1, Math.min(7, 1 + Math.floor(avg * 6)));
}

function getRecentHistorySummary(limitDays = 14) {
  const days = Object.keys(state.days || {}).sort().slice(-limitDays);
  const words = [];
  const points = [];
  days.forEach(d => {
    const plan = state.days[d]?.plan;
    (plan?.vocabulary || []).forEach(v => words.push(v.word));
    (plan?.grammar || []).forEach(g => points.push(g.point));
  });
  return {
    recentWords: [...new Set(words)].slice(-120),
    recentGrammarPoints: [...new Set(points)].slice(-120)
  };
}

async function generateDailyPlan() {
  const level = getDifficultyLevel();
  const history = getRecentHistorySummary(14);
  const phase = PHASE_CONFIG[state.phase] || PHASE_CONFIG.phase1;
  const prompt = `Tạo JSON thuần cho kế hoạch học tiếng Anh trong 1 ngày cho người Việt mục tiêu IELTS 6.5 + TOEIC 750.
Giai đoạn hiện tại: ${phase.label}. Định hướng: ${phase.focus}. Độ khó mục tiêu: ${phase.levelBias}.
Độ khó hiện tại: ${level}/7 (1 dễ -> 7 khó).
Tăng độ khó theo level: level thấp dùng câu ngắn + từ B1; level cao dùng câu dài hơn + từ học thuật B2/C1.
KHÔNG lặp lại từ/chủ điểm sau (14 ngày gần đây):
- Từ vựng đã dùng: ${history.recentWords.join(', ') || 'none'}
- Grammar points đã dùng: ${history.recentGrammarPoints.join(', ') || 'none'}
Schema:
{
 "reading":{"title":"","passage":"","questions":["","",""],"answers":["","",""],"duration":25},
 "listening":{"title":"","youtubeUrl":"","youtubeQuery":"","task":"","duration":20},
 "speaking":{"question":"","hints":["",""],"duration":20},
 "writing":{"question":"","hints":["",""],"duration":30},
 "vocabulary":[{"word":"","meaning":"","example":""}],
 "grammar":[{"point":"","exercise":"","answer":""}],
 "checklist":[{"label":"","duration":15}]
}
Yêu cầu:
- vocabulary đúng 12 từ
- grammar đúng 8 bài
- reading passage 120-180 words
- checklist gồm đủ 6 mục ứng với các phần trên.`;
  return callGemini(prompt);
}

function getUnmasteredReadingNotes() {
  return (state.readingNotes || []).filter(n => n.selectedForDb && !n.mastered && n.word && n.meaning);
}

function applyNotesToVocabulary(plan) {
  const targetCount = 12;
  const notePool = getUnmasteredReadingNotes().map(n => ({ word: n.word, meaning: n.meaning, example: n.example || '' }));
  const existing = (plan.vocabulary || []).filter(v => v.word && v.meaning);
  const seen = new Set();
  const merged = [];
  notePool.forEach(v => {
    const key = String(v.word).trim().toLowerCase();
    if (key && !seen.has(key)) { seen.add(key); merged.push(v); }
  });
  existing.forEach(v => {
    const key = String(v.word).trim().toLowerCase();
    if (key && !seen.has(key)) { seen.add(key); merged.push(v); }
  });
  plan.vocabulary = merged.slice(0, targetCount);
  return { usedNotes: Math.min(notePool.length, targetCount), needsFill: notePool.length < targetCount };
}


function showToast(message = 'Đã lưu') {
  let t = document.getElementById('app-toast');
  if (!t) { t = document.createElement('div'); t.id = 'app-toast'; t.className = 'app-toast'; document.body.appendChild(t); }
  t.textContent = message; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}
function renderPlanStatusBadge() {
  const day = state.days[dateKey] || {};
  ensureDailyTasks(day);
  if (!el.planStatusBadge) return;
  const pct = day.tasks?.length ? Math.round((day.tasks.filter(t => t.done).length/day.tasks.length)*100) : 0;
  if (!day.plan) { el.planStatusBadge.textContent = 'Chưa có kế hoạch'; el.planStatusBadge.className='note-badge pending'; return; }
  if (pct===100) { el.planStatusBadge.textContent='Hoàn thành hôm nay'; el.planStatusBadge.className='note-badge ok'; return; }
  el.planStatusBadge.textContent='AI Plan Ready'; el.planStatusBadge.className='note-badge';
}

function getListeningState() {
  if (!state.days[dateKey].listening) {
    state.days[dateKey].listening = {
      openedVideo: false,
      listened10Min: false,
      captured3Phrases: false,
      note: ''
    };
  }
  return state.days[dateKey].listening;
}

function renderPlan(plan) {
  el.readingBox.innerHTML = `<h3>${sanitize(plan.reading.title)}</h3><p>${sanitize(plan.reading.passage)}</p><ol>${plan.reading.questions.map(q => `<li>${sanitize(q)}</li>`).join('')}</ol>`;
  const directUrl = (plan.listening.youtubeUrl || '').trim();
  const query = encodeURIComponent(plan.listening.youtubeQuery || 'english listening practice');
  const link = directUrl || `https://www.youtube.com/results?search_query=${query}`;
  const lState = getListeningState();
  const listeningDone = [lState.openedVideo, lState.listened10Min, lState.captured3Phrases].filter(Boolean).length;
  el.listeningBox.innerHTML = `<div class="youtube-card"><p><strong>🎬 ${sanitize(plan.listening.title)}</strong></p><p class="mini-progress">Listening routine: ${listeningDone}/3 bước</p><a class="yt-link" target="_blank" href="${sanitize(link)}">Mở YouTube Practice ↗</a><p class="muted">Nhiệm vụ: ${sanitize(plan.listening.task)}</p><div class="checklist">
  <label class="routine-step ${lState.openedVideo ? 'done' : ''}"><input type="checkbox" data-listening-check="openedVideo" ${lState.openedVideo ? 'checked' : ''}><span>1. Mở video</span></label>
  <label class="routine-step ${lState.listened10Min ? 'done' : ''}"><input type="checkbox" data-listening-check="listened10Min" ${lState.listened10Min ? 'checked' : ''}><span>2. Nghe 10 phút</span></label>
  <label class="routine-step ${lState.captured3Phrases ? 'done' : ''}"><input type="checkbox" data-listening-check="captured3Phrases" ${lState.captured3Phrases ? 'checked' : ''}><span>3. Ghi lại 3 cụm từ</span></label>
  </div><textarea id="listening-note" rows="4" placeholder="Ghi chú Listening hôm nay...">${sanitize(lState.note || '')}</textarea><div class="row"><button class="ghost" id="save-listening-note">Lưu ghi chú</button><button class="ghost mark-skill-done" data-skill="listening">Đánh dấu Listening hoàn thành</button></div></div>`;
  el.speakingBox.innerHTML = `<p><strong>Đề:</strong> ${sanitize(plan.speaking.question)}</p><ul>${plan.speaking.hints.map(h => `<li>${sanitize(h)}</li>`).join('')}</ul>`;
  el.writingBox.innerHTML = `<p><strong>Đề:</strong> ${sanitize(plan.writing.question)}</p><ul>${plan.writing.hints.map(h => `<li>${sanitize(h)}</li>`).join('')}</ul>`;
  el.vocabBox.innerHTML = plan.vocabulary.map(v => `<article class="vocab-item vocab-deck-item"><strong>${sanitize(v.word)}</strong><span>${sanitize(v.meaning)}</span><small>“${sanitize(v.example)}”</small></article>`).join('');
  el.grammarBox.innerHTML = plan.grammar.map(g => `<div class="vocab-item"><strong>${sanitize(g.point)}</strong><span>Bài tập: ${sanitize(g.exercise)}</span><small>Đáp án: ${sanitize(g.answer)}</small></div>`).join('');

  const readingQs = plan.reading.questions || [];
  el.readingQa.innerHTML = readingQs.map((q, i) => `<div class="vocab-item"><strong>Câu ${i + 1}</strong><span>${sanitize(q)}</span><input class="reading-input" data-i="${i}" placeholder="Nhập câu trả lời của bạn" /></div>`).join('');
  el.readingFeedback.textContent = '';

}

function ensureDailyTasks(day) {
  if (!day) return;
  const hasTasks = Array.isArray(day.tasks) && day.tasks.length > 0;
  if (hasTasks) return;
  const checklist = day.plan?.checklist || [];
  if (!checklist.length) return;
  day.tasks = checklist.map(t => ({ label: String(t.label || '').trim() || 'Task', duration: Number(t.duration || 15), done: false }));
}
function iconForTask(label='') { const l=label.toLowerCase(); if(l.includes('read')) return '📖'; if(l.includes('listen')) return '🎧'; if(l.includes('speak')) return '🗣️'; if(l.includes('writ')) return '✍️'; if(l.includes('vocab')||l.includes('từ')) return '🧠'; if(l.includes('grammar')||l.includes('ngữ')) return '🧩'; return '✅'; }
function getTaskDestination(label = '') {
  const l = String(label).toLowerCase();
  if (l.includes('read')) return { tab: 'practice', skill: 'reading' };
  if (l.includes('listen')) return { tab: 'practice', skill: 'listening' };
  if (l.includes('speak')) return { tab: 'practice', skill: 'speaking' };
  if (l.includes('writ')) return { tab: 'practice', skill: 'writing' };
  if (l.includes('vocab') || l.includes('từ')) return { tab: 'notebook', skill: null };
  if (l.includes('grammar') || l.includes('ngữ')) return { tab: 'notebook', skill: null };
  return { tab: 'today', skill: null };
}
function getFirstPendingTask() { return (state.days[dateKey]?.tasks || []).find(t => !t.done) || null; }
function markTaskCompletedBySkill(skill) {
  const day = state.days[dateKey];
  if (!day?.tasks?.length) return;
  const idx = day.tasks.findIndex(t => {
    const d = getTaskDestination(t.label || '');
    const label = String(t.label || '').toLowerCase();
    if (skill === 'vocabulary') return d.tab === 'notebook' && (label.includes('vocab') || label.includes('từ')) && !t.done;
    if (skill === 'grammar') return d.tab === 'notebook' && (label.includes('grammar') || label.includes('ngữ')) && !t.done;
    return d.tab === 'practice' && d.skill === skill && !t.done;
  });
  if (idx < 0) return;
  day.tasks[idx].done = true;
  save();
  upsertDayToSupabase(dateKey, day).catch(() => {});
  renderChecklist();
  renderTodaySummary();
  renderPlanStatusBadge();
  renderStats();
  updatePracticeSkillDoneState();
  showToast(`Đã đánh dấu ${skill} hoàn thành`);
}

function getCoachMessage(day) {
  const messages = {
    noPlan: ['Coach: Bắt đầu bằng cách tạo plan 6 skill cho hôm nay.', 'Coach: Một plan rõ ràng sẽ giúp bạn đỡ phân vân.'],
    inProgress: ['Coach: Cứ xong task tiếp theo, momentum sẽ tự lên.', 'Coach: Tiến đều mỗi ngày tốt hơn học dồn.'],
    completed: ['Coach: Tuyệt vời! Bạn đã hoàn thành Daily Quest hôm nay.', 'Coach: Hoàn tất 6/6 rồi, mai mình giữ streak tiếp nhé.']
  };
  const idx = new Date().getDate() % 2;
  if (!day?.tasks?.length) return messages.noPlan[idx];
  const done = day.tasks.filter(t=>t.done).length;
  if (done === day.tasks.length) return messages.completed[idx];
  return messages.inProgress[idx];
}

function renderHeroCta() {
  const day = state.days[dateKey] || {};
  const cta = el.heroCtaRow;
  if (!cta) return;
  ensureDailyTasks(day);
  const next = (day.tasks || []).find(t => !t.done);
  if (el.coachMessage) el.coachMessage.textContent = getCoachMessage(day);
  if (!day.tasks?.length) {
    cta.innerHTML = '<button id="generate-plan" class="btn-primary">Tạo kế hoạch hôm nay</button>';
    document.getElementById('generate-plan')?.addEventListener('click', handleGeneratePlan);
    return;
  }
  if (next) {
    cta.innerHTML = `<button class="btn-primary" id="hero-continue-task">Tiếp tục: ${sanitize(next.label)}</button>`;
    document.getElementById('hero-continue-task')?.addEventListener('click', () => startTask(next.label));
    return;
  }
  cta.innerHTML = '<button class="ghost" data-tab-jump="notebook">Xem sổ tay</button>';
}

function renderChecklist() {
  const day = state.days[dateKey];
  ensureDailyTasks(day);
  el.todayDate.textContent = `Hôm nay: ${dateKey}`;
  if (!day.tasks?.length) {
    el.checklist.innerHTML = '<p class="muted empty-state">Chưa có task hôm nay. Vào tab "Hôm nay" và bấm "Tạo kế hoạch hôm nay".</p>';
    return;
  }
  const nextIdx = day.tasks.findIndex(t => !t.done);
  el.checklist.innerHTML = day.tasks.map((t, i) => {
    const cls = t.done ? 'completed' : (i === nextIdx ? 'next' : 'ready');
    const badge = t.done ? 'DONE' : (i === nextIdx ? 'NEXT' : 'READY');
    return `<label class="task-item ${cls}"><input type="checkbox" data-i="${i}" ${t.done ? 'checked' : ''}><span class="check-item-label"><span class="task-icon-mini">${iconForTask(String(t.label||''))}</span><span>${sanitize(t.label)}</span></span><span class="task-badges"><small class="status-badge ${cls}">${badge}</small><small class="duration-badge">${t.duration} phút</small></span></label>`;
  }).join('');
  el.checklist.querySelectorAll('input').forEach(inp => inp.addEventListener('change', e => {
    const i = Number(e.target.dataset.i); day.tasks[i].done = e.target.checked; save(); upsertDayToSupabase(dateKey, day).catch(() => {}); renderChecklist(); renderTodaySummary(); renderStats(); updatePracticeSkillDoneState(); showToast('Đã cập nhật checklist');
  }));
}



function renderHeroProgress(day) {
  const tasks = day?.tasks || [];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length || 6;
  const pct = Math.round((done / total) * 100);
  if (el.heroProgressRing) el.heroProgressRing.style.setProperty('--pct', `${pct}`);
  if (el.heroProgressFraction) el.heroProgressFraction.textContent = `${done}/${total}`;
  if (el.heroProgressPercent) el.heroProgressPercent.textContent = `${pct}%`;
  const phase = PHASE_CONFIG[state.phase]?.label || 'Phase';
  if (el.heroPhase) el.heroPhase.textContent = `${phase} · ${state.phase}`;
  const hero = document.querySelector('.today-hero');
  hero?.classList.toggle('quest-complete', tasks.length>0 && done === tasks.length);
}

function renderTodaySummary() {
  const day = state.days[dateKey] || {};
  ensureDailyTasks(day);
  renderHeroCta();
  renderHeroProgress(day);
  const next = (day.tasks || []).find(t => !t.done);
  if (el.coachMessage) el.coachMessage.textContent = getCoachMessage(day);
  const elNext = document.getElementById('next-task');
  if (!elNext) return;
  if (!day.tasks?.length) {
    elNext.textContent = 'Chưa có kế hoạch cho hôm nay. Hãy tạo kế hoạch để bắt đầu học.';
    elNext.classList.add('empty-state');
    elNext.classList.remove('next-task-card');
    return;
  }
  if (!next) {
    elNext.textContent = '🎉 Quest complete! Bạn đã hoàn thành 6/6 nhiệm vụ hôm nay.';
    elNext.classList.add('empty-state','celebrate');
    elNext.classList.remove('next-task-card');
    if (questCelebratedDate !== dateKey) { showToast('Xuất sắc! Hoàn thành Daily Quest 6/6'); questCelebratedDate = dateKey; }
    return;
  }
  elNext.classList.remove('empty-state');
  elNext.classList.add('next-task-card');
  elNext.innerHTML = `<div class="next-task-main"><span class="task-icon">${iconForTask(String(next.label||''))}</span><div><strong>${sanitize(next.label)}</strong><div class="task-meta"><span class="note-badge pending">${next.duration} phút</span></div></div></div><button class="ghost" id="next-task-start">Bắt đầu</button>`;
  document.getElementById('next-task-start')?.addEventListener('click', () => startTask(next.label));
}

async function renderStatsCloudFirst() {
  const user = await currentUser();
  if (!user) { renderStats(); return; }

  const { data: plans, error: pErr } = await supa
    .from('daily_plans')
    .select('id,study_date')
    .eq('user_id', user.id)
    .order('study_date', { ascending: false })
    .limit(60);
  if (pErr || !plans?.length) { renderStats(); return; }

  const ids = plans.map(p => p.id);
  const { data: tasks, error: tErr } = await supa
    .from('daily_tasks')
    .select('daily_plan_id,is_done,duration_min')
    .in('daily_plan_id', ids);
  if (tErr || !tasks) { renderStats(); return; }

  const byPlan = new Map();
  tasks.forEach(t => {
    if (!byPlan.has(t.daily_plan_id)) byPlan.set(t.daily_plan_id, []);
    byPlan.get(t.daily_plan_id).push(t);
  });

  const completed = plans.filter(p => {
    const arr = byPlan.get(p.id) || [];
    return arr.length && arr.every(x => x.is_done);
  }).length;

  const todayPlan = plans.find(p => p.study_date === dateKey);
  const todayTasks = todayPlan ? (byPlan.get(todayPlan.id) || []) : [];
  const todayPct = todayTasks.length ? Math.round((todayTasks.filter(t => t.is_done).length / todayTasks.length) * 100) : 0;

  let streak = 0;
  for (const p of plans) {
    const arr = byPlan.get(p.id) || [];
    if (arr.length && arr.every(x => x.is_done)) streak += 1;
    else break;
  }

  const weekAgo = Date.now() - 7 * 86400000;
  let mins = 0;
  plans.forEach(p => {
    const ts = new Date(p.study_date).getTime();
    if (ts < weekAgo) return;
    (byPlan.get(p.id) || []).filter(x => x.is_done).forEach(x => { mins += Number(x.duration_min || 0); });
  });

  el.completedDays.textContent = completed;
  el.todayProgress.textContent = `${todayPct}%`;
  const pf = document.getElementById('today-progress-fill'); if (pf) pf.style.width = `${todayPct}%`;
  el.streak.textContent = streak;
  el.weeklyTime.textContent = `${(mins / 60).toFixed(1)}h`;
}

function extractReadingKeywords() {
  const plan = state.days[dateKey]?.plan;
  const qs = plan?.reading?.questions || [];
  const words = qs.join(' ').match(/[A-Za-z]{5,}/g) || [];
  const uniq = [...new Set(words.map(w => w.toLowerCase()))].slice(0, 12);
  return uniq;
}

function applyReadingKeywordHighlight() {
  const plan = state.days[dateKey]?.plan;
  const box = el.readingBox;
  if (!plan?.reading?.passage || !box) return;
  const kws = extractReadingKeywords();
  el.readingKeywords.textContent = kws.length ? `Keywords gợi ý: ${kws.join(', ')}` : 'Không tìm thấy keyword nổi bật.';
  let html = `<h3>${sanitize(plan.reading.title)}</h3><p>${sanitize(plan.reading.passage)}</p><ol>${(plan.reading.questions||[]).map(q => `<li>${sanitize(q)}</li>`).join('')}</ol>`;
  kws.forEach(k => {
    const re = new RegExp(`\b(${k})\b`, 'gi');
    html = html.replace(re, '<mark class="keyword">$1</mark>');
  });
  box.innerHTML = html;
}

function toggleReadingPassage() {
  const p = el.readingBox.querySelector('p');
  if (!p) return;
  p.style.display = p.style.display === 'none' ? '' : 'none';
}



function mergeReadingNotes(list = []) {
  const merged = [];
  const seen = new Set();
  list.forEach((n) => {
    const word = String(n.word || '').trim();
    const meaning = String(n.meaning || '').trim();
    if (!word || !meaning) return;
    const key = word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({
      id: n.id || crypto.randomUUID(),
      word,
      meaning,
      example: String(n.example || '').trim(),
      selectedForDb: !!n.selectedForDb,
      mastered: !!n.mastered,
      source: n.source || 'db'
    });
  });
  state.readingNotes = merged.slice(0, 500);
}

function renderReadingNotebook() {
  const notes = state.readingNotes || [];
  const selectedCount = notes.filter(n => n.selectedForDb).length;
  const unsyncedCount = notes.filter(n => !n.selectedForDb).length;
  if (el.readingNoteSummary) {
    el.readingNoteSummary.textContent = `Notebook: ${notes.length} từ | Chờ sync DB: ${unsyncedCount} | Đã tick lưu DB: ${selectedCount}`;
  }

  el.readingWordList.innerHTML = notes.map((n, i) => `
    <li class="vocab-item note-item ${n.selectedForDb ? 'note-synced' : 'note-local'}">
      <strong>${i + 1}. ${sanitize(n.word || '')}</strong>
      <span>Nghĩa: ${sanitize(n.meaning || '')}</span>
      <small>Ví dụ: ${sanitize(n.example || '')}</small>
      <small class="note-badge ${n.selectedForDb ? 'ok' : 'pending'}">${n.selectedForDb ? 'Đã chọn lưu DB' : 'Chỉ ở notebook'}</small>
      <label><input type="checkbox" class="note-select-db" data-id="${sanitize(n.id)}" ${n.selectedForDb ? 'checked' : ''}/> Lưu vào DB</label>
      <label><input type="checkbox" class="note-mastered" data-id="${sanitize(n.id)}" ${n.mastered ? 'checked' : ''}/> Đã thuộc</label>
    </li>
  `).join('');

  el.readingWordList.querySelectorAll('.note-select-db').forEach(inp => inp.addEventListener('change', async (e) => {
    const id = e.target.dataset.id;
    const note = state.readingNotes.find(x => x.id === id);
    if (!note) return;
    note.selectedForDb = e.target.checked;
    save();
    renderReadingNotebook();
    if (note.selectedForDb) {
      await upsertReadingNoteToSupabase(note).catch((err) => { if (el.readingNoteStatus) el.readingNoteStatus.textContent = err.message; });
    }
  }));

  el.readingWordList.querySelectorAll('.note-mastered').forEach(inp => inp.addEventListener('change', async (e) => {
    const id = e.target.dataset.id;
    const note = state.readingNotes.find(x => x.id === id);
    if (!note) return;
    note.mastered = e.target.checked;
    save();
    if (note.selectedForDb) await upsertReadingNoteToSupabase(note).catch((err) => { if (el.readingNoteStatus) el.readingNoteStatus.textContent = err.message; });
  }));
}

function setReadingTranslateStatus(msg) {
  if (el.readingTranslateStatus) el.readingTranslateStatus.textContent = msg;
}

function hideReadingTranslateTooltip() {
  if (!el.readingTranslateTooltip) return;
  el.readingTranslateTooltip.hidden = true;
  el.readingTranslateTooltip.innerHTML = '';
  readingDraftNote = null;
}

function createReadingNote(word, meaning, example, source = 'manual') {
  const w = String(word || '').trim();
  const m = String(meaning || '').trim();
  const ex = String(example || '').trim();
  if (!w || !m) return { ok: false, msg: 'Thiếu từ hoặc nghĩa.' };
  const existed = state.readingNotes.find(n => n.word.toLowerCase() === w.toLowerCase());
  if (existed) return { ok: false, msg: `Từ "${w}" đã tồn tại, hãy tự chọn giữ bản nào.` };
  state.readingNotes.unshift({ id: crypto.randomUUID(), word: w, meaning: m, example: ex, selectedForDb: false, mastered: false, source });
  state.readingNotes = state.readingNotes.slice(0, 200);
  save();
  renderReadingNotebook();
  return { ok: true, msg: `Đã lưu note "${w}" vào notebook. Tick "Lưu vào DB" để đồng bộ.` };
}

function showReadingTranslateTooltip(html, x, y) {
  if (!el.readingTranslateTooltip) return;
  const pad = 12;
  el.readingTranslateTooltip.innerHTML = html;
  el.readingTranslateTooltip.hidden = false;
  const maxX = window.innerWidth - el.readingTranslateTooltip.offsetWidth - pad;
  const maxY = window.innerHeight - el.readingTranslateTooltip.offsetHeight - pad;
  el.readingTranslateTooltip.style.left = `${Math.max(pad, Math.min(x + 8, maxX))}px`;
  el.readingTranslateTooltip.style.top = `${Math.max(pad, Math.min(y + 8, maxY))}px`;
}

function saveReadingDraftNote() {
  if (!readingDraftNote) return;
  const wordEl = document.getElementById('reading-note-word');
  const meaningEl = document.getElementById('reading-note-meaning');
  const exampleEl = document.getElementById('reading-note-example');
  const word = (wordEl?.value || readingDraftNote.word || '').trim();
  const meaning = (meaningEl?.value || '').trim();
  const example = (exampleEl?.value || '').trim();
  if (!word || !meaning) return { ok: false, msg: 'Thiếu từ hoặc nghĩa.' };
  const result = createReadingNote(word, meaning, example, 'selection');
  if (el.readingNoteStatus) el.readingNoteStatus.textContent = result.msg;
  return result;
}

function showReadingNotePopover(word, x, y) {
  readingPopoverOpen = true;
  readingDraftNote = { word };
  showReadingTranslateTooltip(`
    <div><strong>Thêm note</strong></div>
    <label>Từ/cụm từ<input id="reading-note-word" value="${sanitize(word)}" /></label>
    <label>Nghĩa<input id="reading-note-meaning" placeholder="Nhập nghĩa tiếng Việt" /></label>
    <label>Ví dụ<input id="reading-note-example" placeholder="Ví dụ ngắn (tuỳ chọn)" /></label>
    <div class="row"><button id="reading-note-confirm" class="ghost" type="button">Lưu note</button></div><small class="muted">Bạn có thể bấm nút Lưu note hoặc click ra ngoài để lưu.</small>
  `, x, y);
  document.getElementById('reading-note-confirm')?.addEventListener('click', () => {
    const result = saveReadingDraftNote();
    if (result?.ok) {
      showToast('Đã lưu note Reading');
      window.getSelection()?.removeAllRanges();
      hideReadingTranslateTooltip();
      setReadingTranslateStatus('Đã lưu note Reading.');
    }
  });
}

async function translateSelectedReadingText() {
  if (!readingTranslateEnabled) return;
  const selection = window.getSelection();
  const text = (selection?.toString() || '').trim().replace(/\s+/g, ' ');
  if (!text || text.length < 2) return;
  if (!el.readingBox.contains(selection.anchorNode) || !el.readingBox.contains(selection.focusNode)) return;
  if (readingPopoverOpen && text === lastReadingSelectionText) return;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  lastReadingSelectionText = text;
  showReadingNotePopover(text, rect.right, rect.bottom);
  setReadingTranslateStatus('Đang note từ/cụm từ. Click ra ngoài để lưu.');
}

function toggleReadingTranslate() {
  readingTranslateEnabled = !readingTranslateEnabled;
  if (el.readingTranslateToggle) el.readingTranslateToggle.textContent = readingTranslateEnabled ? 'Tắt note bôi đen' : 'Bật note bôi đen';
  setReadingTranslateStatus(readingTranslateEnabled ? 'Đã bật note bôi đen. Hãy chọn một từ/cụm từ trong bài đọc.' : 'Đã tắt note bôi đen.');
  if (!readingTranslateEnabled) hideReadingTranslateTooltip();
}

function saveReadingWord() {
  const word = (el.readingNoteWordManual?.value || '').trim();
  const meaning = (el.readingNoteMeaningManual?.value || '').trim();
  const example = (el.readingNoteExampleManual?.value || '').trim();
  if (!word || !meaning) { if (el.readingNoteStatus) el.readingNoteStatus.textContent = 'Vui lòng nhập đủ Từ/cụm từ và Nghĩa.'; return; }
  const result = createReadingNote(word, meaning, example, 'manual');
  if (result.ok) {
    if (el.readingNoteWordManual) el.readingNoteWordManual.value = '';
    if (el.readingNoteMeaningManual) el.readingNoteMeaningManual.value = '';
    if (el.readingNoteExampleManual) el.readingNoteExampleManual.value = '';
    showToast('Đã lưu từ vào notebook');
  }
  if (el.readingNoteStatus) el.readingNoteStatus.textContent = result.msg;
}

function renderStats() {
  const days = Object.keys(state.days);
  const completed = days.filter(d => state.days[d].tasks.length && state.days[d].tasks.every(t => t.done)).length;
  const today = state.days[dateKey];
  const pct = today.tasks.length ? Math.round((today.tasks.filter(t => t.done).length / today.tasks.length) * 100) : 0;
  const weekMs = 7 * 86400000;
  let mins = 0;
  days.forEach(d => {
    if (Date.now() - new Date(d).getTime() > weekMs) return;
    state.days[d].tasks.filter(t => t.done).forEach(t => mins += Number(t.duration || 0));
  });

  let streak = 0;
  const sorted = [...days].sort().reverse();
  for (const d of sorted) {
    const doneAll = state.days[d].tasks.length && state.days[d].tasks.every(t => t.done);
    if (doneAll) streak += 1;
    else break;
  }

  el.completedDays.textContent = completed;
  el.todayProgress.textContent = `${pct}%`;
  const pf = document.getElementById('today-progress-fill'); if (pf) pf.style.width = `${pct}%`;
  el.streak.textContent = streak;
  el.weeklyTime.textContent = `${(mins / 60).toFixed(1)}h`;
}


function normalizeReadingText(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeaningfulTokens(text = '') {
  const stop = new Set(['a','an','the','is','are','was','were','to','of','in','on','for','and','or','that','this','it','as','by','with','be','at','from']);
  return normalizeReadingText(text).split(' ').filter(t => t.length > 2 && !stop.has(t));
}

function isReadingAnswerAcceptable(userAnswer, expectedAnswer) {
  const userNorm = normalizeReadingText(userAnswer);
  const ansNorm = normalizeReadingText(expectedAnswer);
  if (!userNorm || !ansNorm) return false;
  if (userNorm === ansNorm) return true;
  if (userNorm.includes(ansNorm) || ansNorm.includes(userNorm)) return true;

  const userTokens = getMeaningfulTokens(userNorm);
  const ansTokens = getMeaningfulTokens(ansNorm);
  if (!userTokens.length || !ansTokens.length) return false;
  const ansSet = new Set(ansTokens);
  const common = userTokens.filter(t => ansSet.has(t)).length;
  const overlap = common / ansTokens.length;
  return overlap >= 0.6;
}

function checkReadingAnswers() {
  const plan = state.days[dateKey].plan;
  const answers = plan?.reading?.answers || [];
  const inputs = [...document.querySelectorAll('.reading-input')];
  if (!answers.length || !inputs.length) { el.readingFeedback.textContent = 'Chưa có dữ liệu đáp án reading trong plan.'; return; }
  let correct = 0;
  const details = [];
  inputs.forEach((inp, idx) => {
    const user = (inp.value || '').trim();
    const ans = String(answers[idx] || '').trim();
    const ok = isReadingAnswerAcceptable(user, ans);
    if (ok) correct += 1;
    details.push({ idx: idx + 1, ok, answer: ans || 'N/A' });
  });
  el.readingFeedback.innerHTML = `<article class="reading-report"><strong>Reading Report</strong><div class="report-row">Score: ${correct}/${answers.length}</div>${details.map(d => `<div class="report-row ${d.ok ? 'is-correct' : 'is-wrong'}">Câu ${d.idx}: ${d.ok ? 'Đúng' : `Sai · Đáp án gợi ý: ${sanitize(d.answer)}`}</div>`).join('')}<div class="row"><button class="ghost mark-skill-done" data-skill="reading">Đánh dấu hoàn thành</button></div></article>`;
}

async function checkAnswer(skill, question, answer, outEl) {
  if (!answer.trim()) return;
  outEl.textContent = 'Đang chấm bằng AI...';
  try {
    const result = await callGemini(`Bạn là giám khảo ${skill}. Câu hỏi: ${question}. Câu trả lời của học viên: ${answer}. Trả JSON: {"score":0-10,"feedback":"","fix":""}`);
    outEl.innerHTML = `<div class="report-card"><strong>${sanitize(skill)} Report</strong><div>Điểm: ${sanitize(result.score)}/10</div><div>Nhận xét: ${sanitize(result.feedback)}</div><div>Gợi ý sửa: ${sanitize(result.fix)}</div></div><span>Đã xong phần này?</span> <button class="ghost mark-skill-done" data-skill="${sanitize(skill.toLowerCase())}">Đánh dấu hoàn thành</button>`;
  } catch (e) {
    outEl.textContent = `Không chấm được: ${e.message}`;
  }
}

el.saveApi.addEventListener('click', () => {
  state.settings.apiKey = el.apiKey.value.trim();
  state.settings.model = el.modelName.value.trim() || 'gemini-1.5-flash';
  save();
  el.apiStatus.textContent = 'Đã lưu cấu hình API ✅';
});

el.clearApi.addEventListener('click', () => {
  state.settings.apiKey = '';
  save();
  el.apiKey.value = '';
  el.apiStatus.textContent = 'Đã xóa API key.';
});

async function handleGeneratePlan() {
  el.genStatus.textContent = 'Đang sinh dữ liệu học hôm nay...';
  try {
    const plan = await generateDailyPlan();
    const noteBlend = applyNotesToVocabulary(plan);
    state.days[dateKey].plan = plan;
    state.days[dateKey].tasks = (plan.checklist || []).map(t => ({ ...t, done: false }));
    ensureDailyTasks(state.days[dateKey]);
    save();
    await upsertDayToSupabase(dateKey, state.days[dateKey]);
    await loadTodayVocabGrammarFromSupabase().catch(() => {});
    renderPlan(plan);
    renderChecklist();
    renderTodaySummary();
    renderPlanStatusBadge();
    renderStats();
    renderVocabTools();
    renderGrammarTools();
    renderNotebookReviewCard();
    el.genStatus.textContent = `Đã sinh dữ liệu thành công ✅ (${noteBlend.usedNotes} từ từ note${noteBlend.needsFill ? ', còn lại do AI bổ sung' : ''}).`;
  } catch (e) {
    el.genStatus.textContent = `Lỗi sinh dữ liệu: ${e.message}`;
  }
}
if (el.generatePlan) el.generatePlan.addEventListener('click', handleGeneratePlan);

el.checkSpeaking.addEventListener('click', () => {
  const q = state.days[dateKey].plan?.speaking?.question || 'Speaking practice';
  checkAnswer('Speaking', q, el.speakingAnswer.value, el.speakingFeedback);
});

el.checkWriting.addEventListener('click', () => {
  const q = state.days[dateKey].plan?.writing?.question || 'Writing practice';
  checkAnswer('Writing', q, el.writingAnswer.value, el.writingFeedback);
});



let currentFlashIndex = -1;
let flashShowMeaning = false;
let vocabQuizState = { total: 0, correct: 0, mastered: 0 };
let vocabQuizPool = [];
let currentQuizTarget = null;
let dbLoadedVocab = [];
let dbLoadedGrammar = [];
function getTodayVocab() {
  const fromDb = dbLoadedVocab.filter(v => v.word && v.meaning);
  if (fromDb.length) return fromDb;
  return (state.days[dateKey]?.plan?.vocabulary || []).filter(v => v.word && v.meaning);
}
function getTodayGrammar() {
  const fromDb = dbLoadedGrammar.filter(g => g.point && g.exercise && g.answer);
  if (fromDb.length) return fromDb;
  return (state.days[dateKey]?.plan?.grammar || []).filter(g => g.point && g.exercise && g.answer);
}

function startVocabQuizRound() {
  const vocab = getTodayVocab();
  vocabQuizPool = vocab.map(v => ({ ...v, key: normalizeReadingText(v.word) + '|' + normalizeReadingText(v.meaning) }));
  vocabQuizState = { total: 0, correct: 0, mastered: 0 };
  currentQuizTarget = null;
  renderNotebookReviewCard();
}

function renderVocabTools() {
  const vocab = getTodayVocab();
  if (!vocab.length) {
    el.vocabFlashcard.textContent = 'Chưa có từ vựng hôm nay. Hãy tạo kế hoạch trước.';
    el.vocabPractice.innerHTML = '';
    el.vocabQuizScore.textContent = '';
    return;
  }
  if (!vocabQuizPool.length) startVocabQuizRound();
  el.vocabQuizScore.textContent = `Tiến độ quiz: Thuộc ${vocabQuizState.mastered}/${vocab.length} | Lượt: ${vocabQuizState.total} | Đúng: ${vocabQuizState.correct}`;
  renderOneVocabQuestion();
  renderNotebookReviewCard();
}

function pickRandomQuizTarget() {
  if (!vocabQuizPool.length) return null;
  return vocabQuizPool[Math.floor(Math.random() * vocabQuizPool.length)];
}

function removeMasteredTarget(target) {
  if (!target) return;
  vocabQuizPool = vocabQuizPool.filter(v => v.key !== target.key);
  vocabQuizState.mastered += 1;
}

function markUnknownTarget(target) {
  if (!target) return;
  vocabQuizPool = vocabQuizPool.filter(v => v.key !== target.key);
  vocabQuizPool.push(target);
}

function renderOneVocabQuestion() {
  const vocab = getTodayVocab();
  if (vocab.length < 4) {
    el.vocabPractice.innerHTML = '<p class="muted">Cần ít nhất 4 từ vựng để làm quiz trắc nghiệm.</p>';
    el.vocabPracticeResult.textContent = '';
    return;
  }
  if (!vocabQuizPool.length) {
    el.vocabPractice.innerHTML = '<p><strong>🎉 Bạn đã thuộc hết vòng quiz hiện tại.</strong> Bấm "Bắt đầu/Đổi vòng quiz" để luyện lại từ đầu.</p>';
    el.vocabPracticeResult.textContent = 'Hoàn thành: tất cả từ đã trả lời đúng ít nhất 1 lần.';
    currentQuizTarget = null;
    return;
  }

  const target = pickRandomQuizTarget();
  currentQuizTarget = target;
  const targetMeaning = String(target.meaning || '').trim();
  const distractors = [...new Set(vocab
    .filter(v => normalizeReadingText(v.word) !== normalizeReadingText(target.word))
    .map(v => String(v.meaning || '').trim())
    .filter(m => m && normalizeReadingText(m) !== normalizeReadingText(targetMeaning)))].sort(() => Math.random() - 0.5).slice(0, 3);

  const options = [...distractors, targetMeaning].sort(() => Math.random() - 0.5);
  el.vocabPractice.innerHTML = `<p><strong>Chọn nghĩa đúng (1 đáp án):</strong> ${sanitize(target.word)}</p><div class="options">${options.map(o => `<button class="option" data-correct="${normalizeReadingText(o) === normalizeReadingText(targetMeaning)}">${sanitize(o)}</button>`).join('')}</div>`;
  el.vocabPracticeResult.textContent = '';

  const buttons = [...el.vocabPractice.querySelectorAll('button')];
  buttons.forEach(btn => btn.addEventListener('click', () => {
    if (buttons.some(b => b.disabled)) return;
    buttons.forEach(b => b.disabled = true);
    vocabQuizState.total += 1;
    const isCorrect = btn.dataset.correct === 'true';
    buttons.forEach(b => b.classList.add('disabled'));
    btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
    if (!isCorrect) { const right = buttons.find(b => b.dataset.correct === 'true'); right?.classList.add('is-correct'); }
    if (isCorrect) {
      vocabQuizState.correct += 1;
      removeMasteredTarget(target);
    } else {
      markUnknownTarget(target);
    }
    el.vocabQuizScore.textContent = `Tiến độ quiz: Thuộc ${vocabQuizState.mastered}/${vocab.length} | Lượt: ${vocabQuizState.total} | Đúng: ${vocabQuizState.correct}`;
    el.vocabPracticeResult.textContent = isCorrect
      ? `✅ Chính xác! Ví dụ: ${sanitize(target.example || '')}`
      : `❌ Chưa đúng. Đáp án: ${sanitize(targetMeaning)} (từ này sẽ quay lại)`;
    renderNotebookReviewCard();
    setTimeout(renderOneVocabQuestion, 450);
  }));
}

function nextFlashcard() {
  const vocab = getTodayVocab();
  if (!vocab.length) {
    el.vocabFlashcard.textContent = 'Chưa có từ vựng hôm nay. Hãy tạo kế hoạch trước.';
    return;
  }
  currentFlashIndex = (currentFlashIndex + 1) % vocab.length;
  flashShowMeaning = false;
  const w=vocab[currentFlashIndex];
  el.vocabFlashcard.innerHTML = `<div class="flash-face front"><small>Click để lật</small><strong>${sanitize(w.word)}</strong></div>`;
}

function toggleFlashMeaning() {
  const vocab = getTodayVocab();
  if (currentFlashIndex < 0 || !vocab.length) return;
  flashShowMeaning = !flashShowMeaning;
  const w = vocab[currentFlashIndex];
  el.vocabFlashcard.innerHTML = flashShowMeaning ? `<div class="flash-face back"><small>Click để quay lại</small><strong>${sanitize(w.word)}</strong><p>${sanitize(w.meaning)}</p><em>${sanitize(w.example)}</em></div>` : `<div class="flash-face front"><small>Click để lật</small><strong>${sanitize(w.word)}</strong></div>`;
}

function renderGrammarTools() {
  const grammar = getTodayGrammar();
  if (!grammar.length) {
    el.grammarPractice.innerHTML = '<p class="muted">Chưa có bài ngữ pháp hôm nay. Hãy tạo kế hoạch trước.</p>';
    return;
  }
  el.grammarPractice.innerHTML = grammar.map((g, i) => `<article class="vocab-item grammar-drill-item"><strong>${i + 1}. ${sanitize(g.point)}</strong><span class="drill-ex">${sanitize(g.exercise)}</span><input data-i="${i}" class="grammar-input" placeholder="Nhập đáp án của bạn" /><small class="muted">Drill ${i+1}</small></article>`).join('');
  el.grammarResult.textContent = '';
}

function checkGrammarAnswers() {
  const grammar = getTodayGrammar();
  const inputs = [...document.querySelectorAll('.grammar-input')];
  if (!grammar.length || !inputs.length) return;
  let correct = 0;
  inputs.forEach(inp => {
    const i = Number(inp.dataset.i);
    const user = (inp.value || '').trim().toLowerCase();
    const ans = String(grammar[i]?.answer || '').trim().toLowerCase();
    if (user && ans && user === ans) correct += 1;
  });
  el.grammarResult.textContent = `Bạn đúng ${correct}/${grammar.length} câu. Gợi ý: xem lại phần đáp án ở box Grammar drills.`;
}


function renderNotebookReviewCard() {
  if (!el.reviewTodayCard) return;
  const vocabCount = getTodayVocab().length;
  const grammarCount = getTodayGrammar().length;
  const total = vocabQuizState.total || 0;
  const mastered = vocabQuizState.mastered || 0;
  const still = Math.max(vocabCount - mastered, 0);
  el.reviewTodayCard.innerHTML = `<div><span>${vocabCount}</span><small>Words today</small></div><div><span>${grammarCount}</span><small>Grammar drills</small></div><div><span>${mastered}</span><small>Mastered</small></div><div><span>${still}</span><small>Still learning</small></div><div><span>${total}</span><small>Quiz attempts</small></div>`;
}

function activateTab(name) {
  const buttons = [...document.querySelectorAll('.tab-btn')];
  const panes = [...document.querySelectorAll('.tab-pane')];
  buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  panes.forEach(p => p.classList.toggle('active', p.dataset.tabPane === name));
}
function activatePracticeSkill(skill) {
  const skillBtns = [...document.querySelectorAll('.skill-btn')];
  const skillPanes = [...document.querySelectorAll('.practice-skill')];
  if (!skillBtns.length || !skillPanes.length) return;
  const valid = ['reading', 'listening', 'speaking', 'writing'].includes(skill) ? skill : 'reading';
  skillBtns.forEach(b => b.classList.toggle('active', b.dataset.skill === valid));
  skillPanes.forEach(p => p.classList.toggle('active-skill', p.dataset.skillPane === valid));
}
function updatePracticeSkillDoneState() {
  const tasks = state.days[dateKey]?.tasks || [];
  const doneMap = { reading: false, listening: false, speaking: false, writing: false };
  tasks.forEach(t => {
    const d = getTaskDestination(t.label || '');
    if (d.tab === 'practice' && d.skill && t.done) doneMap[d.skill] = true;
  });
  document.querySelectorAll('.skill-btn').forEach(btn => {
    const base = btn.dataset.baseLabel || btn.textContent.replace(' ✓', '').trim();
    btn.dataset.baseLabel = base;
    const done = doneMap[btn.dataset.skill];
    btn.textContent = done ? `${base} ✓` : base;
    btn.classList.toggle('done', !!done);
  });
}
function startTask(label) {
  const dest = getTaskDestination(label || '');
  activateTab(dest.tab);
  if (dest.tab === 'practice' && dest.skill) activatePracticeSkill(dest.skill);
}
function setupTabs() {
  const buttons = [...document.querySelectorAll('.tab-btn')];
  buttons.forEach(b => b.onclick = () => activateTab(b.dataset.tab));
  document.querySelectorAll('[data-tab-jump]').forEach(btn => btn.onclick = () => {
    const first = getFirstPendingTask();
    if (first) startTask(first.label || '');
    else activateTab('today');
  });
  document.getElementById('hero-cta-row')?.addEventListener('click', e => {
    const jump = e.target?.dataset?.tabJump;
    if (!jump) return;
    if (jump === 'practice') {
      const first = getFirstPendingTask();
      if (first) startTask(first.label || '');
      else activateTab('today');
      return;
    }
    activateTab(jump);
  });
  activateTab('today');
}



function setupPracticeSkills() {
  const skillBtns = [...document.querySelectorAll('.skill-btn')];
  const skillPanes = [...document.querySelectorAll('.practice-skill')];
  if (!skillBtns.length || !skillPanes.length) return;
  const firstPending = getFirstPendingTask();
  const dest = firstPending ? getTaskDestination(firstPending.label || '') : { tab: 'practice', skill: 'reading' };
  if (dest.tab === 'practice' && dest.skill) activatePracticeSkill(dest.skill);
  updatePracticeSkillDoneState();
  skillBtns.forEach(b => { b.onclick = () => activatePracticeSkill(b.dataset.skill); });
}

function setupGlobalEvents() {
  if (globalEventsBound) return;
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-listening-check]');
    if (!input) return;
    const key = input.dataset.listeningCheck;
    if (!key) return;
    const listening = getListeningState();
    listening[key] = !!input.checked;
    saveLocalUiState();
    showToast('Đã cập nhật Listening');
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.mark-skill-done');
    if (btn) {
      markTaskCompletedBySkill(btn.dataset.skill);
      return;
    }

    if (e.target?.id === 'save-listening-note') {
      const textarea = document.getElementById('listening-note');
      const listening = getListeningState();
      listening.note = textarea?.value || '';
      saveLocalUiState();
      showToast('Đã lưu ghi chú Listening');
      return;
    }

    const scrollBtn = e.target.closest('[data-scroll-target]');
    if (scrollBtn) {
      const targetId = scrollBtn.dataset.scrollTarget;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        activateTab('notebook');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof targetEl.focus === 'function') targetEl.focus();
        targetEl.classList.remove('highlight-target');
        void targetEl.offsetWidth;
        targetEl.classList.add('highlight-target');
        setTimeout(() => targetEl.classList.remove('highlight-target'), 1000);
      }
      showToast('Đã mở khu ôn tập');
    }
  });
  globalEventsBound = true;
}

function init() {
  if (window.location.protocol === 'file:') {
    el.genStatus.textContent = 'Bạn đang mở bằng file:// nên có thể gặp lỗi bảo mật khi gọi API. Hãy chạy: python3 -m http.server 8000 rồi mở http://localhost:8000';
  }
  el.apiKey.value = state.settings.apiKey || '';
  if (el.phaseSelect) el.phaseSelect.value = state.phase;
  el.modelName.value = state.settings.model || 'gemini-1.5-flash';
  if (state.days[dateKey].plan) renderPlan(state.days[dateKey].plan);
  ensureDailyTasks(state.days[dateKey]);
  renderChecklist();
  renderTodaySummary();
  renderPlanStatusBadge();
  renderStatsCloudFirst();
  renderPhaseNote();
  renderReadingNotebook();
  renderVocabTools();
  renderGrammarTools();
  renderNotebookReviewCard();
  setupTabs();
  setupPracticeSkills();
  setupGlobalEvents();
  document.getElementById('ai-plan-settings')?.addEventListener('toggle', (e) => {
    e.currentTarget.setAttribute('data-user-toggled', '1');
  });
}

async function bootstrap() {
  const user = await currentUser();
  cloudOnlyMode = !!user;
  if (cloudOnlyMode) save();
  init();
  await loadTodayFromSupabase();
  await loadAllReadingNotesFromSupabase().catch(() => {});
  renderReadingNotebook();
  if (state.days[dateKey].plan) {
    await loadTodayVocabGrammarFromSupabase().catch(() => {});
    renderPlan(state.days[dateKey].plan);
    renderChecklist();
    renderTodaySummary();
    renderNotebookReviewCard();
    renderPhaseNote();
    renderStats();
    renderVocabTools();
    renderGrammarTools();
    setupPracticeSkills();
  }
}
bootstrap();


el.testApi?.addEventListener('click', async () => {
  el.apiStatus.textContent = 'Đang test kết nối...';
  try {
    const r = await testApiConnection();
    el.apiStatus.textContent = `Kết nối OK ✅ (${JSON.stringify(r).slice(0, 80)})`;
  } catch (e) {
    el.apiStatus.textContent = `Test thất bại: ${e.message}`;
  }
});


el.vocabFlashNext?.addEventListener('click', nextFlashcard);
el.vocabFlashToggle?.addEventListener('click', toggleFlashMeaning);
el.vocabFlashcard?.addEventListener('click', toggleFlashMeaning);
el.checkGrammar?.addEventListener('click', checkGrammarAnswers);

el.vocabQuizNext?.addEventListener('click', () => { startVocabQuizRound(); renderVocabTools(); });
el.vocabQuizUnknown?.addEventListener('click', () => {
  if (!currentQuizTarget) return;
  const totalVocab = getTodayVocab().length;
  vocabQuizState.total += 1;
  markUnknownTarget(currentQuizTarget);
  el.vocabPracticeResult.textContent = 'Đã đánh dấu CHƯA BIẾT. Từ này sẽ lặp lại ở lượt sau.';
  el.vocabQuizScore.textContent = `Tiến độ quiz: Thuộc ${vocabQuizState.mastered}/${totalVocab} | Lượt: ${vocabQuizState.total} | Đúng: ${vocabQuizState.correct}`;
  renderNotebookReviewCard();
  setTimeout(renderOneVocabQuestion, 300);
});


async function currentUser() {
  const { data } = await supa.auth.getUser();
  return data.user;
}

async function upsertDayToSupabase(studyDate, dayData) {
  const user = await currentUser();
  if (!user || !dayData?.plan) return;

  const { data: planRow, error: planErr } = await supa.from('daily_plans').upsert({
    user_id: user.id,
    study_date: studyDate,
    model_name: state.settings.model || 'gemini-1.5-flash',
    plan_json: dayData.plan
  }, { onConflict: 'user_id,study_date' }).select('id').single();
  if (planErr) throw planErr;

  await supa.from('daily_tasks').delete().eq('daily_plan_id', planRow.id);
  const rows = (dayData.tasks || []).map((t, i) => ({
    daily_plan_id: planRow.id,
    user_id: user.id,
    task_key: `task_${i + 1}`,
    label: t.label,
    duration_min: t.duration || 15,
    is_done: !!t.done
  }));
  if (rows.length) {
    const { error: taskErr } = await supa.from('daily_tasks').insert(rows);
    if (taskErr) throw new Error('daily_tasks sync lỗi: ' + taskErr.message);
  }

  const vocabRows = (dayData.plan?.vocabulary || []).map(v => ({
    user_id: user.id,
    study_date: studyDate,
    word: String(v.word || '').trim(),
    meaning: String(v.meaning || '').trim(),
    example: String(v.example || '').trim(),
    topic: String(v.topic || '').trim(),
    is_mastered: !!v.is_mastered
  })).filter(v => v.word && v.meaning);
  if (vocabRows.length) {
    const { error: vocabErr } = await supa.from('vocab_items').upsert(vocabRows, { onConflict: 'user_id,study_date,word' });
    if (vocabErr) throw new Error('vocab_items sync lỗi: ' + vocabErr.message);
  }

  const grammarRows = (dayData.plan?.grammar || []).map(g => ({
    user_id: user.id,
    study_date: studyDate,
    point: String(g.point || '').trim(),
    exercise: String(g.exercise || '').trim(),
    answer: String(g.answer || '').trim()
  })).filter(g => g.point && g.exercise && g.answer);
  if (grammarRows.length) {
    const { error: grammarErr } = await supa.from('grammar_items').upsert(grammarRows, { onConflict: 'user_id,study_date,point,exercise' });
    if (grammarErr) throw new Error('grammar_items sync lỗi: ' + grammarErr.message);
  }
}

async function loadTodayFromSupabase() {
  const user = await currentUser();
  if (!user) return false;

  const { data: planRow, error } = await supa.from('daily_plans').select('id,plan_json').eq('user_id', user.id).eq('study_date', dateKey).maybeSingle();
  if (error || !planRow) return false;
  const { data: tasks } = await supa.from('daily_tasks').select('label,duration_min,is_done').eq('daily_plan_id', planRow.id).order('created_at');

  state.days[dateKey] = {
    plan: planRow.plan_json,
    tasks: (tasks || []).map(t => ({ label: t.label, duration: t.duration_min, done: t.is_done }))
  };
  ensureDailyTasks(state.days[dateKey]);
  getListeningState();
  save();
  return true;
}

async function migrateAllLocalToSupabase() {
  const user = await currentUser();
  if (!user) throw new Error('Chưa đăng nhập');
  const days = Object.entries(state.days || {});
  for (const [d, v] of days) {
    if (v?.plan) await upsertDayToSupabase(d, v);
  }
}



async function loadTodayVocabGrammarFromSupabase() {
  const user = await currentUser();
  if (!user) return;
  const { data: vocabData, error: ve } = await supa.from('vocab_items').select('word,meaning,example,topic,is_mastered').eq('user_id', user.id).eq('study_date', dateKey);
  if (ve) throw new Error('load vocab lỗi: ' + ve.message);
  const { data: grammarData, error: ge } = await supa.from('grammar_items').select('point,exercise,answer').eq('user_id', user.id).eq('study_date', dateKey);
  if (ge) throw new Error('load grammar lỗi: ' + ge.message);
  dbLoadedVocab = (vocabData || []).map(v => ({ word: v.word, meaning: v.meaning, example: v.example, topic: v.topic, is_mastered: !!v.is_mastered }));
  dbLoadedGrammar = (grammarData || []).map(g => ({ point: g.point, exercise: g.exercise, answer: g.answer }));
}



async function loadAllReadingNotesFromSupabase() {
  const user = await currentUser();
  if (!user) return;
  const { data, error } = await supa
    .from('vocab_items')
    .select('id,word,meaning,example,is_mastered,study_date')
    .eq('user_id', user.id)
    .eq('topic', 'reading_note')
    .order('study_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error('Load reading note lỗi: ' + error.message);
  const localNotes = state.readingNotes || [];
  const dbNotes = (data || []).map((row) => ({
    id: row.id || crypto.randomUUID(),
    word: row.word,
    meaning: row.meaning,
    example: row.example,
    selectedForDb: true,
    mastered: !!row.is_mastered,
    source: 'db'
  }));
  mergeReadingNotes([...localNotes, ...dbNotes]);
  save();
}

async function upsertReadingNoteToSupabase(note) {
  const user = await currentUser();
  if (!user || !note.selectedForDb) return;
  const row = {
    user_id: user.id,
    study_date: dateKey,
    word: String(note.word || '').trim(),
    meaning: String(note.meaning || '').trim(),
    example: String(note.example || '').trim(),
    topic: 'reading_note',
    is_mastered: !!note.mastered
  };
  const { data: existed, error: findErr } = await supa
    .from('vocab_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('topic', 'reading_note')
    .eq('word', row.word)
    .limit(1);
  if (findErr) throw new Error('Kiểm tra note DB lỗi: ' + findErr.message);

  if (existed?.length) {
    const { error: updateErr } = await supa
      .from('vocab_items')
      .update({
        meaning: row.meaning,
        example: row.example,
        is_mastered: row.is_mastered,
        study_date: row.study_date
      })
      .eq('id', existed[0].id);
    if (updateErr) throw new Error('Cập nhật note DB lỗi: ' + updateErr.message);
  } else {
    const { error: insertErr } = await supa.from('vocab_items').insert(row);
    if (insertErr) throw new Error('Lưu note vào DB lỗi: ' + insertErr.message);
  }
  if (el.readingNoteStatus) el.readingNoteStatus.textContent = `Đã lưu "${row.word}" vào DB.`;
}

async function backfillAllVocabGrammarFromDailyPlans() {
  const user = await currentUser();
  if (!user) throw new Error('Chưa đăng nhập');
  const { data: plans, error } = await supa.from('daily_plans').select('study_date,plan_json').eq('user_id', user.id);
  if (error) throw error;
  let dayCount = 0;
  for (const row of (plans || [])) {
    const dayData = { plan: row.plan_json, tasks: [] };
    await upsertDayToSupabase(row.study_date, dayData);
    dayCount += 1;
  }
  return dayCount;
}

el.authLogin?.addEventListener('click', async () => {
  el.authStatus.textContent = 'Đang đăng nhập...';
  const { error } = await supa.auth.signInWithPassword({ email: el.authEmail.value.trim(), password: el.authPassword.value });
  if (error) { el.authStatus.textContent = `Lỗi đăng nhập: ${error.message}`; return; }
  cloudOnlyMode = true;
  save();
  el.authStatus.textContent = 'Đăng nhập thành công ✅ cloud-only mode đang bật...';
  try {
    await loadTodayFromSupabase();
    await loadAllReadingNotesFromSupabase().catch(() => {});
    renderReadingNotebook();
    if (state.days[dateKey].plan) {
      await loadTodayVocabGrammarFromSupabase().catch(() => {});
      renderPlan(state.days[dateKey].plan);
      renderChecklist();
      renderTodaySummary();
      renderPlanStatusBadge();
      renderNotebookReviewCard();
      renderPhaseNote();
      renderStats();
      renderVocabTools();
      renderGrammarTools();
      setupPracticeSkills();
    }
    el.authStatus.textContent = 'Đăng nhập thành công ✅ (cloud-only, local chỉ giữ API key/model)';
  } catch (e) {
    el.authStatus.textContent = `Đăng nhập ok nhưng load cloud lỗi: ${e.message}`;
  }
});

el.authLogout?.addEventListener('click', async () => {
  await supa.auth.signOut();
  cloudOnlyMode = false;
  el.authStatus.textContent = 'Đã đăng xuất.';
});


el.syncBackfill?.addEventListener('click', async () => {
  el.syncStatus.textContent = 'Đang đồng bộ lại từ vựng/ngữ pháp từ lịch sử học...';
  try {
    const count = await backfillAllVocabGrammarFromDailyPlans();
    await loadTodayVocabGrammarFromSupabase().catch(() => {});
    renderVocabTools();
    renderGrammarTools();
    renderNotebookReviewCard();
    el.syncStatus.textContent = `Đồng bộ thành công ${count} ngày ✅`;
  } catch (e) {
    el.syncStatus.textContent = `Đồng bộ lỗi: ${e.message}`;
  }
});


el.phaseSelect?.addEventListener('change', () => {
  state.phase = el.phaseSelect.value;
  save();
  renderPhaseNote();
});


el.readingHighlight?.addEventListener('click', applyReadingKeywordHighlight);
el.readingHidePassage?.addEventListener('click', toggleReadingPassage);
el.readingTranslateToggle?.addEventListener('click', toggleReadingTranslate);
el.readingBox?.addEventListener('mouseup', () => {
  if (readingSelectionTimer) clearTimeout(readingSelectionTimer);
  readingSelectionTimer = setTimeout(() => { translateSelectedReadingText().catch(() => {}); }, 150);
});
document.addEventListener('mousedown', (e) => {
  if (!el.readingTranslateTooltip || el.readingTranslateTooltip.hidden) return;
  if (el.readingTranslateTooltip.contains(e.target)) return;
  if (el.readingBox?.contains(e.target)) return;
  hideReadingTranslateTooltip();
  setReadingTranslateStatus('Đã đóng popover thêm note.');
});
el.readingSaveWord?.addEventListener('click', saveReadingWord);

el.readingSaveSelected?.addEventListener('click', async () => {
  const toSync = (state.readingNotes || []).filter(n => n.selectedForDb && n.word && n.meaning);
  if (!toSync.length) { if (el.readingNoteStatus) el.readingNoteStatus.textContent = 'Chưa có mục nào được tick để lưu DB.'; return; }
  let ok = 0;
  for (const note of toSync) {
    try { await upsertReadingNoteToSupabase(note); ok += 1; } catch (_) {}
  }
  if (el.readingNoteStatus) el.readingNoteStatus.textContent = `Đã xử lý lưu DB ${ok}/${toSync.length} mục được tick.`;
});

el.readingUncheckAll?.addEventListener('click', () => {
  (state.readingNotes || []).forEach(n => { n.selectedForDb = false; });
  save();
  renderReadingNotebook();
  if (el.readingNoteStatus) el.readingNoteStatus.textContent = 'Đã bỏ tick lưu DB cho tất cả mục.';
});


el.checkReading?.addEventListener('click', checkReadingAnswers);

