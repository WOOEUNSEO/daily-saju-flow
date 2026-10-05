import { describe, expect, it } from 'vitest';
import { PEOPLE } from '../src/data.js';
import { generateDailySummary, generateMonthlySummary, generatePairSummary, generatePersonSummary } from '../src/interpretation.js';

const dingWei = { date: '2026-09-30', dayGanZhi: '丁未', stem: '丁', branch: '未' };

describe('날짜별 문장 생성', () => {
  it('같은 날짜는 같은 해석을 반환한다', () => {
    expect(generateDailySummary(dingWei)).toEqual(generateDailySummary(dingWei));
  });

  it('丁未의 두 십성과 년·월·일·시 지지 관계를 전체 컨디션에 반영한다', () => {
    const result = generateDailySummary(dingWei);
    expect(result.people.map((person) => person.tenGod)).toEqual(['정재', '정관']);
    for (const person of result.people) {
      expect(person.evidence.length).toBeLessThanOrEqual(3);
      expect(person.keySignals.some((signal) => signal.domain === 'branch')).toBe(true);
      expect(person.tags.length).toBeLessThanOrEqual(3);
      expect(person.sections).toEqual(expect.objectContaining({ state: expect.any(String), why: expect.any(String), people: expect.any(String), work: expect.any(String) }));
      expect(person.sections.state.length).toBeGreaterThan(10);
      expect(person.sections.people.length).toBeGreaterThan(10);
      expect(person.sections.work.length).toBeGreaterThan(10);
    }
    expect(result.people[0].sections.state).toMatch(/감정|생각|마음|현실/);
    expect(result.people[0].sections.why).toMatch(/辛|정인|현실|지지/);
    expect(result.people[1].sections.people).toMatch(/사적인|관계|대화/);
    expect(result.pair.sections).toEqual(expect.objectContaining({
      relationship: expect.any(String), conversation: expect.any(String), together: expect.any(String), work: expect.any(String),
    }));
    expect(result.pair.activations.find((item) => item.id === 'rabbit-goat').active).toBe(true);
  });

  it('10/10은 일진과 월운을 겹쳐 이해하기 쉬운 문장으로 설명한다', () => {
    const result = generateDailySummary({
      date: '2026-10-10', dayGanZhi: '丁巳', stem: '丁', branch: '巳',
      monthGanZhi: '戊戌', yearGanZhi: '丙午',
    });
    expect(result.people[0].comboLabel).toBe('정재 + 편재');
    expect(result.people[1].comboLabel).toBe('정관 + 편관');
    expect(result.people[0].sections.month).toMatch(/이번 달 戊戌|편관/);
    expect(result.people[1].sections.month).toMatch(/이번 달 戊戌|편인/);
    expect(result.people[0].sections.real).toMatch(/실제로는/);
    expect(result.pair.sections.month).toMatch(/이번 달 戊戌/);
    expect(result.pair.sections.relationship.length).toBeGreaterThan(80);
  });

  it('子와 午는 기본 子午 축과 하나 원국의 충을 함께 반영한다', () => {
    for (const branch of ['子', '午']) {
      const result = generateDailySummary({ date: `test-${branch}`, stem: '壬', branch });
      expect(result.pair.sections.relationship).toContain('하나 원국 안의 子午冲');
      expect(result.pair.tags).toContain('자극');
    }
  });

  it('두 사람의 실제 십성이 바뀌면 같은 지지에서도 둘의 문장이 바뀐다', () => {
    const first = generateDailySummary(dingWei).pair;
    const second = generateDailySummary({ ...dingWei, date: 'different', stem: '辛' }).pair;
    expect(first.sentences[0]).not.toBe(second.sentences[0]);
    expect(first.evidence).not.toEqual(second.evidence);
  });

  it('pair 계산은 전달받은 사람의 원국과 십성을 사용한다', () => {
    const altered = [PEOPLE[0], { ...PEOPLE[1], dayMaster: '甲', pillars: { year: '甲寅', month: '甲寅', day: '甲寅', hour: null } }];
    const result = generatePairSummary(altered, dingWei);
    expect(result.evidence).toContain('하나 丁=상관');
    expect(result.activations.some((activation) => activation.id === 'day-clash')).toBe(false);
  });

  it('해당 세 글자가 갖춰질 때만 월운 삼합 완성을 표시한다', () => {
    const result = generateMonthlySummary({ key: '2026-11', ganZhi: '己亥', stem: '己', branch: '亥' });
    expect(result.pair.activations.find((item) => item.id === 'rabbit-goat')).toMatchObject({ active: true, complete: true });
    expect(generateMonthlySummary({ key: '2026-07', stem: '乙', branch: '未' }).pair.activations.find((item) => item.id === 'rabbit-goat').complete).toBe(false);
  });

  it('월운도 전체 컨디션과 관계·대화·업무를 나눠 제공한다', () => {
    const result = generateMonthlySummary({ key: '2026-10', ganZhi: '戊戌', stem: '戊', branch: '戌', start: '2026-10-08', end: '2026-11-07' });
    for (const person of result.people) {
      expect(person.sentences.length).toBeGreaterThanOrEqual(3);
      expect(person.sentences.length).toBeLessThanOrEqual(5);
      expect(person.sections.core).toBeTruthy();
      expect(person.sections.state).toBeTruthy();
      expect(person.sections.people).toBeTruthy();
      expect(person.sections.work).toBeTruthy();
      expect(person.sections.caution).toBeTruthy();
    }
    expect(result.pair.sentences.length).toBeGreaterThanOrEqual(4);
    expect(result.pair.sentences.length).toBeLessThanOrEqual(6);
    expect(result.pair.sections.relationship).toBeTruthy();
    expect(result.pair.sections.conversation).toBeTruthy();
    expect(result.pair.sections.work).toBeTruthy();
    expect(result.pair.sections.dynamic).toBeTruthy();
    expect(result.pair.activations.map((item) => item.id)).toEqual(['day-clash', 'shared-rat', 'rat-ox', 'rabbit-goat', 'horse-dog']);
    expect(result.phases).toHaveLength(3);
    expect(result.phases.map((phase) => phase.label)).toEqual(['초반', '중반', '후반']);
    expect(result.phases.every((phase) => phase.people.length === 2 && phase.pair)).toBe(true);
  });

  it('60간지의 결과에 단정적 감정·예측·점수가 없다', () => {
    const stems = [...'甲乙丙丁戊己庚辛壬癸'];
    const branches = [...'子丑寅卯辰巳午未申酉戌亥'];
    for (let index = 0; index < 60; index += 1) {
      const result = generateDailySummary({ date: `cycle-${index}`, stem: stems[index % 10], branch: branches[index % 12] });
      for (const summary of [...result.people, result.pair]) {
        const content = [summary.headline, ...summary.sentences, ...summary.tags].join(' ');
        expect(content).not.toMatch(/오늘 싸운다|사랑이 깊어진다|은서를 좋아한다|상대가 질투|궁합이 나쁘|\d+점|undefined|NaN/);
        expect(summary.tags.length).toBeLessThanOrEqual(3);
      }
      expect(result.people[1].signals.some((signal) => signal.position === 'hour' || signal.positions?.includes('hour'))).toBe(false);
    }
  });

  it('같은 날짜에 실행 중 무작위 API를 필요로 하지 않는다', () => {
    expect(generatePersonSummary(PEOPLE[0], dingWei).headline).toEqual(generatePersonSummary(PEOPLE[0], dingWei).headline);
  });
});
