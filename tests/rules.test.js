import { describe, expect, it } from 'vitest';
import { PEOPLE } from '../src/data.js';
import { analyzePersonSignals, getBranchRelations, getGroupRelations, getKnownPillars, getPairPositionWeight, getStemRelations, getTenGod, selectKeySignals } from '../src/rules.js';

describe('십성은 일간의 오행과 음양으로 계산한다', () => {
  it.each(Object.entries({ 庚: '편인', 辛: '정인', 甲: '식신', 乙: '상관', 丙: '편재', 丁: '정재', 戊: '편관', 己: '정관', 壬: '비견', 癸: '겁재' }))('壬 기준 %s = %s', (stem, expected) => {
    expect(getTenGod('壬', stem)).toBe(expected);
  });
  it.each(Object.entries({ 庚: '비견', 辛: '겁재', 壬: '식신', 癸: '상관', 甲: '편재', 乙: '정재', 丙: '편관', 丁: '정관', 戊: '편인', 己: '정인' }))('庚 기준 %s = %s', (stem, expected) => {
    expect(getTenGod('庚', stem)).toBe(expected);
  });
  it('음간도 같은 음양/다른 음양을 구분한다', () => {
    expect(getTenGod('癸', '辛')).toBe('편인');
    expect(getTenGod('癸', '庚')).toBe('정인');
    expect(getTenGod('乙', '丁')).toBe('식신');
    expect(getTenGod('乙', '丙')).toBe('상관');
  });
  it('잘못된 천간을 조용히 해석하지 않는다', () => {
    expect(() => getTenGod('子', '丁')).toThrow();
  });
});

describe('천간 합과 생극', () => {
  it('丁壬合과 火水 극 관계를 모두 보존한다', () => {
    expect(getStemRelations('丁', '壬').map((item) => item.type)).toEqual(['stemCombination', 'stemControlled']);
    expect(getStemRelations('壬', '丁')[0].label).toBe('丁壬合');
  });
  it('金生水의 방향을 유지한다', () => {
    expect(getStemRelations('庚', '壬')).toContainEqual(expect.objectContaining({ type: 'stemGenerates', label: '庚→壬 金生水' }));
    expect(getStemRelations('壬', '庚')).toContainEqual(expect.objectContaining({ type: 'stemReceives', label: '庚→壬 金生水' }));
  });
});

describe('지지 관계', () => {
  it.each([
    ['子午', 'clash'], ['子丑', 'combination'], ['卯未', 'partialTrine'], ['午戌', 'partialTrine'],
    ['子未', 'harm'], ['丑未', 'clash'], ['子卯', 'punishment'],
  ])('%s의 %s 관계를 양방향에서 찾는다', (pair, type) => {
    expect(getBranchRelations(pair[0], pair[1]).some((item) => item.type === type)).toBe(true);
    expect(getBranchRelations(pair[1], pair[0]).some((item) => item.type === type)).toBe(true);
  });
  it.each([
    ['combination', ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未']],
    ['clash', ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']],
    ['harm', ['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌']],
    ['break', ['子酉', '丑辰', '寅亥', '卯午', '巳申', '未戌']],
  ])('%s의 모든 쌍을 포함한다', (type, pairs) => {
    for (const pair of pairs) expect(getBranchRelations(pair[0], pair[1]).some((item) => item.type === type)).toBe(true);
  });
  it('六合과 破가 겹치면 서로 다른 타입을 보존한다', () => {
    expect(getBranchRelations('寅', '亥').map((item) => item.type)).toEqual(['combination', 'break']);
  });
  it('같은 글자의 중복은 삼합을 완성하지 않는다', () => {
    expect(getGroupRelations(['卯', '未', '未']).map((item) => item.type)).toEqual(['partialTrine']);
    expect(getGroupRelations(['申', '子', '子']).some((item) => item.type === 'trine')).toBe(false);
  });
  it.each(['申子辰', '亥卯未', '寅午戌', '巳酉丑'])('%s 세 글자로 삼합을 완성한다', (group) => {
    expect(getGroupRelations([...group])).toContainEqual(expect.objectContaining({ type: 'trine', complete: true, characters: group }));
  });
  it.each(['寅卯辰', '巳午未', '申酉戌', '亥子丑'])('%s 세 글자가 있어야 삼회를 표시한다', (group) => {
    expect(getGroupRelations([...group])).toContainEqual(expect.objectContaining({ type: 'seasonal', complete: true }));
    expect(getGroupRelations([...group.slice(0, 2), group[0]]).some((item) => item.type === 'seasonal')).toBe(false);
  });
  it.each(['寅巳申', '丑未戌'])('%s의 삼형은 세 글자가 필요하다', (group) => {
    expect(getGroupRelations([...group])).toContainEqual(expect.objectContaining({ type: 'triplePunishment', complete: true }));
    expect(getGroupRelations([...group.slice(0, 2), group[0]]).some((item) => item.type === 'triplePunishment')).toBe(false);
  });
  it('자형과 반복을 별도로 구분한다', () => {
    expect(getBranchRelations('午', '午').map((item) => item.type)).toEqual(['repeat', 'selfPunishment']);
    expect(getBranchRelations('子', '子').map((item) => item.type)).toEqual(['repeat']);
  });
});

describe('원국의 자리별 신호', () => {
  it('丁未가 은서에게 만드는 모든 관계를 검사한다', () => {
    const signals = analyzePersonSignals(PEOPLE[0], { stem: '丁', branch: '未' });
    expect(signals).toContainEqual(expect.objectContaining({ type: 'tenGod', tenGod: '정재' }));
    expect(signals).toContainEqual(expect.objectContaining({ type: 'stemCombination', position: 'day', label: '丁壬合' }));
    expect(signals).toContainEqual(expect.objectContaining({ type: 'partialTrine', position: 'month', label: '卯未 연결' }));
    expect(signals).toContainEqual(expect.objectContaining({ type: 'harm', position: 'day', label: '子未害' }));
    expect(signals).toContainEqual(expect.objectContaining({ type: 'clash', position: 'hour', label: '丑未冲' }));
    expect(signals).toContainEqual(expect.objectContaining({ type: 'triplePunishment', label: '丑未戌三刑' }));
  });
  it('하나는 시주를 사용하지 않으며 미상 표시가 있으면 우발적으로 입력된 시주도 제외한다', () => {
    const hana = { ...PEOPLE[1], pillars: { ...PEOPLE[1].pillars, hour: '壬辰' } };
    expect(getKnownPillars(hana).map((pillar) => pillar.position)).toEqual(['year', 'month', 'day']);
    expect(analyzePersonSignals(hana, { stem: '丁', branch: '未' }).some((signal) => signal.position === 'hour' || signal.positions?.includes('hour'))).toBe(false);
    expect(getKnownPillars({ ...hana, hourUnknown: false })).toHaveLength(4);
  });
  it('비중이 높은 신호 3개에 십성과 지지 근거를 함께 넣는다', () => {
    const selected = selectKeySignals(analyzePersonSignals(PEOPLE[0], { stem: '丁', branch: '未' }));
    expect(selected).toHaveLength(3);
    expect(selected.some((signal) => signal.type === 'tenGod')).toBe(true);
    expect(selected.some((signal) => signal.domain === 'branch')).toBe(true);
    expect(selected.some((signal) => signal.type === 'break')).toBe(false);
  });
  it('일지–일지, 월지–월지, 일지–월지 순으로 우선한다', () => {
    expect(getPairPositionWeight('day', 'day')).toBeGreaterThan(getPairPositionWeight('month', 'month'));
    expect(getPairPositionWeight('month', 'month')).toBeGreaterThan(getPairPositionWeight('day', 'month'));
    expect(getPairPositionWeight('day', 'month')).toBeGreaterThan(getPairPositionWeight('year', 'hour'));
  });
});
