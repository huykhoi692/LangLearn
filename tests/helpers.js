export const KEY = 'langlearn_ai_daily_v4';

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function mockSupabaseScript() {
  return `window.supabase = {
    createClient: () => ({
      auth: {
        getUser: async () => ({ data: { user: null } }),
        signInWithPassword: async () => ({ error: { message: 'mocked' } }),
        signOut: async () => ({})
      },
      from: () => ({
        select() { return this; },
        eq() { return this; },
        order() { return this; },
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        delete() { return this; },
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        limit() { return this; }
      })
    })
  };`;
}

export async function setupPage(page, state) {
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: mockSupabaseScript()
    });
  });
  await page.addInitScript(([key, payload]) => {
    localStorage.setItem(key, JSON.stringify(payload));
  }, [KEY, state]);
}

export function basePlan() {
  return {
    reading: {
      title: 'Reading test',
      passage: 'A short reading passage for test.',
      questions: ['Q1', 'Q2', 'Q3'],
      answers: ['alpha', 'beta', 'gamma'],
      duration: 25
    },
    listening: { title: 'Listening test', youtubeUrl: '', youtubeQuery: 'ielts listening', task: 'Nghe đoạn audio', duration: 20 },
    speaking: { question: 'Speak', hints: ['h1', 'h2'], duration: 20 },
    writing: { question: 'Write', hints: ['h1', 'h2'], duration: 30 },
    vocabulary: [{ word: 'daily', meaning: 'hàng ngày', example: 'Daily practice matters.' }],
    grammar: [{ point: 'Present Simple', exercise: 'I ___ to school', answer: 'go' }],
    checklist: []
  };
}
