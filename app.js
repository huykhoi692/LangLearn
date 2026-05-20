const KEY = 'langlearn_ai_daily_v4';
const dateKey = new Date().toISOString().slice(0, 10);

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
  genStatus: document.getElementById('gen-status'),
  checklist: document.getElementById('daily-checklist'),
  todayDate: document.getElementById('today-date'),
  completedDays: document.getElementById('completed-days'),
  todayProgress: document.getElementById('today-progress'),
  streak: document.getElementById('streak'),
  weeklyTime: document.getElementById('weekly-time'),
  readingBox: document.getElementById('reading-box'),
  listeningBox: document.getElementById('listening-box'),
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
  syncStatus: document.getElementById('sync-status')
};

let state = JSON.parse(localStorage.getItem(KEY) || '{}');
if (!state.settings) state.settings = { apiKey: '', model: 'gemini-1.5-flash' };
if (!state.days) state.days = {};
if (!state.days[dateKey]) state.days[dateKey] = { plan: null, tasks: [] };

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

function sanitize(text = '') { return String(text).replace(/[<>]/g, ''); }

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
  const prompt = `Tạo JSON thuần cho kế hoạch học tiếng Anh trong 1 ngày cho người Việt mục tiêu IELTS 6.5 + TOEIC 750.
Độ khó hiện tại: ${level}/7 (1 dễ -> 7 khó).
Tăng độ khó theo level: level thấp dùng câu ngắn + từ B1; level cao dùng câu dài hơn + từ học thuật B2/C1.
KHÔNG lặp lại từ/chủ điểm sau (14 ngày gần đây):
- Từ vựng đã dùng: ${history.recentWords.join(', ') || 'none'}
- Grammar points đã dùng: ${history.recentGrammarPoints.join(', ') || 'none'}
Schema:
{
 "reading":{"title":"","passage":"","questions":["","",""],"duration":25},
 "listening":{"title":"","youtubeQuery":"","task":"","duration":20},
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

function renderPlan(plan) {
  el.readingBox.innerHTML = `<h3>${sanitize(plan.reading.title)}</h3><p>${sanitize(plan.reading.passage)}</p><ol>${plan.reading.questions.map(q => `<li>${sanitize(q)}</li>`).join('')}</ol>`;
  const query = encodeURIComponent(plan.listening.youtubeQuery || 'english listening practice');
  el.listeningBox.innerHTML = `<p><strong>${sanitize(plan.listening.title)}</strong></p><p>${sanitize(plan.listening.task)}</p><a target="_blank" href="https://www.youtube.com/results?search_query=${query}">Mở link YouTube gợi ý</a>`;
  el.speakingBox.innerHTML = `<p><strong>Đề:</strong> ${sanitize(plan.speaking.question)}</p><ul>${plan.speaking.hints.map(h => `<li>${sanitize(h)}</li>`).join('')}</ul>`;
  el.writingBox.innerHTML = `<p><strong>Đề:</strong> ${sanitize(plan.writing.question)}</p><ul>${plan.writing.hints.map(h => `<li>${sanitize(h)}</li>`).join('')}</ul>`;
  el.vocabBox.innerHTML = plan.vocabulary.map(v => `<div class="vocab-item"><strong>${sanitize(v.word)}</strong><span>${sanitize(v.meaning)}</span><small>${sanitize(v.example)}</small></div>`).join('');
  el.grammarBox.innerHTML = plan.grammar.map(g => `<div class="vocab-item"><strong>${sanitize(g.point)}</strong><span>${sanitize(g.exercise)}</span><small>Đáp án: ${sanitize(g.answer)}</small></div>`).join('');
}

function renderChecklist() {
  const day = state.days[dateKey];
  el.todayDate.textContent = `Hôm nay: ${dateKey}`;
  el.checklist.innerHTML = day.tasks.map((t, i) => `<label class="task-item"><input type="checkbox" data-i="${i}" ${t.done ? 'checked' : ''}><span>${sanitize(t.label)}</span><small>${t.duration} phút</small></label>`).join('');
  el.checklist.querySelectorAll('input').forEach(inp => inp.addEventListener('change', e => {
    const i = Number(e.target.dataset.i); day.tasks[i].done = e.target.checked; save(); upsertDayToSupabase(dateKey, day).catch(() => {}); renderStats();
  }));
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
  el.streak.textContent = streak;
  el.weeklyTime.textContent = `${(mins / 60).toFixed(1)}h`;
}

async function checkAnswer(skill, question, answer, outEl) {
  if (!answer.trim()) return;
  outEl.textContent = 'Đang chấm bằng AI...';
  try {
    const result = await callGemini(`Bạn là giám khảo ${skill}. Câu hỏi: ${question}. Câu trả lời của học viên: ${answer}. Trả JSON: {"score":0-10,"feedback":"","fix":""}`);
    outEl.textContent = `Điểm: ${result.score}/10 | Nhận xét: ${result.feedback} | Sửa nhanh: ${result.fix}`;
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

if (el.generatePlan) el.generatePlan.addEventListener('click', async () => {
  el.genStatus.textContent = 'Đang sinh dữ liệu học hôm nay...';
  try {
    const plan = await generateDailyPlan();
    state.days[dateKey].plan = plan;
    state.days[dateKey].tasks = (plan.checklist || []).map(t => ({ ...t, done: false }));
    save();
    await upsertDayToSupabase(dateKey, state.days[dateKey]);
    await loadTodayVocabGrammarFromSupabase().catch(() => {});
    renderPlan(plan);
    renderChecklist();
    renderStats();
    renderVocabTools();
    renderGrammarTools();
    el.genStatus.textContent = 'Đã sinh dữ liệu thành công ✅';
  } catch (e) {
    el.genStatus.textContent = `Lỗi sinh dữ liệu: ${e.message}`;
  }
});

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
let vocabQuizState = { total: 0, correct: 0 };
let dbLoadedVocab = [];
let dbLoadedGrammar = [];

function renderVocabTools() {
  const vocab = dbLoadedVocab.length ? dbLoadedVocab : (state.days[dateKey].plan?.vocabulary || []);
  if (!vocab.length) {
    el.vocabFlashcard.textContent = 'Hãy sinh kế hoạch trước để có từ vựng.';
    el.vocabPractice.innerHTML = '';
    el.vocabQuizScore.textContent = '';
    return;
  }
  el.vocabQuizScore.textContent = `Điểm quiz: ${vocabQuizState.correct}/${vocabQuizState.total}`;
  renderOneVocabQuestion();
}

function renderOneVocabQuestion() {
  const vocab = dbLoadedVocab.length ? dbLoadedVocab : (state.days[dateKey].plan?.vocabulary || []);
  if (!vocab.length) return;
  const target = vocab[Math.floor(Math.random() * vocab.length)];
  const options = [target.meaning];
  while (options.length < Math.min(4, vocab.length)) {
    const candidate = vocab[Math.floor(Math.random() * vocab.length)].meaning;
    if (!options.includes(candidate)) options.push(candidate);
  }
  options.sort(() => Math.random() - 0.5);

  el.vocabPractice.innerHTML = `<p><strong>Chọn nghĩa đúng của từ:</strong> ${sanitize(target.word)}</p><div class="options">${options.map(o => `<button class="option" data-correct="${o === target.meaning}">${sanitize(o)}</button>`).join('')}</div>`;
  el.vocabPracticeResult.textContent = '';

  const buttons = [...el.vocabPractice.querySelectorAll('button')];
  buttons.forEach(btn => btn.addEventListener('click', () => {
    if (buttons.some(b => b.disabled)) return;
    buttons.forEach(b => b.disabled = true);
    vocabQuizState.total += 1;
    const isCorrect = btn.dataset.correct === 'true';
    if (isCorrect) vocabQuizState.correct += 1;
    el.vocabQuizScore.textContent = `Điểm quiz: ${vocabQuizState.correct}/${vocabQuizState.total}`;
    el.vocabPracticeResult.textContent = isCorrect
      ? `✅ Chính xác! Ví dụ: ${sanitize(target.example)}`
      : `❌ Chưa đúng. Đáp án: ${sanitize(target.meaning)}`;
  }));
}

function nextFlashcard() {
  const vocab = dbLoadedVocab.length ? dbLoadedVocab : (state.days[dateKey].plan?.vocabulary || []);
  if (!vocab.length) {
    el.vocabFlashcard.textContent = 'Hãy sinh kế hoạch trước để có từ vựng.';
    return;
  }
  currentFlashIndex = (currentFlashIndex + 1) % vocab.length;
  flashShowMeaning = false;
  el.vocabFlashcard.textContent = sanitize(vocab[currentFlashIndex].word);
}

function toggleFlashMeaning() {
  const vocab = dbLoadedVocab.length ? dbLoadedVocab : (state.days[dateKey].plan?.vocabulary || []);
  if (currentFlashIndex < 0 || !vocab.length) return;
  flashShowMeaning = !flashShowMeaning;
  const w = vocab[currentFlashIndex];
  el.vocabFlashcard.textContent = flashShowMeaning ? `${sanitize(w.word)} — ${sanitize(w.meaning)} | ${sanitize(w.example)}` : sanitize(w.word);
}

function renderGrammarTools() {
  const grammar = dbLoadedGrammar.length ? dbLoadedGrammar : (state.days[dateKey].plan?.grammar || []);
  if (!grammar.length) {
    el.grammarPractice.innerHTML = '<p class="muted">Hãy sinh kế hoạch trước để có bài grammar.</p>';
    return;
  }
  el.grammarPractice.innerHTML = grammar.map((g, i) => `<div class="vocab-item"><strong>${i + 1}. ${sanitize(g.point)}</strong><span>${sanitize(g.exercise)}</span><input data-i="${i}" class="grammar-input" placeholder="Nhập đáp án của bạn" /></div>`).join('');
  el.grammarResult.textContent = '';
}

function checkGrammarAnswers() {
  const grammar = dbLoadedGrammar.length ? dbLoadedGrammar : (state.days[dateKey].plan?.grammar || []);
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

function init() {
  if (window.location.protocol === 'file:') {
    el.genStatus.textContent = 'Bạn đang mở bằng file:// nên có thể gặp lỗi bảo mật khi gọi API. Hãy chạy: python3 -m http.server 8000 rồi mở http://localhost:8000';
  }
  el.apiKey.value = state.settings.apiKey || '';
  el.modelName.value = state.settings.model || 'gemini-1.5-flash';
  if (state.days[dateKey].plan) renderPlan(state.days[dateKey].plan);
  renderChecklist();
  renderStats();
  renderVocabTools();
  renderGrammarTools();
}

async function bootstrap() {
  init();
  await loadTodayFromSupabase();
  if (state.days[dateKey].plan) { await loadTodayVocabGrammarFromSupabase().catch(() => {}); renderPlan(state.days[dateKey].plan); renderChecklist(); renderStats(); renderVocabTools(); renderGrammarTools(); }
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
el.checkGrammar?.addEventListener('click', checkGrammarAnswers);

el.vocabQuizNext?.addEventListener('click', renderOneVocabQuestion);


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
    topic: String(v.topic || '').trim()
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
  const { data: vocabData, error: ve } = await supa.from('vocab_items').select('word,meaning,example,topic').eq('user_id', user.id).eq('study_date', dateKey);
  if (ve) throw new Error('load vocab lỗi: ' + ve.message);
  const { data: grammarData, error: ge } = await supa.from('grammar_items').select('point,exercise,answer').eq('user_id', user.id).eq('study_date', dateKey);
  if (ge) throw new Error('load grammar lỗi: ' + ge.message);
  dbLoadedVocab = (vocabData || []).map(v => ({ word: v.word, meaning: v.meaning, example: v.example, topic: v.topic }));
  dbLoadedGrammar = (grammarData || []).map(g => ({ point: g.point, exercise: g.exercise, answer: g.answer }));
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
  el.authStatus.textContent = 'Đăng nhập thành công ✅ đang migrate dữ liệu local...';
  try {
    await migrateAllLocalToSupabase();
    await loadTodayFromSupabase();
    if (state.days[dateKey].plan) { await loadTodayVocabGrammarFromSupabase().catch(() => {}); renderPlan(state.days[dateKey].plan); renderChecklist(); renderStats(); renderVocabTools(); renderGrammarTools(); }
    el.authStatus.textContent = 'Đăng nhập + migrate toàn bộ thành công ✅';
  } catch (e) {
    el.authStatus.textContent = `Đăng nhập ok nhưng migrate lỗi: ${e.message}`;
  }
});

el.authLogout?.addEventListener('click', async () => {
  await supa.auth.signOut();
  el.authStatus.textContent = 'Đã đăng xuất.';
});


el.syncBackfill?.addEventListener('click', async () => {
  el.syncStatus.textContent = 'Đang backfill vocab/grammar từ daily_plans...';
  try {
    const count = await backfillAllVocabGrammarFromDailyPlans();
    await loadTodayVocabGrammarFromSupabase().catch(() => {});
    renderVocabTools();
    renderGrammarTools();
    el.syncStatus.textContent = `Backfill thành công ${count} ngày ✅`;
  } catch (e) {
    el.syncStatus.textContent = `Backfill lỗi: ${e.message}`;
  }
});
