const KEY = 'langlearn_ai_daily_v4';
const dateKey = new Date().toISOString().slice(0, 10);

const el = {
  apiKey: document.getElementById('api-key'),
  modelName: document.getElementById('model-name'),
  saveApi: document.getElementById('save-api'),
  clearApi: document.getElementById('clear-api'),
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
  writingFeedback: document.getElementById('writing-feedback')
};

let state = JSON.parse(localStorage.getItem(KEY) || '{}');
if (!state.settings) state.settings = { apiKey: '', model: 'gemini-1.5-flash-8b' };
if (!state.days) state.days = {};
if (!state.days[dateKey]) state.days[dateKey] = { plan: null, tasks: [] };

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

function sanitize(text = '') { return String(text).replace(/[<>]/g, ''); }

async function callGemini(prompt) {
  const apiKey = state.settings.apiKey;
  const model = state.settings.model || 'gemini-1.5-flash-8b';
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
  if (!res.ok) throw new Error(`API lỗi ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text);
}

async function generateDailyPlan() {
  const prompt = `Tạo JSON thuần cho kế hoạch học tiếng Anh trong 1 ngày cho người Việt mục tiêu IELTS 6.5 + TOEIC 750.
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
    const i = Number(e.target.dataset.i); day.tasks[i].done = e.target.checked; save(); renderStats();
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
  state.settings.model = el.modelName.value.trim() || 'gemini-1.5-flash-8b';
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
    renderPlan(plan);
    renderChecklist();
    renderStats();
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

function init() {
  if (window.location.protocol === 'file:') {
    el.genStatus.textContent = 'Bạn đang mở bằng file:// nên có thể gặp lỗi bảo mật khi gọi API. Hãy chạy: python3 -m http.server 8000 rồi mở http://localhost:8000';
  }
  el.apiKey.value = state.settings.apiKey || '';
  el.modelName.value = state.settings.model || 'gemini-1.5-flash-8b';
  if (state.days[dateKey].plan) renderPlan(state.days[dateKey].plan);
  renderChecklist();
  renderStats();
}

init();
