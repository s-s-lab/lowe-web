const API_URL = window.LOWE_CONFIG?.API_URL || '';
const ADMIN_KEY_STORAGE = 'loweAdminKey';

const demoData = {
  top: {
    badge: '選手募集中・体験参加受付中',
    title: '東京都で活動する\n社会人ハンドボールチーム',
    lead: 'LOWE（レーヴェ）は、仕事や生活と両立しながらハンドボールを続けたいメンバーが集まる社会人チームです。\n競技経験者、ブランクのある方、チームを探している方の体験参加を歓迎しています。',
    primaryText: '体験参加を申し込む',
    primaryLink: '#recruit',
    secondaryText: 'スケジュールを見る',
    secondaryLink: '#schedule',
    images: ['', '', '']
  },
  about: {
    note: '入部希望者が最初に知りたい情報をコンパクトに掲載します。',
    cards: [
      { id: 'about001', kicker: 'Style', title: '社会人でも続けやすい', body: '仕事や家庭の予定と両立しながら、無理なく参加できるチーム運営を重視しています。' },
      { id: 'about002', kicker: 'Level', title: '経験者・ブランク歓迎', body: '学生時代の経験者、久しぶりに競技復帰したい方、継続して試合に出たい方を歓迎します。' },
      { id: 'about003', kicker: 'Activity', title: '練習・試合に参加', body: '通常練習、練習試合、公式戦を中心に活動しています。' }
    ]
  },
  recruit: {
    note: 'リクルート導線の中心ページです。',
    title: 'こんな方を歓迎します',
    items: [
      { id: 'recruit001', title: '社会人チームでハンドボールを続けたい方', body: '仕事と両立しながら継続参加したい方に向いています。' },
      { id: 'recruit002', title: '学生時代の経験を活かしたい方', body: 'ブランクがあっても、まずは体験参加から相談できます。' },
      { id: 'recruit003', title: 'GK・左利き・各ポジション歓迎', body: 'ポジションや競技歴はフォームで確認します。' }
    ]
  },
  records: [
    { id: 'record001', season: '2026 Season', competition: '東京都社会人リーグ', result: '参加予定', note: '' },
    { id: 'record002', season: '2025 Season', competition: '東京都社会人リーグ', result: 'リーグ戦出場', note: '' }
  ],
  schedules: [
    { id: 'schedule001', date: '2026-07-12', startTime: '18:00', endTime: '21:00', title: '通常練習', place: '東京都内体育館', type: '練習', trialStatus: '可', publicNote: '詳細は申込後に案内します' },
    { id: 'schedule002', date: '2026-07-19', startTime: '17:30', endTime: '21:00', title: '練習試合', place: '東京都内', type: '練習試合', trialStatus: '要相談', publicNote: 'メンバー中心' },
    { id: 'schedule003', date: '2026-07-26', startTime: '', endTime: '', title: '公式戦', place: '東京都内会場', type: '公式戦', trialStatus: '不可', publicNote: '詳細は別途案内' }
  ]
};

let state = {
  data: structuredCloneSafe(demoData),
  adminKey: localStorage.getItem(ADMIN_KEY_STORAGE) || ''
};

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function isApiConfigured() {
  return API_URL && API_URL !== 'PASTE_YOUR_GAS_WEB_APP_URL_HERE';
}

async function apiGetData() {
  if (!isApiConfigured()) {
    console.warn('API_URL is not configured. Demo data is used.');
    return structuredCloneSafe(demoData);
  }

  const url = `${API_URL}?action=getData&t=${Date.now()}`;
  const response = await fetch(url);
  const json = await response.json();

  if (!json.ok) {
    throw new Error(json.error || 'データ取得に失敗しました。');
  }

  return json.data;
}

async function apiPost(action, payload = {}, needsAdmin = true) {
  if (!isApiConfigured()) {
    throw new Error('API_URLが未設定です。index.htmlのAPI_URLをGASウェブアプリURLに置き換えてください。');
  }

  const body = {
    action,
    ...payload
  };

  if (needsAdmin) {
    body.adminKey = state.adminKey;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(body)
  });

  const json = await response.json();

  if (!json.ok) {
    throw new Error(json.error || '保存に失敗しました。');
  }

  return json;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showNotice(id, message, isError = false) {
  const notice = document.getElementById(id);
  if (!notice) return;

  if (message) {
    notice.textContent = message;
  }

  notice.classList.toggle('error', isError);
  notice.style.display = 'block';

  setTimeout(() => {
    notice.style.display = 'none';
    notice.classList.remove('error');
  }, 3000);
}

function formatDate(dateString) {
  if (!dateString) return '';

  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

function formatDay(dateString) {
  if (!dateString) return '';

  const parts = dateString.split('-');
  if (parts.length !== 3) return '';

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const date = new Date(year, month - 1, day);
  const days = ['日', '月', '火', '水', '木', '金', '土'];

  return `${days[date.getDay()]}曜日`;
}

function formatTimeRange(startTime, endTime) {
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  if (startTime && !endTime) return `${startTime} 開始`;
  if (!startTime && endTime) return `${endTime} 終了`;
  return '時間未定';
}

function trialTagClass(status) {
  if (status === '可') return 'trial-ok';
  if (status === '不可') return 'trial-ng';
  return '';
}

function renderAll() {
  renderContent();
  renderRecords();
  renderSchedules();
  fillForms();
}

function renderContent() {
  const { top, about, recruit } = state.data;

  document.getElementById('heroBadge').textContent = top.badge || '';
  document.getElementById('heroTitle').textContent = top.title || '';
  document.getElementById('heroLead').textContent = top.lead || '';

  document.getElementById('heroPrimaryButton').textContent = top.primaryText || '';
  document.getElementById('heroPrimaryButton').href = top.primaryLink || '#recruit';

  document.getElementById('heroSecondaryButton').textContent = top.secondaryText || '';
  document.getElementById('heroSecondaryButton').href = top.secondaryLink || '#schedule';

  renderHeroImages(top.images || []);

  document.getElementById('aboutNote').textContent = about.note || '';
  document.getElementById('aboutCards').innerHTML = (about.cards || []).map(card => `
    <article class="card">
      <span class="card-kicker">${escapeHtml(card.kicker)}</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.body)}</p>
    </article>
  `).join('');

  document.getElementById('recruitNote').textContent = recruit.note || '';
  document.getElementById('recruitTitle').textContent = recruit.title || '';
  document.getElementById('recruitList').innerHTML = (recruit.items || []).map(item => `
    <li>
      <span class="check">✓</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong><br />
        <span class="section-note">${escapeHtml(item.body)}</span>
      </div>
    </li>
  `).join('');
}

function renderHeroImages(imagesInput) {
  const gallery = document.getElementById('heroGallery');
  const images = imagesInput.map(url => String(url || '').trim()).filter(Boolean).slice(0, 3);

  gallery.className = 'hero-gallery';

  if (images.length === 0) {
    gallery.classList.add('hidden');
    gallery.innerHTML = '';
    return;
  }

  if (images.length === 1) gallery.classList.add('one');
  if (images.length === 2) gallery.classList.add('two');

  gallery.innerHTML = images.map((url, index) => `
    <img
      class="hero-img ${index === 0 ? 'hero-img-main' : ''}"
      src="${escapeHtml(url)}"
      alt="LOWEチーム画像${index + 1}"
      loading="lazy"
    />
  `).join('');
}

function renderRecords() {
  const recordList = document.getElementById('recordList');
  const records = state.data.records || [];

  if (records.length === 0) {
    recordList.innerHTML = '<tr><td colspan="4">現在、登録されている戦績はありません。</td></tr>';
  } else {
    recordList.innerHTML = records.map(record => `
      <tr>
        <td>${escapeHtml(record.season)}</td>
        <td>${escapeHtml(record.competition)}</td>
        <td>${escapeHtml(record.result)}</td>
        <td>${escapeHtml(record.note || '')}</td>
      </tr>
    `).join('');
  }

  renderRecordAdminTable();
}

function renderRecordAdminTable() {
  const table = document.getElementById('recordAdminTable');
  const records = state.data.records || [];

  if (records.length === 0) {
    table.innerHTML = '<tr><td colspan="5">現在、登録されている戦績はありません。</td></tr>';
    return;
  }

  table.innerHTML = records.map(record => `
    <tr>
      <td>${escapeHtml(record.season)}</td>
      <td>${escapeHtml(record.competition)}</td>
      <td>${escapeHtml(record.result)}</td>
      <td>${escapeHtml(record.note || '')}</td>
      <td>
        <button class="btn btn-secondary btn-small" type="button" data-edit-record="${escapeHtml(record.id)}">編集</button>
        <button class="btn btn-danger btn-small" type="button" data-delete-record="${escapeHtml(record.id)}">削除</button>
      </td>
    </tr>
  `).join('');
}

function renderSchedules() {
  const scheduleList = document.getElementById('scheduleList');
  const schedules = [...(state.data.schedules || [])].sort((a, b) => {
    const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
    if (dateCompare !== 0) return dateCompare;
    return String(a.startTime || '').localeCompare(String(b.startTime || ''));
  });

  if (schedules.length === 0) {
    scheduleList.innerHTML = `
      <article class="schedule-item">
        <div>
          <div class="schedule-title">現在、登録されている予定はありません。</div>
          <div class="schedule-meta">管理画面からスケジュールを登録してください。</div>
        </div>
      </article>
    `;
  } else {
    scheduleList.innerHTML = schedules.map(event => {
      const tagClass = event.type === '練習試合' || event.type === '公式戦' ? 'match' : 'open';
      const timeText = formatTimeRange(event.startTime, event.endTime);

      return `
        <article class="schedule-item">
          <div class="date-box">
            ${escapeHtml(formatDate(event.date))}
            <span>${escapeHtml(formatDay(event.date))}</span>
          </div>
          <div>
            <div class="schedule-title">${escapeHtml(event.title)}</div>
            <div class="schedule-meta">
              ${escapeHtml(timeText)}｜${escapeHtml(event.place || '場所未定')}｜${escapeHtml(event.publicNote || '')}
            </div>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
            <span class="tag ${tagClass}">${escapeHtml(event.type)}</span>
            <span class="tag ${trialTagClass(event.trialStatus)}">体験${escapeHtml(event.trialStatus || '要相談')}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  renderScheduleAdminTable();
}

function renderScheduleAdminTable() {
  const table = document.getElementById('scheduleAdminTable');
  const schedules = state.data.schedules || [];

  if (schedules.length === 0) {
    table.innerHTML = '<tr><td colspan="7">現在、登録されているスケジュールはありません。</td></tr>';
    return;
  }

  table.innerHTML = schedules.map(event => `
    <tr>
      <td>${escapeHtml(formatDate(event.date))} ${escapeHtml(formatDay(event.date))}</td>
      <td>${escapeHtml(event.title)}</td>
      <td>${escapeHtml(formatTimeRange(event.startTime, event.endTime))}</td>
      <td>${escapeHtml(event.place || '')}</td>
      <td>${escapeHtml(event.type)}</td>
      <td>${escapeHtml(event.trialStatus || '')}</td>
      <td>
        <button class="btn btn-secondary btn-small" type="button" data-edit-schedule="${escapeHtml(event.id)}">編集</button>
        <button class="btn btn-danger btn-small" type="button" data-delete-schedule="${escapeHtml(event.id)}">削除</button>
      </td>
    </tr>
  `).join('');
}

function fillForms() {
  fillTopForm();
  fillAboutForm();
  fillRecruitForm();

  const adminKeyInput = document.getElementById('adminKeyInput');
  if (adminKeyInput) adminKeyInput.value = state.adminKey || '';
}

function fillTopForm() {
  const top = state.data.top || {};

  document.getElementById('editBadge').value = top.badge || '';
  document.getElementById('editTitle').value = top.title || '';
  document.getElementById('editLead').value = top.lead || '';
  document.getElementById('editPrimaryText').value = top.primaryText || '';
  document.getElementById('editPrimaryLink').value = top.primaryLink || '';
  document.getElementById('editSecondaryText').value = top.secondaryText || '';
  document.getElementById('editSecondaryLink').value = top.secondaryLink || '';

  const images = top.images || ['', '', ''];
  document.getElementById('editImage1').value = images[0] || '';
  document.getElementById('editImage2').value = images[1] || '';
  document.getElementById('editImage3').value = images[2] || '';
}

function fillAboutForm() {
  const about = state.data.about || {};
  document.getElementById('editAboutNote').value = about.note || '';

  document.getElementById('aboutEditArea').innerHTML = (about.cards || []).map((card, index) => `
    <div class="admin-card">
      <h4 style="margin:0 0 10px;">チーム紹介カード ${index + 1}</h4>
      <input class="about-id" data-index="${index}" type="hidden" value="${escapeHtml(card.id || '')}" />
      <div class="form-grid">
        <div class="form-row">
          <label>小見出し</label>
          <input class="about-kicker" data-index="${index}" type="text" value="${escapeHtml(card.kicker || '')}" />
        </div>
        <div class="form-row">
          <label>タイトル</label>
          <input class="about-title" data-index="${index}" type="text" value="${escapeHtml(card.title || '')}" />
        </div>
        <div class="form-row full">
          <label>本文</label>
          <textarea class="about-body" data-index="${index}">${escapeHtml(card.body || '')}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

function fillRecruitForm() {
  const recruit = state.data.recruit || {};
  document.getElementById('editRecruitNote').value = recruit.note || '';
  document.getElementById('editRecruitTitle').value = recruit.title || '';

  document.getElementById('recruitEditArea').innerHTML = (recruit.items || []).map((item, index) => `
    <div class="admin-card">
      <h4 style="margin:0 0 10px;">募集項目 ${index + 1}</h4>
      <input class="recruit-id" data-index="${index}" type="hidden" value="${escapeHtml(item.id || '')}" />
      <div class="form-grid">
        <div class="form-row">
          <label>タイトル</label>
          <input class="recruit-title" data-index="${index}" type="text" value="${escapeHtml(item.title || '')}" />
        </div>
        <div class="form-row">
          <label>説明</label>
          <input class="recruit-body" data-index="${index}" type="text" value="${escapeHtml(item.body || '')}" />
        </div>
      </div>
    </div>
  `).join('');
}

function getTopFormValue() {
  return {
    badge: document.getElementById('editBadge').value.trim(),
    title: document.getElementById('editTitle').value.trim(),
    lead: document.getElementById('editLead').value.trim(),
    primaryText: document.getElementById('editPrimaryText').value.trim(),
    primaryLink: document.getElementById('editPrimaryLink').value.trim(),
    secondaryText: document.getElementById('editSecondaryText').value.trim(),
    secondaryLink: document.getElementById('editSecondaryLink').value.trim(),
    images: [
      document.getElementById('editImage1').value.trim(),
      document.getElementById('editImage2').value.trim(),
      document.getElementById('editImage3').value.trim()
    ]
  };
}

function getAboutFormValue() {
  const cards = [];

  document.querySelectorAll('.about-title').forEach(input => {
    const index = input.dataset.index;
    cards.push({
      id: document.querySelector(`.about-id[data-index="${index}"]`)?.value || '',
      kicker: document.querySelector(`.about-kicker[data-index="${index}"]`)?.value.trim() || '',
      title: input.value.trim(),
      body: document.querySelector(`.about-body[data-index="${index}"]`)?.value.trim() || ''
    });
  });

  return {
    note: document.getElementById('editAboutNote').value.trim(),
    cards
  };
}

function getRecruitFormValue() {
  const items = [];

  document.querySelectorAll('.recruit-title').forEach(input => {
    const index = input.dataset.index;
    items.push({
      id: document.querySelector(`.recruit-id[data-index="${index}"]`)?.value || '',
      title: input.value.trim(),
      body: document.querySelector(`.recruit-body[data-index="${index}"]`)?.value.trim() || ''
    });
  });

  return {
    note: document.getElementById('editRecruitNote').value.trim(),
    title: document.getElementById('editRecruitTitle').value.trim(),
    items
  };
}

function getRecordFormValue() {
  return {
    id: document.getElementById('recordId').value,
    season: document.getElementById('recordSeason').value.trim(),
    competition: document.getElementById('recordCompetition').value.trim(),
    result: document.getElementById('recordResult').value.trim(),
    note: document.getElementById('recordNote').value.trim()
  };
}

function clearRecordForm() {
  document.getElementById('recordId').value = '';
  document.getElementById('recordSeason').value = '';
  document.getElementById('recordCompetition').value = '';
  document.getElementById('recordResult').value = '';
  document.getElementById('recordNote').value = '';
}

function editRecord(id) {
  const record = (state.data.records || []).find(item => item.id === id);
  if (!record) return;

  document.getElementById('recordId').value = record.id || '';
  document.getElementById('recordSeason').value = record.season || '';
  document.getElementById('recordCompetition').value = record.competition || '';
  document.getElementById('recordResult').value = record.result || '';
  document.getElementById('recordNote').value = record.note || '';

  activateTab('tabRecords');
  location.hash = '#admin';
}

function getScheduleFormValue() {
  return {
    id: document.getElementById('scheduleId').value,
    date: document.getElementById('scheduleDate').value,
    startTime: document.getElementById('scheduleStartTime').value,
    endTime: document.getElementById('scheduleEndTime').value,
    title: document.getElementById('scheduleTitleInput').value.trim(),
    place: document.getElementById('schedulePlace').value.trim(),
    type: document.getElementById('scheduleType').value,
    trialStatus: document.getElementById('scheduleTrialStatus').value,
    publicNote: document.getElementById('scheduleNote').value.trim()
  };
}

function clearScheduleForm() {
  document.getElementById('scheduleId').value = '';
  document.getElementById('scheduleDate').value = '';
  document.getElementById('scheduleStartTime').value = '';
  document.getElementById('scheduleEndTime').value = '';
  document.getElementById('scheduleTitleInput').value = '';
  document.getElementById('schedulePlace').value = '';
  document.getElementById('scheduleType').value = '練習';
  document.getElementById('scheduleTrialStatus').value = '可';
  document.getElementById('scheduleNote').value = '';
}

function editSchedule(id) {
  const event = (state.data.schedules || []).find(item => item.id === id);
  if (!event) return;

  document.getElementById('scheduleId').value = event.id || '';
  document.getElementById('scheduleDate').value = event.date || '';
  document.getElementById('scheduleStartTime').value = event.startTime || '';
  document.getElementById('scheduleEndTime').value = event.endTime || '';
  document.getElementById('scheduleTitleInput').value = event.title || '';
  document.getElementById('schedulePlace').value = event.place || '';
  document.getElementById('scheduleType').value = event.type || '練習';
  document.getElementById('scheduleTrialStatus').value = event.trialStatus || '可';
  document.getElementById('scheduleNote').value = event.publicNote || '';

  activateTab('tabSchedule');
  location.hash = '#admin';
}

function activateTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabId);
  });
}

async function reloadData() {
  state.data = await apiGetData();
  renderAll();
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
  });

  document.getElementById('saveAdminKey').addEventListener('click', () => {
    state.adminKey = document.getElementById('adminKeyInput').value.trim();
    localStorage.setItem(ADMIN_KEY_STORAGE, state.adminKey);
    alert('管理キーをこの端末に保存しました。');
  });

  document.getElementById('topForm').addEventListener('submit', async event => {
    event.preventDefault();

    try {
      await apiPost('saveTop', { top: getTopFormValue() });
      await reloadData();
      showNotice('topNotice', 'トップページを更新しました。');
    } catch (error) {
      showNotice('topNotice', error.message, true);
    }
  });

  document.getElementById('aboutForm').addEventListener('submit', async event => {
    event.preventDefault();

    try {
      await apiPost('saveAbout', { about: getAboutFormValue() });
      await reloadData();
      showNotice('aboutNotice', 'チーム紹介を更新しました。');
    } catch (error) {
      showNotice('aboutNotice', error.message, true);
    }
  });

  document.getElementById('recruitForm').addEventListener('submit', async event => {
    event.preventDefault();

    try {
      await apiPost('saveRecruit', { recruit: getRecruitFormValue() });
      await reloadData();
      showNotice('recruitNotice', 'メンバー募集を更新しました。');
    } catch (error) {
      showNotice('recruitNotice', error.message, true);
    }
  });

  document.getElementById('recordForm').addEventListener('submit', async event => {
    event.preventDefault();

    try {
      await apiPost('saveRecord', { record: getRecordFormValue() });
      clearRecordForm();
      await reloadData();
      showNotice('recordNotice', '戦績を更新しました。');
    } catch (error) {
      showNotice('recordNotice', error.message, true);
    }
  });

  document.getElementById('clearRecordForm').addEventListener('click', clearRecordForm);

  document.getElementById('scheduleForm').addEventListener('submit', async event => {
    event.preventDefault();

    try {
      await apiPost('saveSchedule', { schedule: getScheduleFormValue() });
      clearScheduleForm();
      await reloadData();
      showNotice('scheduleNotice', 'スケジュールを更新しました。');
    } catch (error) {
      showNotice('scheduleNotice', error.message, true);
    }
  });

  document.getElementById('clearScheduleForm').addEventListener('click', clearScheduleForm);

  document.getElementById('trialForm').addEventListener('submit', async event => {
    event.preventDefault();

    const form = event.target;

    const application = {
      name: document.getElementById('name').value.trim(),
      age: document.getElementById('age').value.trim(),
      email: document.getElementById('email').value.trim(),
      position: document.getElementById('position').value,
      history: document.getElementById('history').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    try {
      await apiPost('submitTrial', { application }, false);
      form.reset();
      showNotice('formNotice', '体験参加申込を送信しました。');
    } catch (error) {
      showNotice('formNotice', error.message, true);
    }
  });

  document.body.addEventListener('click', async event => {
    const editRecordId = event.target.dataset.editRecord;
    const deleteRecordId = event.target.dataset.deleteRecord;
    const editScheduleId = event.target.dataset.editSchedule;
    const deleteScheduleId = event.target.dataset.deleteSchedule;

    if (editRecordId) {
      editRecord(editRecordId);
      return;
    }

    if (editScheduleId) {
      editSchedule(editScheduleId);
      return;
    }

    if (deleteRecordId) {
      const record = (state.data.records || []).find(item => item.id === deleteRecordId);
      const ok = confirm(`「${record?.competition || 'この戦績'}」を削除しますか？`);
      if (!ok) return;

      try {
        await apiPost('deleteRecord', { id: deleteRecordId });
        await reloadData();
        showNotice('recordNotice', '戦績を削除しました。');
      } catch (error) {
        showNotice('recordNotice', error.message, true);
      }

      return;
    }

    if (deleteScheduleId) {
      const schedule = (state.data.schedules || []).find(item => item.id === deleteScheduleId);
      const ok = confirm(`「${schedule?.title || 'この予定'}」を削除しますか？`);
      if (!ok) return;

      try {
        await apiPost('deleteSchedule', { id: deleteScheduleId });
        await reloadData();
        showNotice('scheduleNotice', 'スケジュールを削除しました。');
      } catch (error) {
        showNotice('scheduleNotice', error.message, true);
      }
    }
  });
}

async function init() {
  bindEvents();

  try {
    state.adminKey = localStorage.getItem(ADMIN_KEY_STORAGE) || '';
    state.data = await apiGetData();
  } catch (error) {
    console.error(error);
    state.data = structuredCloneSafe(demoData);
  }

  renderAll();
}

init();
