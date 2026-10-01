import { describe, expect, it } from 'vitest';
import {
  getSeoulDate, getDayInfo, getCalendarMonths, getCalendarDays, getMonthPeriods,
} from '../src/calendar.js';

const at = (timestamp) => getDayInfo(timestamp.slice(0, 10), new Date(timestamp));

describe('Korean calendar and pillars', () => {
  it('matches the required day-pillar reference and following day', () => {
    expect(getDayInfo('2026-09-30').dayGanZhi).toBe('丁未');
    expect(getDayInfo('2026-10-01')).toMatchObject({
      yearGanZhi: '丙午', monthGanZhi: '丁酉', dayGanZhi: '戊申',
      stem: '戊', branch: '申', weekday: 4,
    });
  });

  it('recognizes the Korean date on either side of midnight', () => {
    expect(getSeoulDate(new Date('2026-09-30T14:59:59Z'))).toBe('2026-09-30');
    expect(getSeoulDate(new Date('2026-09-30T15:00:00Z'))).toBe('2026-10-01');
  });

  it('changes the civil day at midnight KST, not China midnight or 23:00', () => {
    expect(at('2026-09-30T23:59:59+09:00').dayGanZhi).toBe('丁未');
    expect(at('2026-10-01T00:00:00+09:00').dayGanZhi).toBe('戊申');
    expect(at('2026-10-01T00:30:00+09:00').dayGanZhi).toBe('戊申');
    expect(at('2026-10-01T23:30:00+09:00').dayGanZhi).toBe('戊申');
  });

  it('keeps year/month pillars through a Gregorian month or year boundary', () => {
    expect(getDayInfo('2026-09-30').monthGanZhi).toBe('丁酉');
    expect(getDayInfo('2026-10-01').monthGanZhi).toBe('丁酉');
    expect(getDayInfo('2027-01-01')).toMatchObject({ yearGanZhi: '丙午', monthGanZhi: '庚子' });
  });

  it('uses exact LiChun in Korea, rather than the Chinese wall clock or lunar new year', () => {
    expect(at('2026-02-04T04:30:00+09:00')).toMatchObject({ yearGanZhi: '乙巳', monthGanZhi: '己丑' });
    expect(at('2026-02-04T05:03:00+09:00')).toMatchObject({ yearGanZhi: '丙午', monthGanZhi: '庚寅' });
    expect(getDayInfo('2026-02-16').yearGanZhi).toBe('丙午');
  });

  it('handles the one-hour China/Korea difference at Hanro', () => {
    expect(at('2026-10-08T15:00:00+09:00').monthGanZhi).toBe('丁酉');
    expect(at('2026-10-08T15:30:00+09:00').monthGanZhi).toBe('戊戌');
  });

  // Independent reference: KASI 2026 calendar, 24절기 table (Korean time).
  // https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2026
  // Published times have minute resolution; allow 90 s for rounding/model differences.
  it.each([
    ['2026-01-05T17:23:00+09:00', '戊子', '己丑'],
    ['2026-02-04T05:02:00+09:00', '己丑', '庚寅'],
    ['2026-03-05T22:59:00+09:00', '庚寅', '辛卯'],
    ['2026-04-05T03:40:00+09:00', '辛卯', '壬辰'],
    ['2026-05-05T20:49:00+09:00', '壬辰', '癸巳'],
    ['2026-06-06T00:48:00+09:00', '癸巳', '甲午'],
    ['2026-07-07T10:57:00+09:00', '甲午', '乙未'],
    ['2026-08-07T20:43:00+09:00', '乙未', '丙申'],
    ['2026-09-07T23:41:00+09:00', '丙申', '丁酉'],
    ['2026-10-08T15:29:00+09:00', '丁酉', '戊戌'],
    ['2026-11-07T18:52:00+09:00', '戊戌', '己亥'],
    ['2026-12-07T11:53:00+09:00', '己亥', '庚子'],
  ])('switches at the published solar Jie around %s', (timestamp, previous, next) => {
    const instant = new Date(timestamp);
    const before = new Date(instant.getTime() - 90_000);
    const after = new Date(instant.getTime() + 90_000);
    expect(getDayInfo(getSeoulDate(before), before).monthGanZhi).toBe(previous);
    expect(getDayInfo(getSeoulDate(after), after).monthGanZhi).toBe(next);
  });

  it('uses noon KST consistently for a selected date', () => {
    expect(getDayInfo('2026-10-08')).toMatchObject({
      monthGanZhi: '丁酉', referenceTime: '2026-10-08T12:00:00+09:00', referenceMode: 'noon',
    });
    expect(() => getDayInfo('2026-10-01', new Date('2026-09-30T10:00:00Z'))).toThrow();
  });

  it('rejects malformed and impossible dates rather than silently rolling over', () => {
    for (const input of ['2026-02-29', '2026-13-01', '2026-00-01', '2026-04-31', '2026-10-0', 'bad']) {
      expect(() => getDayInfo(input)).toThrow(RangeError);
    }
  });
});

describe('Calendar and month navigation ranges', () => {
  it('returns exactly three Gregorian months across year boundaries', () => {
    expect(getCalendarMonths('2026-10-01')).toEqual(['2026-09', '2026-10', '2026-11']);
    expect(getCalendarMonths('2027-01-31')).toEqual(['2026-12', '2027-01', '2027-02']);
    expect(getCalendarMonths('2026-12-01')).toEqual(['2026-11', '2026-12', '2027-01']);
  });

  it('includes actual days, correct leap years and no out-of-month dates', () => {
    const october = getCalendarDays('2026-10');
    expect(october).toHaveLength(31);
    expect(october[0]).toMatchObject({ date: '2026-10-01', day: 1, weekday: 4, dayGanZhi: '戊申' });
    expect(october.at(-1).date).toBe('2026-10-31');
    expect(getCalendarDays('2028-02')).toHaveLength(29);
    expect(getCalendarDays('2027-02')).toHaveLength(28);
  });

  it('returns this month plus three with explicit solar-term intervals', () => {
    const periods = getMonthPeriods('2026-10-01');
    expect(periods.map(({ key }) => key)).toEqual(['2026-10', '2026-11', '2026-12', '2027-01']);
    expect(periods.map(({ ganZhi }) => ganZhi)).toEqual(['戊戌', '己亥', '庚子', '辛丑']);
    expect(periods[0]).toMatchObject({ label: '2026.10', startTerm: '한로', endTerm: '입동', isCurrent: false, isUpcoming: true });
    expect(periods[0].start).toMatch(/^2026-10-08T15:29:\d{2}\+09:00$/);
    for (let index = 0; index < 3; index += 1) {
      expect(periods[index].end).toBe(periods[index + 1].start);
    }
  });

  it('uses inclusive start and exclusive end at the actual term second', () => {
    const period = getMonthPeriods('2026-10-01')[0];
    const start = new Date(period.start);
    const before = new Date(start.getTime() - 1_000);
    expect(getDayInfo(getSeoulDate(before), before).monthGanZhi).toBe('丁酉');
    expect(getDayInfo(getSeoulDate(start), start).monthGanZhi).toBe('戊戌');
    expect(getMonthPeriods(getSeoulDate(before), before)[0].isUpcoming).toBe(true);
    expect(getMonthPeriods(getSeoulDate(start), start)[0].isCurrent).toBe(true);
    expect(getDayInfo(getSeoulDate(new Date(period.end)), new Date(period.end)).monthGanZhi).toBe('己亥');
  });
});
