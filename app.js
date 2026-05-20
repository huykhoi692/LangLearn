const vocabKey = 'langlearn_vocab';
const statsKey = 'langlearn_stats';

const vocabForm = document.getElementById('vocab-form');
const vocabList = document.getElementById('vocab-list');
const totalWords = document.getElementById('total-words');
const correctCount = document.getElementById('correct-count');
const attemptCount = document.getElementById('attempt-count');
const resetBtn = document.getElementById('reset-data');

const flashWord = document.getElementById('flash-word');
const flashMeaning = document.getElementById('flash-meaning');
const toggleAnswerBtn = document.getElementById('toggle-answer');
const nextCardBtn = document.getElementById('next-card');

const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizResult = document.getElementById('quiz-result');
const newQuizBtn = document.getElementById('new-quiz');

let vocab = JSON.parse(localStorage.getItem(vocabKey) || '[]');
let stats = JSON.parse(localStorage.getItem(statsKey) || '{"correct":0,"attempt":0}');
let currentFlash = null;
let showMeaning = false;

function save() {
  localStorage.setItem(vocabKey, JSON.stringify(vocab));
  localStorage.setItem(statsKey, JSON.stringify(stats));
}

function renderVocab() {
  vocabList.innerHTML = '';
  if (!vocab.length) {
    vocabList.innerHTML = '<li>Chưa có từ nào.</li>';
  } else {
    vocab.forEach((item, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${idx + 1}. ${item.word}</strong> — ${item.meaning}<br><small>${item.example || ''}</small>`;
      vocabList.appendChild(li);
    });
  }
  totalWords.textContent = vocab.length;
}

function renderStats() {
  correctCount.textContent = stats.correct;
  attemptCount.textContent = stats.attempt;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function newFlashCard() {
  if (!vocab.length) {
    flashWord.textContent = 'Chưa có dữ liệu';
    flashMeaning.textContent = '';
    return;
  }
  currentFlash = randomItem(vocab);
  showMeaning = false;
  flashWord.textContent = currentFlash.word;
  flashMeaning.textContent = '••••••';
}

function toggleMeaning() {
  if (!currentFlash) return;
  showMeaning = !showMeaning;
  flashMeaning.textContent = showMeaning ? `${currentFlash.meaning}${currentFlash.example ? ' — ' + currentFlash.example : ''}` : '••••••';
}

function buildQuiz() {
  quizResult.textContent = '';
  quizOptions.innerHTML = '';

  if (vocab.length < 2) {
    quizQuestion.textContent = 'Thêm ít nhất 2 từ để bắt đầu quiz.';
    return;
  }

  const question = randomItem(vocab);
  const answers = [question.meaning];

  while (answers.length < Math.min(4, vocab.length)) {
    const candidate = randomItem(vocab).meaning;
    if (!answers.includes(candidate)) answers.push(candidate);
  }

  answers.sort(() => Math.random() - 0.5);
  quizQuestion.textContent = `Nghĩa đúng của từ "${question.word}" là:`;

  answers.forEach(ans => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = ans;
    btn.onclick = () => {
      stats.attempt += 1;
      if (ans === question.meaning) {
        stats.correct += 1;
        quizResult.textContent = '✅ Chính xác!';
      } else {
        quizResult.textContent = `❌ Chưa đúng. Đáp án: ${question.meaning}`;
      }
      renderStats();
      save();
    };
    quizOptions.appendChild(btn);
  });
}

vocabForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const word = document.getElementById('word').value.trim();
  const meaning = document.getElementById('meaning').value.trim();
  const example = document.getElementById('example').value.trim();
  if (!word || !meaning) return;

  vocab.push({ word, meaning, example });
  save();
  renderVocab();
  renderStats();
  newFlashCard();
  buildQuiz();
  vocabForm.reset();
});

toggleAnswerBtn.addEventListener('click', toggleMeaning);
nextCardBtn.addEventListener('click', newFlashCard);
newQuizBtn.addEventListener('click', buildQuiz);
resetBtn.addEventListener('click', () => {
  if (!confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu?')) return;
  vocab = [];
  stats = { correct: 0, attempt: 0 };
  save();
  renderVocab();
  renderStats();
  newFlashCard();
  buildQuiz();
});

renderVocab();
renderStats();
newFlashCard();
buildQuiz();
