const API_URL = window.LOWE_CONFIG?.API_URL || '';

const demoData = {
  top: { badge: '選手募集中・体験参加受付中', title: '東京都で活動する\n社会人ハンドボールチーム', lead: 'LOWE（レーヴェ）は、仕事や生活と両立しながらハンドボールを続けたいメンバーが集まる社会人チームです。\n競技経験者、ブランクのある方、チームを探している方の体験参加を歓迎しています。', primaryText: '体験参加を申し込む', primaryLink: '#recruit', secondaryText: 'スケジュールを見る', secondaryLink: '#schedule', images: ['', '', ''] },
  about: { note: '入部希望者が最初に知りたい情報をコンパクトに掲載します。', cards: [
    { id: 'about001', kicker: 'Style', title: '社会人でも続けやすい', body: '仕事や家庭の予定と両立しながら、無理なく参加できるチーム運営を重視しています。' },
    { id: 'about002', kicker: 'Level', title: '経験者・ブランク歓迎', body: '学生時代の経験者、久しぶりに競技復帰したい方、継続して試合に出たい方を歓迎します。' },
    { id: 'about003', kicker: 'Activity', title: '練習・試合に参加', body: '通常練習、練習試合、公式戦を中心に活動しています。' }
  ]},
  recruit: { note: 'リクルート導線の中心ページです。', title: 'こんな方を歓迎します', items: [
    { id: 'recruit001', title: '社会人チームでハンドボールを続けたい方', body: '仕事と両立しながら継続参加したい方に向いています。' },
    { id: 'recruit002', title: '学生時代の経験を活かしたい方', body: 'ブランクがあっても、まずは体験参加から相談できます。' },
    { id: 'recruit003', title: 'GK・左利き・各ポジション歓迎', body: 'ポジションや競技歴はフォームで確認します。' }
  ]},
  records: [
    { id: 'record001', season: '2026 Season', competition: '東京都社会人リーグ', result: '参加予定', note: '' },
    { id: 'record002', season: '2025 Season', competition: '東京都社会人リーグ', result: 'リーグ戦出場', note: '' }
  ],
  schedules: [
    { id: 'schedule001', date: '2026-07-12', startTime: '18:00', endTime: '21:00', title: '通常練習', place: '東京都内体育館', type: '練習', trialStatus: '可', publicNote: '詳細は申込後に案内します' },
    { id: 'schedule002', date: '2026-07-19', startTime: '17:30', endTime: '21:00', title: '練習試合', place: '東京都内', type: '練習試合', trialStatus: '要相談', publicNote: 'メンバー中心' }
  ]
};

let state = { data: JSON.parse(JSON.stringify(demoData)) };

function isApiConfigured() { return API_URL && API_URL !== 'PASTE_YOUR_GAS_WEB_APP_URL_HERE'; }
async function apiGetData() {
  if (!isApiConfigured()) return JSON.parse(JSON.stringify(demoData));
  const res = await fetch(`${API_URL}?action=getData&t=${Date.now()}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'データ取得に失敗しました。');
  return json.data;
}
async function apiPost(action, payload = {}) {
  if (!isApiConfigured()) throw new Error('API_URLが未設定です。');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || '送信に失敗しました。');
  return json;
}
function escapeHtml(v) {
  return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function showNotice(id, message, isError=false) {
  const el = document.getElementById(id); if (!el) return;
  if (message) el.textContent = message;
  el.classList.toggle('error', isError);
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; el.classList.remove('error'); }, 3000);
}
function formatDate(s) {
  if (!s) return '';
  const p = s.split('-'); if (p.length !== 3) return s;
  return `${p[0]}.${p[1]}.${p[2]}`;
}
function formatDay(s) {
  if (!s) return '';
  const p = s.split('-'); if (p.length !== 3) return '';
  const d = new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
  return `${['日','月','火','水','木','金','土'][d.getDay()]}曜日`;
}
function formatTimeRange(a,b) {
  if (a && b) return `${a} - ${b}`;
  if (a) return `${a} 開始`;
  if (b) return `${b} 終了`;
  return '時間未定';
}
function trialTagClass(s) { if (s === '可') return 'trial-ok'; if (s === '不可') return 'trial-ng'; return ''; }

function renderAll() {
  const { top, about, recruit, records, schedules } = state.data;
  document.getElementById('heroBadge').textContent = top.badge || '';
  document.getElementById('heroTitle').textContent = top.title || '';
  document.getElementById('heroLead').textContent = top.lead || '';
  document.getElementById('heroPrimaryButton').textContent = top.primaryText || '';
  document.getElementById('heroPrimaryButton').href = top.primaryLink || '#recruit';
  document.getElementById('heroSecondaryButton').textContent = top.secondaryText || '';
  document.getElementById('heroSecondaryButton').href = top.secondaryLink || '#schedule';
  renderHeroImages(top.images || []);

  document.getElementById('aboutNote').textContent = about.note || '';
  document.getElementById('aboutCards').innerHTML = (about.cards || []).map(c => `
    <article class="card"><span class="card-kicker">${escapeHtml(c.kicker)}</span><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.body)}</p></article>
  `).join('');

  document.getElementById('recruitNote').textContent = recruit.note || '';
  document.getElementById('recruitTitle').textContent = recruit.title || '';
  document.getElementById('recruitList').innerHTML = (recruit.items || []).map(i => `
    <li><span class="check">✓</span><div><strong>${escapeHtml(i.title)}</strong><br><span class="section-note">${escapeHtml(i.body)}</span></div></li>
  `).join('');

  document.getElementById('recordList').innerHTML = (records || []).length
    ? records.map(r => `<tr><td>${escapeHtml(r.season)}</td><td>${escapeHtml(r.competition)}</td><td>${escapeHtml(r.result)}</td><td>${escapeHtml(r.note || '')}</td></tr>`).join('')
    : '<tr><td colspan="4">現在、登録されている戦績はありません。</td></tr>';

  const sorted = [...(schedules || [])].sort((a,b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.startTime || '').localeCompare(String(b.startTime || '')));
  document.getElementById('scheduleList').innerHTML = sorted.length ? sorted.map(e => {
    const tagClass = e.type === '練習試合' || e.type === '公式戦' ? 'match' : 'open';
    return `<article class="schedule-item">
      <div class="date-box">${escapeHtml(formatDate(e.date))}<span>${escapeHtml(formatDay(e.date))}</span></div>
      <div><div class="schedule-title">${escapeHtml(e.title)}</div><div class="schedule-meta">${escapeHtml(formatTimeRange(e.startTime, e.endTime))}｜${escapeHtml(e.place || '場所未定')}｜${escapeHtml(e.publicNote || '')}</div></div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;"><span class="tag ${tagClass}">${escapeHtml(e.type)}</span><span class="tag ${trialTagClass(e.trialStatus)}">体験${escapeHtml(e.trialStatus || '要相談')}</span></div>
    </article>`;
  }).join('') : '<article class="schedule-item"><div><div class="schedule-title">現在、登録されている予定はありません。</div><div class="schedule-meta">管理画面からスケジュールを登録してください。</div></div></article>';
}
function renderHeroImages(input) {
  const gallery = document.getElementById('heroGallery');
  const images = input.map(x => String(x || '').trim()).filter(Boolean).slice(0,3);
  gallery.className = 'hero-gallery';
  if (!images.length) { gallery.classList.add('hidden'); gallery.innerHTML = ''; return; }
  if (images.length === 1) gallery.classList.add('one');
  if (images.length === 2) gallery.classList.add('two');
  gallery.innerHTML = images.map((url, i) => `<img class="hero-img ${i === 0 ? 'hero-img-main' : ''}" src="${escapeHtml(url)}" alt="LOWEチーム画像${i + 1}" loading="lazy">`).join('');
}
function bindEvents() {
  document.getElementById('trialForm').addEventListener('submit', async e => {
    e.preventDefault();
    const application = {
      name: document.getElementById('name').value.trim(),
      age: document.getElementById('age').value.trim(),
      email: document.getElementById('email').value.trim(),
      position: document.getElementById('position').value,
      history: document.getElementById('history').value.trim(),
      message: document.getElementById('message').value.trim()
    };
    try { await apiPost('submitTrial', { application }); e.target.reset(); showNotice('formNotice', '体験参加申込を送信しました。'); }
    catch (err) { showNotice('formNotice', err.message, true); }
  });

  document.getElementById('contactForm').addEventListener('submit', async e => {
    e.preventDefault();
    const contact = {
      name: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      category: document.getElementById('contactCategory').value,
      message: document.getElementById('contactMessage').value.trim()
    };
    try { await apiPost('submitContact', { contact }); e.target.reset(); showNotice('contactNotice', '問い合わせを送信しました。'); }
    catch (err) { showNotice('contactNotice', err.message, true); }
  });
}
async function init() {
  bindEvents();
  try { state.data = await apiGetData(); } catch (err) { console.error(err); }
  renderAll();
}
init();
