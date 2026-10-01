import './styles.css';
import { getSeoulDate, getDayInfo, getCalendarMonths, getCalendarDays, getMonthPeriods } from './calendar.js';
import { PEOPLE, BASE_RELATIONS, PILLAR_ORDER, PILLAR_LABELS, GLOSSARY } from './data.js';
import { generateDailySummary, generateMonthlySummary } from './interpretation.js';

const app = document.querySelector('#app');
const tabs = [['today', '오늘'], ['calendar', '달력'], ['month', '월운'], ['base', '기본']];
const state = { today: getSeoulDate(), view: 'today', selected: getSeoulDate(), month: getSeoulDate().slice(0, 7) };
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const dotted = (date) => date.replaceAll('-', '.');
const tags = (items) => `<div class="tags">${items.slice(0, 3).map((tag) => `<span>${escape(tag)}</span>`).join('')}</div>`;
const paragraphs = (items) => items.map((text) => `<p>${escape(text)}</p>`).join('');
const evidence = (items) => `<p class="evidence">${items.map(escape).join(' · ')}</p>`;
const labeledText = (label, text) => `<div class="reading-block"><span class="reading-subtitle">${escape(label)}</span><p>${escape(text)}</p></div>`;

function readRoute() {
  const [view, selected] = location.hash.slice(1).split('/');
  state.view = tabs.some(([id]) => id === view) ? view : 'today';
  if (state.view === 'calendar' && selected && /^\d{4}-\d{2}-\d{2}$/.test(selected)
    && getCalendarMonths(state.today).includes(selected.slice(0, 7))) {
    try {
      getDayInfo(selected);
      state.selected = selected;
      state.month = selected.slice(0, 7);
    } catch { state.selected = state.today; state.month = state.today.slice(0, 7); }
  }
}

function personSection(person, { monthly = false } = {}) {
  const body = person.sections
    ? `${labeledText('상태', person.sections.state)}${labeledText('사람 · 대화', person.sections.people)}${labeledText('일', person.sections.work)}`
    : paragraphs(person.sentences);
  return `<section class="reading person-reading" aria-label="${escape(person.name)} 분석">
    <div class="reading-label"><h2>${escape(person.name)}</h2><span class="metadata">${escape(person.tenGod)}</span></div>
    <div class="reading-content"><h3>${escape(person.headline)}</h3>
      <div class="reading-text reading-sections">${body}</div>
      ${tags(person.tags)}${evidence(person.evidence)}
      ${!monthly && person.signals?.length ? `<details class="signal-details"><summary>분석 근거 더 보기</summary><ul>${person.signals.map((signal) => `<li>${escape(signal.evidence || signal.label || signal.keyword || signal.text)}</li>`).join('')}</ul></details>` : ''}
    </div>
  </section>`;
}

function pairSection(pair, { monthly = false } = {}) {
  const body = pair.sections
    ? `${labeledText(monthly ? '관계' : '오늘의 관계', pair.sections.relationship)}${labeledText('대화', pair.sections.conversation)}${labeledText('같이 있을 때', pair.sections.together)}${labeledText('업무', pair.sections.work)}`
    : paragraphs(pair.sentences);
  return `<section class="reading pair-reading" aria-label="둘의 흐름 분석">
    <div class="reading-label"><h2>둘의 흐름</h2><span class="metadata">전체 관계</span></div>
    <div class="reading-content"><h3>${escape(pair.headline)}</h3>
      <div class="reading-text reading-sections">${body}</div>${tags(pair.tags)}${evidence(pair.evidence)}
      ${monthly && pair.activations?.length ? `<details class="signal-details"><summary>기본 관계에 미치는 영향</summary><ul>${pair.activations.map((item) => `<li><strong>${escape(item.label)} · ${escape(item.state)}</strong> — ${escape(item.text)}</li>`).join('')}</ul></details>` : ''}
    </div>
  </section>`;
}

function dailyReading(date, current = false) {
  const info = getDayInfo(date, current ? new Date() : undefined);
  const result = generateDailySummary(info);
  return `<div class="day-heading">
    <div><p class="eyebrow">${current ? '오늘의 일진' : '선택한 날의 일진'}</p><h1 data-testid="analysis-date">${dotted(date)}</h1></div>
    <div class="day-pillar"><strong data-testid="day-ganzi">${escape(info.dayGanZhi)}</strong><span class="metadata">${escape(info.yearGanZhi)}年 · ${escape(info.monthGanZhi)}月 · ${escape(info.dayGanZhi)}日</span></div>
  </div>
  ${current ? '' : '<p class="date-note">한국 시간 정오 기준 · 절입 당일은 시각에 따라 년·월주가 달라질 수 있습니다.</p>'}
  <div class="daily-readings">${result.people.map((person) => personSection(person)).join('')}${pairSection(result.pair)}</div>`;
}

function calendarView() {
  const months = getCalendarMonths(state.today);
  const index = months.indexOf(state.month);
  const days = getCalendarDays(state.month);
  return `<section class="calendar-section" aria-label="일진 달력">
    <div class="section-heading"><div><p class="eyebrow">날짜별 흐름</p><h1>${dotted(state.month)}</h1></div>
      <div class="month-controls"><button data-action="prev" aria-label="이전 달" ${index === 0 ? 'disabled' : ''}>이전</button><button data-action="next" aria-label="다음 달" ${index === 2 ? 'disabled' : ''}>다음</button></div></div>
    <div class="calendar-grid weekdays" aria-hidden="true">${['일', '월', '화', '수', '목', '금', '토'].map((day) => `<span>${day}</span>`).join('')}</div>
    <div class="calendar-grid dates">${'<span class="empty-date" aria-hidden="true"></span>'.repeat(days[0].weekday)}${days.map((day) => {
      const [year, month, date] = day.date.split('-').map(Number);
      return `<button class="date-cell ${day.date === state.today ? 'is-today' : ''} ${day.date === state.selected ? 'is-selected' : ''}" data-date="${day.date}" aria-label="${year}년 ${month}월 ${date}일 ${day.dayGanZhi}" aria-pressed="${day.date === state.selected}" ${day.date === state.today ? 'aria-current="date"' : ''}><span>${day.day}</span><small>${day.dayGanZhi}</small></button>`;
    }).join('')}</div>
    <p class="calendar-caption"><span class="today-dot"></span>오늘<span>${dotted(months[0])} — ${dotted(months[2])}</span></p>
  </section><div class="selected-reading">${dailyReading(state.selected)}</div>`;
}

const formatBoundary = (iso) => `${iso.slice(0, 10).replaceAll('-', '.')} ${iso.slice(11, 16)}`;

function monthView() {
  const periods = getMonthPeriods(state.today, new Date());
  return `<div class="section-heading"><div><p class="eyebrow">이번 달부터 다음 세 달까지</p><h1>월운의 흐름</h1></div><span class="metadata">절기 기준 · 한국 시간</span></div>
    <p class="intro-note">각 달에 들어오는 절기부터 다음 절기 전까지의 흐름입니다.</p>
    <div class="month-list">${periods.map((period) => {
      const result = generateMonthlySummary(period);
      return `<details class="month-item" data-month="${period.key}"><summary>
        <div class="month-topline"><span class="month-date">${period.label}</span><strong class="month-ganzi">${period.ganZhi}</strong><span class="month-state">${period.isCurrent ? '진행 중' : `${period.startTerm}부터`}</span><span class="expand-label">상세 <span aria-hidden="true">＋</span></span></div>
        <p class="month-period">${period.startTerm} ${formatBoundary(period.start)} — ${period.endTerm} ${formatBoundary(period.end)} 전</p>
        <div class="month-ten-gods">${result.people.map((person) => `<span>${person.name}<b>${person.tenGod}</b></span>`).join('')}</div>
        <p class="month-headline">${escape(result.pair.headline)}</p>${tags(result.pair.tags)}
      </summary><div class="month-detail">${result.people.map((person) => personSection(person, { monthly: true })).join('')}${pairSection(result.pair, { monthly: true })}</div></details>`;
    }).join('')}</div>`;
}

function baseView() {
  return `<div class="section-heading"><div><p class="eyebrow">변하지 않는 두 사람의 바탕</p><h1>기본 만세력</h1></div></div>
    <div class="natal-charts">${PEOPLE.map((person) => {
      const positions = PILLAR_ORDER.filter((position) => person.pillars[position] && !(position === 'hour' && person.hourUnknown));
      return `<section class="natal-person" data-person="${person.id}"><div class="natal-title"><h2>${person.name}</h2><span class="metadata">${person.dayMaster} 일간</span></div>
        <table class="pillar-table" data-testid="person-${person.id}-pillars"><caption class="sr-only">${person.name}의 확정 사주</caption><thead><tr>${positions.map((position) => `<th scope="col" data-pillar="${position}">${PILLAR_LABELS[position]}</th>`).join('')}</tr></thead><tbody><tr>${positions.map((position) => `<td class="${position === 'day' ? 'day-master' : ''}">${person.pillars[position][0]}</td>`).join('')}</tr><tr>${positions.map((position) => `<td>${person.pillars[position][1]}</td>`).join('')}</tr></tbody></table>
        <p class="birth-note">${person.hourUnknown ? '출생시간 미상 · 시주 제외' : '시주까지 반영'}</p><div class="natal-traits">${paragraphs(person.traits)}</div></section>`;
    }).join('')}</div>
    <div class="base-heading"><h2>기본 관계</h2><p class="metadata">일지의 관계를 중심으로, 자리의 비중을 다르게 읽습니다.</p></div>
    <div class="base-relations">${BASE_RELATIONS.map((relation, index) => `<details class="relation-item" ${index < 3 ? 'open' : ''}><summary><span>${escape(relation.title)}</span><span class="relation-label">${escape(relation.label)}</span></summary><div>${paragraphs([relation.text])}${evidence([relation.evidence])}<p class="term-explanation">${escape(relation.detail)}</p></div></details>`).join('')}</div>
    <details class="glossary"><summary>명리 용어 짧게 읽기</summary><dl>${Object.entries(GLOSSARY).map(([word, description]) => `<dt>${escape(word)}</dt><dd>${escape(description)}</dd>`).join('')}</dl></details>`;
}

function render() {
  const now = new Date();
  syncDate(now);
  const current = getDayInfo(state.today, now);
  const view = state.view === 'today' ? dailyReading(state.today, true) : state.view === 'calendar' ? calendarView() : state.view === 'month' ? monthView() : baseView();
  app.innerHTML = `<div class="shell"><header class="site-header"><a class="wordmark" href="#today" aria-label="DAILY FLOW 오늘">DAILY FLOW</a><div class="header-date"><span>${dotted(state.today)}</span><span>${current.yearGanZhi}年 · ${current.monthGanZhi}月 · ${current.dayGanZhi}日</span></div></header>
    <nav class="main-nav" aria-label="주 메뉴">${tabs.map(([id, label]) => `<button data-view="${id}" ${state.view === id ? 'aria-current="page"' : ''}>${label}</button>`).join('')}<span class="timezone">한국 시간</span></nav>
    <main id="content" tabindex="-1">${view}</main><footer>전통 명리의 상징 체계를 바탕으로 정리한 개인용 참고 기록입니다.</footer></div>`;
  document.title = `DAILY FLOW · ${tabs.find(([id]) => id === state.view)[1]}`;
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.view) {
    const nextView = button.dataset.view;
    location.hash = nextView === 'calendar' ? `calendar/${state.selected}` : nextView;
  } else if (button.dataset.action) {
    const months = getCalendarMonths(state.today);
    const offset = button.dataset.action === 'prev' ? -1 : 1;
    state.month = months[months.indexOf(state.month) + offset] || state.month;
    render();
    app.querySelector(`[data-action="${button.dataset.action}"]`)?.focus();
  } else if (button.dataset.date) {
    state.selected = button.dataset.date;
    history.replaceState(null, '', `#calendar/${state.selected}`);
    render();
    app.querySelector(`[data-date="${state.selected}"]`)?.focus();
  }
});

window.addEventListener('hashchange', () => { readRoute(); render(); });
// Refresh at Korean midnight and at a term boundary, including tabs left open.
function syncDate(now = new Date()) {
  const today = getSeoulDate(now);
  const changedDay = today !== state.today;
  if (changedDay) {
    state.today = today;
    state.selected = today;
    state.month = today.slice(0, 7);
    if (state.view === 'calendar') history.replaceState(null, '', `#calendar/${today}`);
  }
  return today;
}

function refreshClock() {
  const today = syncDate();
  const now = getDayInfo(today, new Date());
  const clockKey = `${today}/${now.yearGanZhi}/${now.monthGanZhi}`;
  if (clockKey !== refreshClock.lastKey) {
    refreshClock.lastKey = clockKey;
    render();
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshClock(); });
window.addEventListener('focus', refreshClock);
setInterval(refreshClock, 30_000);
readRoute();
refreshClock();
