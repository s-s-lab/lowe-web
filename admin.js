const API_URL = window.LOWE_CONFIG?.API_URL || '';
let state = { data: null, adminKey: '' };

async function apiGetData() {
  const res = await fetch(`${API_URL}?action=getData&t=${Date.now()}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'データ取得に失敗しました。');
  return json.data;
}
async function apiPost(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, adminKey: state.adminKey, ...payload })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || '処理に失敗しました。');
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
function formatDate(s) { if (!s) return ''; const p=s.split('-'); return p.length===3 ? `${p[0]}.${p[1]}.${p[2]}` : s; }
function formatDay(s) { if (!s) return ''; const p=s.split('-'); if(p.length!==3)return''; const d=new Date(Number(p[0]),Number(p[1])-1,Number(p[2])); return `${['日','月','火','水','木','金','土'][d.getDay()]}曜日`; }
function formatTimeRange(a,b) { if(a&&b)return`${a} - ${b}`; if(a)return`${a} 開始`; if(b)return`${b} 終了`; return'時間未定'; }

async function reloadData() { state.data = await apiGetData(); renderAdmin(); }
function renderAdmin() { fillTopForm(); fillAboutForm(); fillRecruitForm(); renderRecordAdminTable(); renderScheduleAdminTable(); }

function fillTopForm() {
  const t = state.data.top || {};
  editBadge.value = t.badge || ''; editTitle.value = t.title || ''; editLead.value = t.lead || '';
  editPrimaryText.value = t.primaryText || ''; editPrimaryLink.value = t.primaryLink || '';
  editSecondaryText.value = t.secondaryText || ''; editSecondaryLink.value = t.secondaryLink || '';
  const imgs = t.images || ['', '', '']; editImage1.value = imgs[0] || ''; editImage2.value = imgs[1] || ''; editImage3.value = imgs[2] || '';
}
function fillAboutForm() {
  const a = state.data.about || {}; editAboutNote.value = a.note || '';
  aboutEditArea.innerHTML = (a.cards || []).map((c,i)=>`<div class="admin-card"><h4 style="margin:0 0 10px;">チーム紹介カード ${i+1}</h4><input class="about-id" data-index="${i}" type="hidden" value="${escapeHtml(c.id||'')}"><div class="form-grid"><div class="form-row"><label>小見出し</label><input class="about-kicker" data-index="${i}" value="${escapeHtml(c.kicker||'')}"></div><div class="form-row"><label>タイトル</label><input class="about-title" data-index="${i}" value="${escapeHtml(c.title||'')}"></div><div class="form-row full"><label>本文</label><textarea class="about-body" data-index="${i}">${escapeHtml(c.body||'')}</textarea></div></div></div>`).join('');
}
function fillRecruitForm() {
  const r = state.data.recruit || {}; editRecruitNote.value = r.note || ''; editRecruitTitle.value = r.title || '';
  recruitEditArea.innerHTML = (r.items || []).map((it,i)=>`<div class="admin-card"><h4 style="margin:0 0 10px;">募集項目 ${i+1}</h4><input class="recruit-id" data-index="${i}" type="hidden" value="${escapeHtml(it.id||'')}"><div class="form-grid"><div class="form-row"><label>タイトル</label><input class="recruit-title" data-index="${i}" value="${escapeHtml(it.title||'')}"></div><div class="form-row"><label>説明</label><input class="recruit-body" data-index="${i}" value="${escapeHtml(it.body||'')}"></div></div></div>`).join('');
}
function renderRecordAdminTable() {
  const rows = state.data.records || [];
  recordAdminTable.innerHTML = rows.length ? rows.map(r=>`<tr><td>${escapeHtml(r.season)}</td><td>${escapeHtml(r.competition)}</td><td>${escapeHtml(r.result)}</td><td>${escapeHtml(r.note||'')}</td><td><button class="btn btn-secondary btn-small" data-edit-record="${escapeHtml(r.id)}">編集</button><button class="btn btn-danger btn-small" data-delete-record="${escapeHtml(r.id)}">削除</button></td></tr>`).join('') : '<tr><td colspan="5">現在、登録されている戦績はありません。</td></tr>';
}
function renderScheduleAdminTable() {
  const rows = state.data.schedules || [];
  scheduleAdminTable.innerHTML = rows.length ? rows.map(e=>`<tr><td>${escapeHtml(formatDate(e.date))} ${escapeHtml(formatDay(e.date))}</td><td>${escapeHtml(e.title)}</td><td>${escapeHtml(formatTimeRange(e.startTime,e.endTime))}</td><td>${escapeHtml(e.place||'')}</td><td>${escapeHtml(e.type)}</td><td>${escapeHtml(e.trialStatus||'')}</td><td><button class="btn btn-secondary btn-small" data-edit-schedule="${escapeHtml(e.id)}">編集</button><button class="btn btn-danger btn-small" data-delete-schedule="${escapeHtml(e.id)}">削除</button></td></tr>`).join('') : '<tr><td colspan="7">現在、登録されているスケジュールはありません。</td></tr>';
}

function getTopFormValue() { return { badge:editBadge.value.trim(), title:editTitle.value.trim(), lead:editLead.value.trim(), primaryText:editPrimaryText.value.trim(), primaryLink:editPrimaryLink.value.trim(), secondaryText:editSecondaryText.value.trim(), secondaryLink:editSecondaryLink.value.trim(), images:[editImage1.value.trim(),editImage2.value.trim(),editImage3.value.trim()] }; }
function getAboutFormValue() {
  const cards=[]; document.querySelectorAll('.about-title').forEach(input=>{ const i=input.dataset.index; cards.push({ id:document.querySelector(`.about-id[data-index="${i}"]`)?.value||'', kicker:document.querySelector(`.about-kicker[data-index="${i}"]`)?.value.trim()||'', title:input.value.trim(), body:document.querySelector(`.about-body[data-index="${i}"]`)?.value.trim()||'' }); });
  return { note:editAboutNote.value.trim(), cards };
}
function getRecruitFormValue() {
  const items=[]; document.querySelectorAll('.recruit-title').forEach(input=>{ const i=input.dataset.index; items.push({ id:document.querySelector(`.recruit-id[data-index="${i}"]`)?.value||'', title:input.value.trim(), body:document.querySelector(`.recruit-body[data-index="${i}"]`)?.value.trim()||'' }); });
  return { note:editRecruitNote.value.trim(), title:editRecruitTitle.value.trim(), items };
}
function getRecordFormValue() { return { id:recordId.value, season:recordSeason.value.trim(), competition:recordCompetition.value.trim(), result:recordResult.value.trim(), note:recordNote.value.trim() }; }
function clearRecordForm() { recordId.value=''; recordSeason.value=''; recordCompetition.value=''; recordResult.value=''; recordNote.value=''; }
function editRecord(id) { const r=(state.data.records||[]).find(x=>x.id===id); if(!r)return; recordId.value=r.id||''; recordSeason.value=r.season||''; recordCompetition.value=r.competition||''; recordResult.value=r.result||''; recordNote.value=r.note||''; activateTab('tabRecords'); }
function getScheduleFormValue() { return { id:scheduleId.value, date:scheduleDate.value, startTime:scheduleStartTime.value, endTime:scheduleEndTime.value, title:scheduleTitleInput.value.trim(), place:schedulePlace.value.trim(), type:scheduleType.value, trialStatus:scheduleTrialStatus.value, publicNote:scheduleNote.value.trim() }; }
function clearScheduleForm() { scheduleId.value=''; scheduleDate.value=''; scheduleStartTime.value=''; scheduleEndTime.value=''; scheduleTitleInput.value=''; schedulePlace.value=''; scheduleType.value='練習'; scheduleTrialStatus.value='可'; scheduleNote.value=''; }
function editSchedule(id) { const e=(state.data.schedules||[]).find(x=>x.id===id); if(!e)return; scheduleId.value=e.id||''; scheduleDate.value=e.date||''; scheduleStartTime.value=e.startTime||''; scheduleEndTime.value=e.endTime||''; scheduleTitleInput.value=e.title||''; schedulePlace.value=e.place||''; scheduleType.value=e.type||'練習'; scheduleTrialStatus.value=e.trialStatus||'可'; scheduleNote.value=e.publicNote||''; activateTab('tabSchedule'); }
function activateTab(tabId) { document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tabId)); document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id===tabId)); }

function bindEvents() {
  adminLoginForm.addEventListener('submit', async e => {
    e.preventDefault();

    state.adminKey = adminKeyInput.value.trim();

    if (!state.adminKey) {
      showNotice('loginNotice', '管理者キーを入力してください。', true);
      return;
    }

    try {
      // ログイン時点ではGASのcheckAdminを呼ばず、管理画面を開きます。
      // 管理者キーの正否は、保存・削除時にGAS側で判定されます。
      adminLogin.classList.add('hidden');
      adminApp.classList.remove('hidden');
      await reloadData();
    } catch (err) {
      showNotice('loginNotice', err.message, true);
    }
  });
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.tab)));
  topForm.addEventListener('submit', async e=>{ e.preventDefault(); try{ await apiPost('saveTop',{top:getTopFormValue()}); await reloadData(); showNotice('topNotice','トップページを更新しました。'); }catch(err){ showNotice('topNotice',err.message,true); } });
  aboutForm.addEventListener('submit', async e=>{ e.preventDefault(); try{ await apiPost('saveAbout',{about:getAboutFormValue()}); await reloadData(); showNotice('aboutNotice','チーム紹介を更新しました。'); }catch(err){ showNotice('aboutNotice',err.message,true); } });
  recruitForm.addEventListener('submit', async e=>{ e.preventDefault(); try{ await apiPost('saveRecruit',{recruit:getRecruitFormValue()}); await reloadData(); showNotice('recruitNotice','メンバー募集を更新しました。'); }catch(err){ showNotice('recruitNotice',err.message,true); } });
  recordForm.addEventListener('submit', async e=>{ e.preventDefault(); try{ await apiPost('saveRecord',{record:getRecordFormValue()}); clearRecordForm(); await reloadData(); showNotice('recordNotice','戦績を更新しました。'); }catch(err){ showNotice('recordNotice',err.message,true); } });
  clearRecordForm.addEventListener('click', window.clearRecordForm);
  scheduleForm.addEventListener('submit', async e=>{ e.preventDefault(); try{ await apiPost('saveSchedule',{schedule:getScheduleFormValue()}); clearScheduleForm(); await reloadData(); showNotice('scheduleNotice','スケジュールを更新しました。'); }catch(err){ showNotice('scheduleNotice',err.message,true); } });
  clearScheduleForm.addEventListener('click', window.clearScheduleForm);
  document.body.addEventListener('click', async e=>{ const er=e.target.dataset.editRecord, dr=e.target.dataset.deleteRecord, es=e.target.dataset.editSchedule, ds=e.target.dataset.deleteSchedule; if(er) return editRecord(er); if(es) return editSchedule(es); if(dr){ if(!confirm('この戦績を削除しますか？'))return; try{ await apiPost('deleteRecord',{id:dr}); await reloadData(); }catch(err){ showNotice('recordNotice',err.message,true); } } if(ds){ if(!confirm('この予定を削除しますか？'))return; try{ await apiPost('deleteSchedule',{id:ds}); await reloadData(); }catch(err){ showNotice('scheduleNotice',err.message,true); } } });
}
bindEvents();
