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
let entries = JSON.parse(localStorage.getItem('bt_entries') || '[]');
let selectedCat = CATS[0];
let activeChipMarker = null;

function save() { localStorage.setItem('bt_entries', JSON.stringify(entries)); }

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
  el.innerHTML = CATS.map(c =>
    `<button class="cat-pill${c === selectedCat ? ' active' : ''}" onclick="selectCat('${c}')">${c}</button>`
  ).join('');
}

function selectCat(cat) {
  selectedCat = cat;
  buildCatPills();
  buildMarkerSelect();
}

function buildMarkerSelect() {
  const sel = document.getElementById('marker-select');
  const markers = MARKERS.filter(m => m.cat === selectedCat);
  sel.innerHTML = markers.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
  onMarkerChange();
}

function onMarkerChange() {
  const name = document.getElementById('marker-select').value;
  const m = getMarker(name);
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
  const name = document.getElementById('marker-select').value;
  const val = document.getElementById('entry-value').value;
  const date = document.getElementById('entry-date').value;
  const notes = document.getElementById('entry-notes').value.trim();
  if (!name || !val || !date) { showToast('Please fill in marker, value and date.'); return; }
  const m = getMarker(name);
  entries.push({ id: Date.now(), marker: name, cat: m ? m.cat : '', value: val, date, notes });
  save();
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

  let filtered = entries.filter(e => {
    if (search && !e.marker.toLowerCase().includes(search)) return false;
    if (catF && e.cat !== catF) return false;
    return true;
  });

  if (sort === 'date-desc') filtered.sort((a,b) => b.date.localeCompare(a.date));
  else if (sort === 'date-asc') filtered.sort((a,b) => a.date.localeCompare(b.date));
  else filtered.sort((a,b) => a.marker.localeCompare(b.marker));

  const el = document.getElementById('results-list');
  if (!filtered.length) {
    el.innerHTML = `<div class="empty-state"><div class="big">◎</div><p>${entries.length ? 'No results match your filter.' : 'No results yet. Add your first entry.'}</p></div>`;
    return;
  }
  el.innerHTML = filtered.map(e => {
    const m = getMarker(e.marker);
    const s = statusOf(m, e.value);
    const unit = m ? m.unit : '';
    return `<div class="result-row">
      <div><div class="result-marker">${e.marker}</div><div class="result-cat">${e.cat}</div></div>
      <div class="result-val">${fmt(e.value)} <span style="font-size:11px;color:var(--text-hint);font-weight:400;">${unit}</span> <span class="status-badge status-${s}">${statusLabel(s)}</span></div>
      <div class="result-date">${formatDate(e.date)}</div>
      <div></div>
      <button class="btn-icon" onclick="deleteEntry(${e.id})" title="Delete">✕</button>
    </div>`;
  }).join('');
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

  // Desktop chips
  el.innerHTML = tracked.map(name => {
    const count = entries.filter(e => e.marker === name).length;
    const sel = activeChipMarker === name;
    return `<div class="marker-chip${sel ? ' selected' : ''}" onclick="selectChipMarker('${name.replace(/'/g,"\\'")}')">
      <div class="mc-name">${name}</div>
      <div class="mc-count">${count} result${count !== 1 ? 's' : ''}</div>
    </div>`;
  }).join('');

  // Mobile dropdown
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
  const oldest = vals[0];
  const n = vals.length;

  // Linear regression slope across all points
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

  // Direction word
  let direction, directionAdverb;
  if (slope > 0) {
    direction = 'rising';
    directionAdverb = isRapid ? 'rising sharply' : isSteady ? 'creeping upward' : 'trending upward';
  } else if (slope < 0) {
    direction = 'falling';
    directionAdverb = isRapid ? 'dropping sharply' : isSteady ? 'gradually decreasing' : 'trending downward';
  } else {
    return `${markerName} has been very stable across all ${n} readings.`;
  }

  const span = n === 2 ? 'between your two readings' : `across your last ${n} results`;

  // Status-aware commentary
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

  // Normal range, stable
  if (isSteady) {
    return `${markerName} is within the normal range and has stayed very consistent ${span} — no meaningful change.`;
  }

  // Normal range, moving
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
  const dotColor = '#c8460a';

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

  const refLines = [];
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

  // Trend insight
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

function setView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  const idx = ['add','history','charts'].indexOf(v);
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  if (v === 'history') renderHistory();
  if (v === 'charts') renderChipMarkers();
}
// Swipe navigation
(function initSwipe() {
  const views = ['add', 'history', 'charts'];
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > dy && dx > 10) isDragging = true;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!isDragging) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = Math.abs(e.changedTouches[0].clientY - startY);
    if (Math.abs(dx) < 50 || dy > 80) return;

    const currentView = views.find(v => document.getElementById('view-' + v).classList.contains('active'));
    const currentIdx = views.indexOf(currentView);

    if (dx < 0 && currentIdx < views.length - 1) setView(views[currentIdx + 1]); // swipe left → next
    if (dx > 0 && currentIdx > 0) setView(views[currentIdx - 1]);                // swipe right → prev
  }, { passive: true });
})();
// Init
(function init() {
  document.getElementById('entry-date').valueAsDate = new Date();
  buildCatPills();
  buildMarkerSelect();
  buildCatFilter();
})();
