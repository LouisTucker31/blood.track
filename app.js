const MARKERS = [
  { name:'Glucose (fasting)', cat:'Metabolic', unit:'mmol/L', low:3.9, high:5.6 },
  { name:'HbA1c', cat:'Metabolic', unit:'%', low:4.0, high:5.6 },
  { name:'Insulin (fasting)', cat:'Metabolic', unit:'µU/mL', low:2.6, high:24.9 },
  { name:'Total Cholesterol', cat:'Lipid Panel', unit:'mmol/L', low:0, high:5.2 },
  { name:'LDL Cholesterol', cat:'Lipid Panel', unit:'mmol/L', low:0, high:3.4 },
  { name:'HDL Cholesterol', cat:'Lipid Panel', unit:'mmol/L', low:1.0, high:null },
  { name:'Triglycerides', cat:'Lipid Panel', unit:'mmol/L', low:0, high:1.7 },
  { name:'Non-HDL Cholesterol', cat:'Lipid Panel', unit:'mmol/L', low:0, high:4.2 },
  { name:'TSH', cat:'Thyroid', unit:'mIU/L', low:0.4, high:4.0 },
  { name:'Free T3', cat:'Thyroid', unit:'pmol/L', low:3.1, high:6.8 },
  { name:'Free T4', cat:'Thyroid', unit:'pmol/L', low:12.0, high:22.0 },
  { name:'Thyroid Antibodies (TPO)', cat:'Thyroid', unit:'IU/mL', low:0, high:34 },
  { name:'Testosterone (total)', cat:'Hormones', unit:'nmol/L', low:8.64, high:29.0 },
  { name:'Free Testosterone', cat:'Hormones', unit:'nmol/L', low:2.0, high:3.5 },
  { name:'Oestradiol (E2)', cat:'Hormones', unit:'pmol/L', low:41, high:159 },
  { name:'SHBG', cat:'Hormones', unit:'nmol/L', low:16.5, high:55.9 },
  { name:'DHEA-S', cat:'Hormones', unit:'µmol/L', low:2.2, high:15.2 },
  { name:'Cortisol (morning)', cat:'Hormones', unit:'nmol/L', low:171, high:536 },
  { name:'IGF-1', cat:'Hormones', unit:'nmol/L', low:11.3, high:30.9 },
  { name:'LH', cat:'Hormones', unit:'IU/L', low:1.7, high:8.6 },
  { name:'FSH', cat:'Hormones', unit:'IU/L', low:1.5, high:12.4 },
  { name:'Prolactin', cat:'Hormones', unit:'mIU/L', low:86, high:324 },
  { name:'Vitamin D (25-OH)', cat:'Vitamins & Minerals', unit:'nmol/L', low:75, high:200 },
  { name:'Vitamin B12', cat:'Vitamins & Minerals', unit:'pmol/L', low:145, high:637 },
  { name:'Folate', cat:'Vitamins & Minerals', unit:'nmol/L', low:10, high:42 },
  { name:'Ferritin', cat:'Vitamins & Minerals', unit:'µg/L', low:30, high:300 },
  { name:'Serum Iron', cat:'Vitamins & Minerals', unit:'µmol/L', low:14, high:32 },
  { name:'Zinc', cat:'Vitamins & Minerals', unit:'µmol/L', low:10, high:18 },
  { name:'Magnesium', cat:'Vitamins & Minerals', unit:'mmol/L', low:0.7, high:1.0 },
  { name:'CRP (hs)', cat:'Inflammation', unit:'mg/L', low:0, high:3.0 },
  { name:'Homocysteine', cat:'Inflammation', unit:'µmol/L', low:0, high:15 },
  { name:'ESR', cat:'Inflammation', unit:'mm/hr', low:0, high:20 },
  { name:'ALT', cat:'Liver', unit:'U/L', low:7, high:56 },
  { name:'AST', cat:'Liver', unit:'U/L', low:10, high:40 },
  { name:'GGT', cat:'Liver', unit:'U/L', low:0, high:51 },
  { name:'Alkaline Phosphatase', cat:'Liver', unit:'U/L', low:44, high:147 },
  { name:'Bilirubin (total)', cat:'Liver', unit:'µmol/L', low:0, high:21 },
  { name:'Albumin', cat:'Liver', unit:'g/L', low:35, high:50 },
  { name:'eGFR', cat:'Kidney', unit:'mL/min/1.73m²', low:60, high:null },
  { name:'Creatinine', cat:'Kidney', unit:'µmol/L', low:62, high:106 },
  { name:'Urea', cat:'Kidney', unit:'mmol/L', low:2.5, high:7.8 },
  { name:'Uric Acid', cat:'Kidney', unit:'µmol/L', low:208, high:428 },
  { name:'Haemoglobin', cat:'Full Blood Count', unit:'g/L', low:130, high:170 },
  { name:'Haematocrit', cat:'Full Blood Count', unit:'%', low:40, high:52 },
  { name:'Red Blood Cells', cat:'Full Blood Count', unit:'10¹²/L', low:4.5, high:5.9 },
  { name:'White Blood Cells', cat:'Full Blood Count', unit:'10⁹/L', low:4.0, high:11.0 },
  { name:'Platelets', cat:'Full Blood Count', unit:'10⁹/L', low:150, high:400 },
  { name:'PSA', cat:'Prostate', unit:'µg/L', low:0, high:4.0 },
];

const CATS = [...new Set(MARKERS.map(m => m.cat))];
const VIEWS = ['add', 'history', 'charts'];
let entries = JSON.parse(localStorage.getItem('bt_entries') || '[]');
let customTemplates = JSON.parse(localStorage.getItem('bt_templates') || '[]');
function saveTemplates() { localStorage.setItem('bt_templates', JSON.stringify(customTemplates)); }
let testRuns = JSON.parse(localStorage.getItem('bt_test_runs') || '[]');
function saveTestRuns() { localStorage.setItem('bt_test_runs', JSON.stringify(testRuns)); }

// panel mode state
let panelMode = false;
let panelMarkers = []; // { name, unit, cat, low, high }
let panelTemplateMeta = { id: null, name: '' };
let selectedCat = CATS[0];
let activeChipMarker = null;
let currentViewIdx = 0;

function save() { localStorage.setItem('bt_entries', JSON.stringify(entries)); }

// ── Storage helpers ──────────────────────────────────────────────────────────

function saveMarkerResult({ marker, cat, value, unit, date, notes, testRunId, testName }) {
  const m = getMarker(marker);
  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    marker,
    cat: cat || (m ? m.cat : 'Custom'),
    value,
    unit: unit || (m ? m.unit : ''),
    date,
    notes: notes || '',
    testRunId: testRunId || null,
    testName: testName || null
  };
  entries.push(entry);
  save();
  return entry;
}

function saveTestPanel({ templateId, testName, date, notes, markers }) {
  const runId = 'run_' + Date.now();
  const markerIds = [];

  markers.forEach((r, i) => {
    const entry = saveMarkerResult({
      marker: r.name,
      cat: r.cat,
      value: r.value,
      unit: r.unit,
      date,
      notes,
      testRunId: runId,
      testName
    });
    markerIds.push(entry.id);
  });

  const run = { id: runId, templateId: templateId || null, testName, date, notes, markerIds };
  testRuns.push(run);
  saveTestRuns();
  return run;
}

function getAllResults() {
  return JSON.parse(localStorage.getItem('bt_entries') || '[]');
}

function getAllTestPanels() {
  return JSON.parse(localStorage.getItem('bt_test_runs') || '[]');
}
function getMarker(name) { return MARKERS.find(m => m.name === name); }

function statusOf(marker, val) {
  if (!marker) return 'na';
  const v = parseFloat(val);
  if (isNaN(v)) return 'na';
  if (marker.low !== null && marker.low !== 0 && v < marker.low) return 'low';
  if (marker.high !== null && v > marker.high) return 'high';
  return 'normal';
}

function statusLabel(s) {
  if (s === 'normal') return 'Optimal';
  if (s === 'high') return 'High';
  if (s === 'low') return 'Low';
  return '—';
}

function fmt(v) {
  const n = parseFloat(v);
  return isNaN(n) ? v : (Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, ''));
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function buildCatPills() {
  const el = document.getElementById('cat-pills');
  const builtIn = CATS.map(c =>
    `<button class="cat-pill${c === selectedCat ? ' active' : ''}" onclick="selectCat('${c}')">${c}</button>`
  ).join('');
  const custom = customTemplates.map(t => {
    const isActive = selectedCat === '__tmpl__' + t.id;
    return `<button class="cat-pill cat-pill--custom${isActive ? ' active' : ''}" data-tmpl-id="${t.id}" onclick="selectTemplate(this.dataset.tmplId)">${t.name}</button>`;
  }).join('');
  const addBtn = `<button class="cat-pill cat-pill--new" onclick="openTemplateModal()">+ New Test</button>`;
  el.innerHTML = builtIn + custom + addBtn;
}

function selectCat(cat) {
  selectedCat = cat;
  buildCatPills();
  buildMarkerSelect();
}
function selectTemplate(id) {
  console.log('selectTemplate called with id:', id, 'templates:', customTemplates);
  const tmpl = customTemplates.find(t => t.id === id);
  if (!tmpl) { showToast('Template not found.'); return; }
  selectedCat = '__tmpl__' + id;
  buildCatPills();
  enterPanelMode(tmpl.markers.map(m => ({ ...m })), { id: tmpl.id, name: tmpl.name });
}
function buildMarkerSelect() {
  const sel = document.getElementById('marker-select');
  const markers = MARKERS.filter(m => m.cat === selectedCat);
  sel.innerHTML = markers.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
  onMarkerChange();
}

// ── Panel mode ──────────────────────────────────────────────────────────────

function enterPanelMode(markers, meta) {
  panelMode = true;
  panelMarkers = markers.map(m => ({ ...m }));
  panelTemplateMeta = meta;
  document.getElementById('single-marker-form').style.display = 'none';
  document.getElementById('panel-form').style.display = 'block';
  document.getElementById('panel-test-name').textContent = meta.name;
  document.getElementById('panel-date').valueAsDate = new Date();
  document.getElementById('panel-notes').value = '';
  renderPanelRows();
}

function exitPanelMode() {
  panelMode = false;
  panelMarkers = [];
  selectedCat = CATS[0];
  buildCatPills();
  buildMarkerSelect();
  document.getElementById('panel-form').style.display = 'none';
  document.getElementById('single-marker-form').style.display = 'block';
}

function renderPanelRows() {
  const el = document.getElementById('panel-rows');
  el.innerHTML = panelMarkers.map((m, i) => `
    <div class="panel-row" id="panel-row-${i}">
      <div class="panel-row-label">
        <span class="panel-marker-name">${m.name}</span>
        <span class="panel-marker-cat">${m.cat || ''}</span>
      </div>
      <div class="panel-row-inputs">
        <input
          type="number"
          step="any"
          class="panel-value-input"
          id="panel-val-${i}"
          placeholder="—"
          autocomplete="off"
        />
        <select class="panel-unit-select" id="panel-unit-${i}">
          ${getPanelUnitOptions(m)}
        </select>
        <button class="btn-icon panel-row-remove" onclick="removePanelRow(${i})" title="Remove">✕</button>
      </div>
    </div>
  `).join('');
}

function getPanelUnitOptions(m) {
  const unit = m.unit || '';
  const allUnits = [...new Set(
    MARKERS.filter(mk => mk.name === m.name).map(mk => mk.unit).concat(unit ? [unit] : [])
  )].filter(Boolean);
  if (!allUnits.length) return `<option value="">—</option>`;
  return allUnits.map(u => `<option value="${u}"${u === unit ? ' selected' : ''}>${u}</option>`).join('');
}

function removePanelRow(i) {
  panelMarkers.splice(i, 1);
  renderPanelRows();
}

function addPanelExtraRow() {
  const el = document.getElementById('panel-extra-picker');
  el.style.display = el.style.display === 'none' ? 'flex' : 'none';
  if (el.style.display === 'flex') {
    const sel = document.getElementById('panel-extra-marker-sel');
    sel.innerHTML = '<option value="">— Select marker —</option>' +
      MARKERS.map(m => `<option value="${m.name}">${m.name} (${m.cat})</option>`).join('');
    document.getElementById('panel-extra-unit-sel').innerHTML = '<option value="">—</option>';
  }
}

function onPanelExtraMarkerChange() {
  const name = document.getElementById('panel-extra-marker-sel').value;
  const unitSel = document.getElementById('panel-extra-unit-sel');
  const m = MARKERS.find(mk => mk.name === name);
  unitSel.innerHTML = m
    ? `<option value="${m.unit}">${m.unit}</option>`
    : '<option value="">—</option>';
}

function confirmPanelExtraRow() {
  const name = document.getElementById('panel-extra-marker-sel').value;
  const unit = document.getElementById('panel-extra-unit-sel').value;
  if (!name) { showToast('Select a marker first.'); return; }
  const m = MARKERS.find(mk => mk.name === name) || { name, unit, cat: 'Custom', low: null, high: null };
  panelMarkers.push({ ...m, unit: unit || m.unit });
  renderPanelRows();
  document.getElementById('panel-extra-picker').style.display = 'none';
}
function deletePanelTemplate() {
  if (!panelTemplateMeta.id) return;
  if (!confirm(`Delete the "${panelTemplateMeta.name}" template? This won't affect already saved results.`)) return;
  customTemplates = customTemplates.filter(t => t.id !== panelTemplateMeta.id);
  saveTemplates();
  showToast('Template deleted.');
  exitPanelMode();
}
function savePanelTest() {
  const date = document.getElementById('panel-date').value;
  const notes = document.getElementById('panel-notes').value.trim();
  if (!date) { showToast('Please set a date.'); return; }

  const filled = panelMarkers.map((m, i) => ({
    name: m.name,
    cat: m.cat || 'Custom',
    value: document.getElementById(`panel-val-${i}`)?.value?.trim() || '',
    unit: document.getElementById(`panel-unit-${i}`)?.value || m.unit || ''
  })).filter(r => r.value !== '');

  if (!filled.length) { showToast('Enter at least one value.'); return; }

  const run = saveTestPanel({
    templateId: panelTemplateMeta.id,
    testName: panelTemplateMeta.name,
    date,
    notes,
    markers: filled
  });

  showToast(`${panelTemplateMeta.name} saved — ${filled.length} marker${filled.length !== 1 ? 's' : ''} recorded.`);
  exitPanelMode();
}

function onMarkerChange() {
  const name = document.getElementById('marker-select').value;
  let m = getMarker(name);
  if (!m && selectedCat.startsWith('__tmpl__')) {
    const id = selectedCat.replace('__tmpl__', '');
    const tmpl = customTemplates.find(t => t.id === id);
    m = tmpl ? tmpl.markers.find(mk => mk.name === name) : null;
  }
  if (!m) return;
  document.getElementById('unit-display').textContent = `Unit: ${m.unit}`;
  const lo = m.low !== null ? fmt(m.low) : '—';
  const hi = m.high !== null ? fmt(m.high) : '—';
  const el = document.getElementById('range-display');
  el.innerHTML = `Reference: <span style="color:var(--green)">${lo}</span> – <span style="color:var(--green)">${hi !== '—' ? hi : '∞'} ${m.unit}</span>`;
  document.getElementById('ref-info').innerHTML = buildRefCard(m);
}

function buildRefCard(m) {
  const lo = m.low !== null ? fmt(m.low) : null;
  const hi = m.high !== null ? fmt(m.high) : null;
  return `
    <div style="margin-bottom:.75rem;">
      <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px;">${m.name}</div>
      <div style="font-size:12px;color:var(--text-muted);font-family:'DM Mono',monospace;">${m.unit}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${lo !== null ? `<div style="background:var(--amber-light);border-radius:8px;padding:10px 12px;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--amber);margin-bottom:3px;">Low below</div><div style="font-family:'DM Mono',monospace;font-size:16px;font-weight:500;color:var(--amber)">${lo}</div></div>` : ''}
      ${hi !== null ? `<div style="background:var(--red-light);border-radius:8px;padding:10px 12px;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--red);margin-bottom:3px;">High above</div><div style="font-family:'DM Mono',monospace;font-size:16px;font-weight:500;color:var(--red)">${hi}</div></div>` : ''}
    </div>
    <div style="margin-top:12px;font-size:12px;color:var(--text-hint);line-height:1.6;">Reference ranges are general adult values. Individual ranges may vary by lab, age, and sex.</div>
  `;
}

function addEntry() {
  if (panelMode) return; // safety guard
  const name = document.getElementById('marker-select').value;
  const val = document.getElementById('entry-value').value;
  const date = document.getElementById('entry-date').value;
  const notes = document.getElementById('entry-notes').value.trim();
  if (!name || !val || !date) { showToast('Please fill in marker, value and date.'); return; }
  let m = getMarker(name);
  if (!m && selectedCat.startsWith('__tmpl__')) {
    const id = selectedCat.replace('__tmpl__', '');
    const tmpl = customTemplates.find(t => t.id === id);
    m = tmpl ? tmpl.markers.find(mk => mk.name === name) : null;
  }
  saveMarkerResult({
    marker: name,
    cat: m ? (m.cat || 'Custom') : 'Custom',
    value: val,
    unit: m ? m.unit : '',
    date,
    notes
  });
  document.getElementById('entry-value').value = '';
  document.getElementById('entry-notes').value = '';
  showToast('Result saved!');
}

function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  save();
  renderHistory();
  renderChipMarkers();
}

function renderHistory() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const catF = document.getElementById('cat-filter').value;
  const sort = document.getElementById('sort-select').value;
  const el = document.getElementById('results-list');

  let items = [];

  // add grouped test runs
  testRuns.forEach(run => {
    const runEntries = entries.filter(e => run.markerIds.includes(e.id));
    if (!runEntries.length) return;
    if (search && !run.testName.toLowerCase().includes(search) &&
        !runEntries.some(e => e.marker.toLowerCase().includes(search))) return;
    if (catF && !runEntries.some(e => e.cat === catF)) return;
    items.push({ type: 'run', run, entries: runEntries, sortDate: run.date });
  });

  // add standalone entries (not part of any run)
  entries.filter(e => !e.testRunId).forEach(e => {
    if (search && !e.marker.toLowerCase().includes(search)) return;
    if (catF && e.cat !== catF) return;
    items.push({ type: 'single', entry: e, sortDate: e.date });
  });

  // sort
  if (sort === 'date-desc') items.sort((a,b) => b.sortDate.localeCompare(a.sortDate));
  else if (sort === 'date-asc') items.sort((a,b) => a.sortDate.localeCompare(b.sortDate));
  else items.sort((a,b) => {
    const nameA = a.type === 'run' ? a.run.testName : a.entry.marker;
    const nameB = b.type === 'run' ? b.run.testName : b.entry.marker;
    return nameA.localeCompare(nameB);
  });

  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><div class="big">◎</div><p>${entries.length ? 'No results match your filter.' : 'No results yet. Add your first entry.'}</p></div>`;
    return;
  }

  el.innerHTML = items.map(item => {
    if (item.type === 'run') return renderRunTile(item.run, item.entries);
    return renderSingleRow(item.entry);
  }).join('');
}

function renderSingleRow(e) {
  const m = getMarker(e.marker);
  const s = statusOf(m, e.value);
  const unit = e.unit || (m ? m.unit : '');
  return `<div class="result-row">
    <div><div class="result-marker">${e.marker}</div><div class="result-cat">${e.cat}</div></div>
    <div class="result-val">${fmt(e.value)} <span style="font-size:11px;color:var(--text-hint);font-weight:400;">${unit}</span> <span class="status-badge status-${s}">${statusLabel(s)}</span></div>
    <div class="result-date">${formatDate(e.date)}</div>
    <div></div>
    <button class="btn-icon" onclick="deleteEntry(${e.id})" title="Delete">✕</button>
  </div>`;
}

function renderRunTile(run, runEntries) {
  const childRows = runEntries.map(e => {
    const m = getMarker(e.marker);
    const s = statusOf(m, e.value);
    const unit = e.unit || (m ? m.unit : '');
    return `<div class="result-child-row">
      <div><div class="result-marker">${e.marker}</div><div class="result-cat">${e.cat}</div></div>
      <div class="result-val">${fmt(e.value)} <span style="font-size:11px;color:var(--text-hint);font-weight:400;">${unit}</span> <span class="status-badge status-${s}">${statusLabel(s)}</span></div>
      <button class="btn-icon" onclick="deleteEntry(${e.id});rerenderRunOrRemove('${run.id}')" title="Delete">✕</button>
    </div>`;
  }).join('');

  return `<div class="run-tile" id="run-${run.id}">
    <div class="run-tile-header" onclick="toggleRunTile('${run.id}')">
      <div class="run-tile-left">
        <div class="run-tile-name">${run.testName}</div>
        <div class="run-tile-meta">${formatDate(run.date)} · ${runEntries.length} marker${runEntries.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="run-tile-right">
        <button class="btn-icon run-tile-delete" onclick="event.stopPropagation();deleteRun('${run.id}')" title="Delete test">✕</button>
        <span class="run-tile-chevron" id="chevron-${run.id}">›</span>
      </div>
    </div>
    <div class="run-tile-body" id="run-body-${run.id}">
      <div class="run-tile-children">${childRows}</div>
    </div>
  </div>`;
}

function toggleRunTile(id) {
  const body = document.getElementById(`run-body-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
}

function deleteRun(runId) {
  if (!confirm('Delete this entire test and all its markers?')) return;
  const run = testRuns.find(r => r.id === runId);
  if (run) entries = entries.filter(e => !run.markerIds.includes(e.id));
  testRuns = testRuns.filter(r => r.id !== runId);
  save();
  saveTestRuns();
  renderHistory();
  renderChipMarkers();
}

function rerenderRunOrRemove(runId) {
  const run = testRuns.find(r => r.id === runId);
  const remaining = run ? entries.filter(e => run.markerIds.includes(e.id)) : [];
  if (!remaining.length) {
    testRuns = testRuns.filter(r => r.id !== runId);
    saveTestRuns();
    document.getElementById(`run-${runId}`)?.remove();
  } else {
    const tile = document.getElementById(`run-${runId}`);
    if (tile) tile.outerHTML = renderRunTile(run, remaining);
  }
  renderChipMarkers();
}

function buildCatFilter() {
  const sel = document.getElementById('cat-filter');
  sel.innerHTML = '<option value="">All categories</option>' + CATS.map(c => `<option value="${c}">${c}</option>`).join('');
}

function formatDate(d) {
  if (!d) return '';
  const [y,mo,day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day)} ${months[parseInt(mo)-1]} ${y}`;
}

function renderChipMarkers() {
  const tracked = [...new Set(entries.map(e => e.marker))];
  const el = document.getElementById('marker-chips');
  const mobileEl = document.getElementById('mobile-marker-select');

  if (!tracked.length) {
    el.innerHTML = `<div style="color:var(--text-muted);font-size:14px;grid-column:1/-1;padding:2rem 0;">No data yet. Add entries to see trends.</div>`;
    if (mobileEl) mobileEl.innerHTML = '<option value="">No data yet</option>';
    document.getElementById('charts-area').innerHTML = '';
    return;
  }

  el.innerHTML = tracked.map(name => {
    const count = entries.filter(e => e.marker === name).length;
    const sel = activeChipMarker === name;
    return `<div class="marker-chip${sel ? ' selected' : ''}" onclick="selectChipMarker('${name.replace(/'/g,"\\'")}')">
      <div class="mc-name">${name}</div>
      <div class="mc-count">${count} result${count !== 1 ? 's' : ''}</div>
    </div>`;
  }).join('');

  if (mobileEl) {
    mobileEl.innerHTML = tracked.map(name =>
      `<option value="${name}"${activeChipMarker === name ? ' selected' : ''}>${name}</option>`
    ).join('');
    mobileEl.onchange = () => selectChipMarker(mobileEl.value);
  }

  if (!activeChipMarker || !tracked.includes(activeChipMarker)) {
    activeChipMarker = tracked[0];
    renderChipMarkers();
    return;
  }
  renderChart(activeChipMarker);
}

let chartInstance = null;
function selectChipMarker(name) {
  activeChipMarker = name;
  renderChipMarkers();
}

function generateTrendInsight(markerName, vals, marker) {
  if (vals.length < 2) return `Only one reading recorded — add more results over time to see a trend.`;

  const last = vals[vals.length - 1];
  const prev = vals[vals.length - 2];
  const n = vals.length;

  const xMean = (n - 1) / 2;
  const yMean = vals.reduce((a, b) => a + b, 0) / n;
  const num = vals.reduce((sum, v, i) => sum + (i - xMean) * (v - yMean), 0);
  const den = vals.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;

  const range = marker && marker.high && marker.low ? marker.high - marker.low : null;
  const slopePerStep = Math.abs(slope);
  const isRapid = range ? slopePerStep > range * 0.1 : slopePerStep > yMean * 0.1;
  const isSteady = range ? slopePerStep < range * 0.02 : slopePerStep < yMean * 0.02;

  const latestStatus = marker ? statusOf(marker, last) : 'na';
  const prevStatus = marker ? statusOf(marker, prev) : 'na';
  const unit = marker ? marker.unit : '';

  let directionAdverb;
  if (slope > 0) {
    directionAdverb = isRapid ? 'rising sharply' : isSteady ? 'creeping upward' : 'trending upward';
  } else if (slope < 0) {
    directionAdverb = isRapid ? 'dropping sharply' : isSteady ? 'gradually decreasing' : 'trending downward';
  } else {
    return `${markerName} has been very stable across all ${n} readings.`;
  }

  const span = n === 2 ? 'between your two readings' : `across your last ${n} results`;

  if (latestStatus === 'normal' && prevStatus !== 'normal') {
    return `${markerName} was previously ${prevStatus} but has moved back into the normal range — a positive sign. It is still ${directionAdverb} ${span}, so worth monitoring.`;
  }
  if (latestStatus === 'high' && slope > 0) {
    return `${markerName} is already above the upper limit and continues ${directionAdverb} ${span} (now ${fmt(last)} ${unit}). This warrants attention.`;
  }
  if (latestStatus === 'low' && slope < 0) {
    return `${markerName} is already below the lower limit and is ${directionAdverb} ${span} (now ${fmt(last)} ${unit}). Consider discussing this with your doctor.`;
  }
  if (latestStatus === 'high' && slope < 0) {
    return `${markerName} is elevated but ${directionAdverb} ${span} — moving in the right direction. Latest reading is ${fmt(last)} ${unit}.`;
  }
  if (latestStatus === 'low' && slope > 0) {
    return `${markerName} has been low but is ${directionAdverb} ${span} — moving in the right direction. Latest reading is ${fmt(last)} ${unit}.`;
  }
  if (isSteady) {
    return `${markerName} is within the normal range and has stayed very consistent ${span} — no meaningful change.`;
  }
  if (marker && marker.high !== null && slope > 0) {
    const headroom = marker.high - last;
    const closeToLimit = range ? headroom < range * 0.15 : false;
    if (closeToLimit) {
      return `${markerName} is within range but ${directionAdverb} ${span} and is now approaching the upper limit (${fmt(last)} ${unit}, limit is ${fmt(marker.high)} ${unit}).`;
    }
  }
  if (marker && marker.low !== null && marker.low > 0 && slope < 0) {
    const headroom = last - marker.low;
    const closeToLimit = range ? headroom < range * 0.15 : false;
    if (closeToLimit) {
      return `${markerName} is within range but ${directionAdverb} ${span} and is getting close to the lower limit (${fmt(last)} ${unit}, limit is ${fmt(marker.low)} ${unit}).`;
    }
  }
  return `${markerName} is within the normal range and has been ${directionAdverb} ${span}. Latest reading is ${fmt(last)} ${unit}.`;
}

function renderChart(markerName) {
  const markerEntries = entries.filter(e => e.marker === markerName)
    .sort((a,b) => a.date.localeCompare(b.date));
  const m = getMarker(markerName);
  const el = document.getElementById('charts-area');
  if (markerEntries.length < 1) { el.innerHTML = ''; return; }

  const vals = markerEntries.map(e => parseFloat(e.value));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a,b) => a+b,0) / vals.length;
  const latest = vals[vals.length - 1];

  const s = statusOf(m, latest);
  const sColor = s === 'normal' ? '#2d6a4f' : s === 'high' ? '#b5281e' : '#9a5c08';

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDark ? '#c0b8a8' : '#7a7060';
  const gridColor = isDark ? 'rgba(255,240,210,0.08)' : 'rgba(60,50,30,0.08)';
  const lineColor = '#c8460a';

  const labels = markerEntries.map(e => formatDate(e.date));
  const data = vals;

  const datasets = [{
    label: markerName,
    data,
    borderColor: lineColor,
    backgroundColor: 'rgba(200,70,10,0.08)',
    pointBackgroundColor: data.map(v => {
      const st = statusOf(m, v);
      return st === 'normal' ? '#2d6a4f' : st === 'high' ? '#b5281e' : '#9a5c08';
    }),
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 6,
    pointHoverRadius: 8,
    tension: 0.35,
    fill: true,
  }];

  if (m && m.high !== null) {
    datasets.push({
      label: 'Upper limit',
      data: new Array(labels.length).fill(m.high),
      borderColor: 'rgba(181,40,30,0.35)',
      borderDash: [6,4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }
  if (m && m.low !== null && m.low > 0) {
    datasets.push({
      label: 'Lower limit',
      data: new Array(labels.length).fill(m.low),
      borderColor: 'rgba(154,92,8,0.35)',
      borderDash: [6,4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  el.innerHTML = `
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">${markerName}</div>
        <div class="chart-meta">${m ? m.unit : ''}</div>
      </div>
      <div class="chart-stats">
        <div class="stat-item"><div class="stat-label">Latest</div><div class="stat-value" style="color:${sColor}">${fmt(latest)}</div></div>
        <div class="stat-item"><div class="stat-label">Average</div><div class="stat-value">${avg.toFixed(2)}</div></div>
        <div class="stat-item"><div class="stat-label">Min</div><div class="stat-value">${fmt(min)}</div></div>
        <div class="stat-item"><div class="stat-label">Max</div><div class="stat-value">${fmt(max)}</div></div>
      </div>
      <div style="position:relative;width:100%;height:300px;">
        <canvas id="main-chart" role="img" aria-label="Line chart of ${markerName} over time">${markerName} readings: ${data.join(', ')}</canvas>
      </div>
    </div>
  `;

  const trendEl = document.createElement('div');
  trendEl.style.cssText = 'margin-top:1rem;font-size:13px;color:var(--text-muted);line-height:1.6;padding:10px 14px;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);';
  trendEl.textContent = generateTrendInsight(markerName, vals, m);
  el.querySelector('.chart-card').appendChild(trendEl);

  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  chartInstance = new Chart(document.getElementById('main-chart'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: datasets.length > 1, labels: { color: textColor, font: { family: 'DM Mono, monospace', size: 11 }, boxWidth: 20, padding: 16 } },
        tooltip: {
          backgroundColor: isDark ? '#1e1c18' : '#fff',
          borderColor: isDark ? 'rgba(255,240,210,0.15)' : 'rgba(60,50,30,0.12)',
          borderWidth: 1,
          titleColor: isDark ? '#f0ebe0' : '#1a1610',
          bodyColor: textColor,
          titleFont: { family: 'Instrument Sans, sans-serif', size: 13, weight: '500' },
          bodyFont: { family: 'DM Mono, monospace', size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}${m ? ' ' + m.unit : ''}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { family: 'DM Mono, monospace', size: 11 }, maxRotation: 45, autoSkip: true },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor, font: { family: 'DM Mono, monospace', size: 11 } },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function exportData() {
  const headers = ['Marker', 'Category', 'Value', 'Date', 'Notes'];
  const rows = entries.map(e => [e.marker, e.cat, e.value, e.date, e.notes || '']);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'blood-tracker-export.csv';
  a.click();
}

// ── View switching ──────────────────────────────────────────────────────────
function getViewWidth() {
  return document.querySelector('.views-wrapper').offsetWidth;
}

function snapToView(idx, animate) {
  const container = document.getElementById('views-container');
  const vw = getViewWidth();
  container.style.transition = animate
    ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    : 'none';
  container.style.transform = `translateX(-${idx * vw}px)`;
}

function setView(v) {
  const idx = VIEWS.indexOf(v);
  if (idx === -1) return;
  currentViewIdx = idx;
  snapToView(idx, true);
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  if (v === 'history') renderHistory();
  if (v === 'charts') renderChipMarkers();
}

// ── iOS-style swipe ─────────────────────────────────────────────────────────
(function initSwipe() {
  const wrapper = document.querySelector('.views-wrapper');
  let startX = 0, startY = 0, lastX = 0;
  let isHorizontal = null;
  let active = false;

  wrapper.addEventListener('touchstart', e => {
    startX = lastX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isHorizontal = null;
    active = true;
    const container = document.getElementById('views-container');
    container.style.transition = 'none';
  }, { passive: true });

  wrapper.addEventListener('touchmove', e => {
    if (!active) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    lastX = e.touches[0].clientX;

    if (isHorizontal === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal = Math.abs(dx) >= Math.abs(dy);
      }
      return;
    }
    if (!isHorizontal) return;

    const vw = getViewWidth();
    const base = currentViewIdx * vw;
    let offset = base - dx;
    const min = 0;
    const max = (VIEWS.length - 1) * vw;
    // Rubber-band resistance at edges
    if (offset < min) offset = min - (min - offset) * 0.2;
    if (offset > max) offset = max + (offset - max) * 0.2;

    document.getElementById('views-container').style.transform = `translateX(-${offset}px)`;
  }, { passive: true });

  wrapper.addEventListener('touchend', e => {
    if (!active || !isHorizontal) { active = false; return; }
    active = false;

    const dx = lastX - startX;
    const vw = getViewWidth();
    const threshold = vw * 0.3;

    let newIdx = currentViewIdx;
    if (dx < -threshold && currentViewIdx < VIEWS.length - 1) newIdx++;
    else if (dx > threshold && currentViewIdx > 0) newIdx--;

    currentViewIdx = newIdx;
    snapToView(newIdx, true);
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[newIdx].classList.add('active');
    if (VIEWS[newIdx] === 'history') renderHistory();
    if (VIEWS[newIdx] === 'charts') renderChipMarkers();
  }, { passive: true });

  window.addEventListener('resize', () => snapToView(currentViewIdx, false));
})();

// ── Init ────────────────────────────────────────────────────────────────────
(function init() {
  document.getElementById('entry-date').valueAsDate = new Date();
  buildCatPills();
  buildMarkerSelect();
  buildCatFilter();
  snapToView(0, false);
  document.querySelectorAll('.nav-tab')[0].classList.add('active');
})();
// ── Custom Template Modal ────────────────────────────────────────────────────

let editingTemplateId = null;
let draftMarkers = [];

function populateTmplMarkerDropdown() {
  const sel = document.getElementById('tmpl-mk-name');
  const currentVal = sel.value;
  sel.innerHTML = '<option value="">— Select a marker —</option>' +
    MARKERS.map(m => `<option value="${m.name}"${m.name === currentVal ? ' selected' : ''}>${m.name} (${m.cat})</option>`).join('');
  onTmplMarkerPickChange();
}

function onTmplMarkerPickChange() {
  const name = document.getElementById('tmpl-mk-name').value;
  const unitSel = document.getElementById('tmpl-mk-unit');
  const m = MARKERS.find(mk => mk.name === name);
  if (m) {
    unitSel.innerHTML = `<option value="${m.unit}">${m.unit}</option>`;
    unitSel.value = m.unit;
  } else {
    unitSel.innerHTML = '<option value="">— Unit —</option>';
  }
}

function openTemplateModal(id) {
  editingTemplateId = id || null;
  populateTmplMarkerDropdown();
  if (id) {
    const tmpl = customTemplates.find(t => t.id === id);
    if (!tmpl) return;
    draftMarkers = tmpl.markers.map(m => ({ ...m }));
    document.getElementById('tmpl-name').value = tmpl.name;
    document.getElementById('tmpl-delete-wrap').style.display = 'block';
    document.querySelector('.template-modal-title').textContent = 'Edit Template';
  } else {
    draftMarkers = [];
    document.getElementById('tmpl-name').value = '';
    document.getElementById('tmpl-delete-wrap').style.display = 'none';
    document.querySelector('.template-modal-title').textContent = 'New Test Template';
  }
  renderDraftMarkers();
  document.getElementById('template-modal').classList.add('open');
}

function closeTemplateModal() {
  document.getElementById('template-modal').classList.remove('open');
  editingTemplateId = null;
  draftMarkers = [];
}

function renderDraftMarkers() {
  const el = document.getElementById('tmpl-marker-list');
  if (!draftMarkers.length) {
    el.innerHTML = `<div class="tmpl-empty">No markers yet. Add one below.</div>`;
    return;
  }
  el.innerHTML = draftMarkers.map((m, i) => `
    <div class="tmpl-marker-row">
      <div class="tmpl-marker-info">
        <span class="tmpl-marker-name">${m.name}</span>
        <span class="tmpl-marker-unit">${m.unit || ''}</span>
      </div>
      <div class="tmpl-marker-actions">
        <button class="btn-icon tmpl-edit-btn" onclick="editDraftMarker(${i})" title="Edit">✎</button>
        <button class="btn-icon tmpl-delete-btn" onclick="removeDraftMarker(${i})" title="Remove">✕</button>
      </div>
    </div>
  `).join('');
}

function addDraftMarker() {
  const nameEl = document.getElementById('tmpl-mk-name');
  const unitEl = document.getElementById('tmpl-mk-unit');
  const name = nameEl.value.trim();
  const unit = unitEl.value.trim();
  if (!name) { showToast('Enter a marker name.'); return; }
  if (draftMarkers.find(m => m.name.toLowerCase() === name.toLowerCase())) {
    showToast('Marker already added.'); return;
  }
  draftMarkers.push({ name, unit, cat: 'Custom', low: null, high: null });
  nameEl.value = '';
  unitEl.value = '';
  renderDraftMarkers();
}

function removeDraftMarker(i) {
  draftMarkers.splice(i, 1);
  renderDraftMarkers();
}

function editDraftMarker(i) {
  const m = draftMarkers[i];
  // Swap the row into an inline edit form
  const el = document.getElementById('tmpl-marker-list');
  const rows = el.querySelectorAll('.tmpl-marker-row');
  if (!rows[i]) return;

  const markerOptions = MARKERS.map(mk =>
    `<option value="${mk.name}"${mk.name === m.name ? ' selected' : ''}>${mk.name} (${mk.cat})</option>`
  ).join('');

  const unitVal = m.unit || '';

  rows[i].innerHTML = `
    <div class="tmpl-inline-edit">
      <select id="tmpl-edit-name-${i}" onchange="onTmplEditNameChange(${i})" class="tmpl-inline-select">
        <option value="">— Select —</option>
        ${markerOptions}
      </select>
      <select id="tmpl-edit-unit-${i}" class="tmpl-inline-select" style="max-width:110px;">
        <option value="${unitVal}">${unitVal || '—'}</option>
      </select>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn-icon tmpl-edit-btn" onclick="confirmEditDraftMarker(${i})" title="Save">✓</button>
        <button class="btn-icon tmpl-delete-btn" onclick="renderDraftMarkers()" title="Cancel">✕</button>
      </div>
    </div>
  `;
}

function onTmplEditNameChange(i) {
  const name = document.getElementById(`tmpl-edit-name-${i}`).value;
  const unitSel = document.getElementById(`tmpl-edit-unit-${i}`);
  const m = MARKERS.find(mk => mk.name === name);
  if (m) {
    unitSel.innerHTML = `<option value="${m.unit}">${m.unit}</option>`;
  } else {
    unitSel.innerHTML = '<option value="">—</option>';
  }
}

function confirmEditDraftMarker(i) {
  const name = document.getElementById(`tmpl-edit-name-${i}`).value;
  const unit = document.getElementById(`tmpl-edit-unit-${i}`).value;
  if (!name) { showToast('Select a marker.'); return; }
  const mk = MARKERS.find(m => m.name === name);
  draftMarkers[i] = { name, unit, cat: mk ? mk.cat : 'Custom', low: mk ? mk.low : null, high: mk ? mk.high : null };
  renderDraftMarkers();
}

function saveTemplate() {
  const name = document.getElementById('tmpl-name').value.trim();
  if (!name) { showToast('Give your test a name.'); return; }
  if (!draftMarkers.length) { showToast('Add at least one marker.'); return; }
  if (editingTemplateId) {
    const idx = customTemplates.findIndex(t => t.id === editingTemplateId);
    if (idx > -1) customTemplates[idx] = { id: editingTemplateId, name, markers: draftMarkers };
  } else {
    customTemplates.push({ id: 'tmpl_' + Date.now(), name, markers: draftMarkers });
  }
  saveTemplates();
  buildCatPills();
  closeTemplateModal();
  showToast('Template saved!');
}

function deleteTemplate(id) {
  if (!confirm('Delete this template?')) return;
  customTemplates = customTemplates.filter(t => t.id !== id);
  saveTemplates();
  if (selectedCat === '__tmpl__' + id) {
    selectedCat = CATS[0];
    buildMarkerSelect();
  }
  buildCatPills();
  closeTemplateModal();
  showToast('Template deleted.');
}