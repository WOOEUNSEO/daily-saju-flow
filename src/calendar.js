import lunarJavascript from 'lunar-javascript';

const { Solar, SolarUtil } = lunarJavascript;
const HOUR_MS = 60 * 60 * 1000;
const KST_OFFSET = 9 * HOUR_MS;
const CST_OFFSET = 8 * HOUR_MS;
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
});

const TERM_NAMES = {
  小寒: '소한', 立春: '입춘', 惊蛰: '경칩', 驚蟄: '경칩', 清明: '청명',
  立夏: '입하', 芒种: '망종', 芒種: '망종', 小暑: '소서', 立秋: '입추',
  白露: '백로', 寒露: '한로', 立冬: '입동', 大雪: '대설',
};

const pad = (number) => String(number).padStart(2, '0');

function validInstant(value) {
  const instant = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(instant.getTime())) throw new RangeError('유효한 시각이 필요합니다.');
  return instant;
}

function parseDate(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new RangeError('날짜는 YYYY-MM-DD 형식이어야 합니다.');
  }
  const [year, month, day] = dateString.split('-').map(Number);
  if (year < 1900 || year > 2099 || month < 1 || month > 12 || day < 1
    || day > SolarUtil.getDaysOfMonth(year, month)) {
    throw new RangeError('1900년부터 2099년 사이의 유효한 날짜가 필요합니다.');
  }
  return { year, month, day };
}

/** A calendar date in Asia/Seoul, independent of the browser/OS timezone. */
export function getSeoulDate(now = new Date()) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(validInstant(now))
    .filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function noonInSeoul(dateString) {
  parseDate(dateString);
  return new Date(`${dateString}T12:00:00+09:00`);
}

function solarAtChinaTime(instant) {
  const chinaTime = new Date(instant.getTime() + CST_OFFSET);
  return Solar.fromYmdHms(
    chinaTime.getUTCFullYear(), chinaTime.getUTCMonth() + 1, chinaTime.getUTCDate(),
    chinaTime.getUTCHours(), chinaTime.getUTCMinutes(), chinaTime.getUTCSeconds(),
  );
}

function koreaTimestamp(instant) {
  return `${new Date(instant.getTime() + KST_OFFSET).toISOString().slice(0, 19)}+09:00`;
}

function termInstant(solar) {
  // The library's ShouXingUtil.qiAccurate adds ONE_THIRD day (= UTC+8).
  // Attach that offset before displaying the same instant as Korean time.
  // Source: https://github.com/6tail/lunar-javascript/blob/v1.7.7/lunar.js
  return new Date(`${solar.toYmdHms().replace(' ', 'T')}+08:00`);
}

/**
 * Day pillar changes at 00:00 KST (civil-day convention).
 * Year/month pillars change at the exact LiChun/Jie instant, not at midnight.
 * Pass the current Date for TODAY; a selected calendar date uses 12:00 KST.
 * The optional instant must belong to the supplied Korean calendar date.
 * API reference: https://6tail.cn/calendar/lunar.ganzhi.html
 */
export function getDayInfo(dateString = getSeoulDate(), instant) {
  const { year, month, day } = parseDate(dateString);
  const reference = instant === undefined ? noonInSeoul(dateString) : validInstant(instant);
  if (getSeoulDate(reference) !== dateString) {
    throw new RangeError('기준 시각과 한국 날짜가 일치해야 합니다.');
  }
  const civilSolar = Solar.fromYmd(year, month, day);
  const dayGanZhi = civilSolar.getLunar().getDayInGanZhi();
  // Only term-dependent year/month use China wall time. Using this object's
  // day pillar would incorrectly keep yesterday during 00:00–00:59 KST.
  const termLunar = solarAtChinaTime(reference).getLunar();
  const monthGanZhi = termLunar.getMonthInGanZhiExact();
  const yearGanZhi = termLunar.getYearInGanZhiExact();
  return {
    date: dateString,
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    ganZhi: dayGanZhi,
    stem: dayGanZhi[0],
    branch: dayGanZhi[1],
    day,
    weekday: civilSolar.getWeek(),
    referenceTime: koreaTimestamp(reference),
    referenceMode: instant === undefined ? 'noon' : 'instant',
  };
}

function shiftMonth(monthKey, offset) {
  const { year, month } = parseDate(`${monthKey}-01`);
  const shifted = Solar.fromYmd(year, month, 1).nextMonth(offset);
  return `${shifted.getYear()}-${pad(shifted.getMonth())}`;
}

/** Exactly previous/current/next Gregorian month for calendar navigation. */
export function getCalendarMonths(today = getSeoulDate()) {
  parseDate(today);
  const month = today.slice(0, 7);
  return [-1, 0, 1].map((offset) => shiftMonth(month, offset));
}

/** Only actual days; the UI adds empty leading/trailing calendar cells. */
export function getCalendarDays(month) {
  const { year, month: monthNumber } = parseDate(`${month}-01`);
  return Array.from({ length: SolarUtil.getDaysOfMonth(year, monthNumber) }, (_, index) =>
    getDayInfo(`${month}-${pad(index + 1)}`));
}

/**
 * Four labels: this Gregorian month and the next three, as requested.
 * Each interval is [the Jie IN that month, the next Jie), with exact KST bounds.
 * E.g. 2026.10 is 戊戌 from Hanro, while Oct 1 TODAY still has 丁酉 month.
 * Before its starting Jie, the first interval is explicitly isUpcoming=true.
 */
export function getMonthPeriods(today = getSeoulDate(), instant) {
  parseDate(today);
  const reference = instant === undefined ? noonInSeoul(today) : validInstant(instant);
  if (getSeoulDate(reference) !== today) {
    throw new RangeError('기준 시각과 한국 날짜가 일치해야 합니다.');
  }
  return Array.from({ length: 4 }, (_, index) => {
    const key = shiftMonth(today.slice(0, 7), index);
    const { year, month } = parseDate(`${key}-01`);
    const startJie = Solar.fromYmd(year, month, 1).getLunar().getNextJie(false);
    const startSolar = startJie.getSolar();
    const endJie = startSolar.next(1).getLunar().getNextJie(false);
    const start = termInstant(startSolar);
    const end = termInstant(endJie.getSolar());
    const ganZhi = startSolar.getLunar().getMonthInGanZhiExact();
    return {
      key,
      label: key.replace('-', '.'),
      ganZhi,
      monthGanZhi: ganZhi,
      stem: ganZhi[0],
      branch: ganZhi[1],
      start: koreaTimestamp(start),
      end: koreaTimestamp(end),
      startTerm: TERM_NAMES[startJie.getName()] ?? startJie.getName(),
      endTerm: TERM_NAMES[endJie.getName()] ?? endJie.getName(),
      isCurrent: reference >= start && reference < end,
      isUpcoming: reference < start,
    };
  });
}
