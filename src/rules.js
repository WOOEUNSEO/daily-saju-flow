import { PILLAR_LABELS } from './data.js';

export const STEMS = {
  甲: { element: '木', polarity: 'yang' }, 乙: { element: '木', polarity: 'yin' },
  丙: { element: '火', polarity: 'yang' }, 丁: { element: '火', polarity: 'yin' },
  戊: { element: '土', polarity: 'yang' }, 己: { element: '土', polarity: 'yin' },
  庚: { element: '金', polarity: 'yang' }, 辛: { element: '金', polarity: 'yin' },
  壬: { element: '水', polarity: 'yang' }, 癸: { element: '水', polarity: 'yin' },
};
export const BRANCH_MAIN_STEM = { 子: '癸', 丑: '己', 寅: '甲', 卯: '乙', 辰: '戊', 巳: '丙', 午: '丁', 未: '己', 申: '庚', 酉: '辛', 戌: '戊', 亥: '壬' };
const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CONTROLS = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };
export const POSITION_WEIGHTS = { day: 5, month: 4, year: 1.8, hour: 1.5 };
const STEM_COMBINATIONS = ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'];
const BRANCH_PAIRS = {
  combination: ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'],
  clash: ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'],
  harm: ['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌'],
  punishment: ['子卯'],
  break: ['子酉', '丑辰', '寅亥', '卯午', '巳申', '未戌'],
};
export const BRANCH_GROUPS = {
  trine: ['申子辰', '亥卯未', '寅午戌', '巳酉丑'],
  seasonal: ['寅卯辰', '巳午未', '申酉戌', '亥子丑'],
  triplePunishment: ['寅巳申', '丑未戌'],
};
const RELATION_META = {
  combination: { suffix: '六合', weight: 3.4, tone: 'support', keyword: '협력' },
  clash: { suffix: '冲', weight: 4, tone: 'friction', keyword: '조율' },
  harm: { suffix: '害', weight: 2.8, tone: 'friction', keyword: '확인' },
  punishment: { suffix: '刑', weight: 3, tone: 'friction', keyword: '기준' },
  break: { suffix: '破', weight: 0.3, tone: 'adjustment', keyword: '정리' },
  selfPunishment: { suffix: '自刑', weight: 2.2, tone: 'friction', keyword: '여유' },
  repeat: { suffix: ' 반복', weight: 2.3, tone: 'neutral', keyword: '집중' },
  partialTrine: { suffix: ' 연결', weight: 2.6, tone: 'support', keyword: '소통' },
  trine: { suffix: '三合', weight: 6, tone: 'support', keyword: '협력' },
  seasonal: { suffix: '三會', weight: 5.8, tone: 'support', keyword: '활동' },
  triplePunishment: { suffix: '三刑', weight: 5.5, tone: 'friction', keyword: '기준' },
};

function requireStem(value) {
  if (!STEMS[value]) throw new RangeError(`알 수 없는 천간: ${value}`);
  return STEMS[value];
}

export function getTenGod(dayMaster, targetStem) {
  const me = requireStem(dayMaster);
  const other = requireStem(targetStem);
  const same = me.polarity === other.polarity;
  if (me.element === other.element) return same ? '비견' : '겁재';
  if (GENERATES[me.element] === other.element) return same ? '식신' : '상관';
  if (CONTROLS[me.element] === other.element) return same ? '편재' : '정재';
  if (CONTROLS[other.element] === me.element) return same ? '편관' : '정관';
  return same ? '편인' : '정인';
}

export function getBranchTenGod(dayMaster, branch) {
  const mainStem = BRANCH_MAIN_STEM[branch];
  if (!mainStem) throw new RangeError(`알 수 없는 지지: ${branch}`);
  return { branch, mainStem, tenGod: getTenGod(dayMaster, mainStem) };
}

export function getStemRelations(source, target) {
  const a = requireStem(source);
  const b = requireStem(target);
  const relations = [];
  const combination = STEM_COMBINATIONS.find((pair) => source !== target && pair.includes(source) && pair.includes(target));
  if (combination) relations.push({ type: 'stemCombination', label: `${combination}合`, weight: 4.5, tone: 'support', keyword: '정리' });
  if (a.element === b.element) {
    relations.push({ type: 'stemPeer', label: `${source}·${target} ${a.element} 동행`, weight: 0.8, tone: 'neutral', keyword: '기준' });
  } else if (GENERATES[a.element] === b.element) {
    relations.push({ type: 'stemGenerates', label: `${source}→${target} ${a.element}生${b.element}`, weight: 1.3, tone: 'support', keyword: '완충' });
  } else if (GENERATES[b.element] === a.element) {
    relations.push({ type: 'stemReceives', label: `${target}→${source} ${b.element}生${a.element}`, weight: 1.3, tone: 'neutral', keyword: '표현' });
  } else if (CONTROLS[a.element] === b.element) {
    relations.push({ type: 'stemControls', label: `${source}→${target} ${a.element}剋${b.element}`, weight: 1.6, tone: 'friction', keyword: '기준' });
  } else {
    relations.push({ type: 'stemControlled', label: `${target}→${source} ${b.element}剋${a.element}`, weight: 1.6, tone: 'neutral', keyword: '현실' });
  }
  return relations;
}

function relation(type, characters, extra = {}) {
  const meta = RELATION_META[type];
  return { type, characters, label: `${characters}${meta.suffix}`, ...meta, ...extra };
}

export function getBranchRelations(a, b) {
  if (!'子丑寅卯辰巳午未申酉戌亥'.includes(a) || !'子丑寅卯辰巳午未申酉戌亥'.includes(b) || a.length !== 1 || b.length !== 1) {
    throw new RangeError(`알 수 없는 지지: ${a}, ${b}`);
  }
  if (a === b) {
    const repeated = [relation('repeat', a)];
    if ('辰午酉亥'.includes(a)) repeated.push(relation('selfPunishment', `${a}${b}`));
    return repeated;
  }
  const relations = [];
  for (const [type, pairs] of Object.entries(BRANCH_PAIRS)) {
    const pair = pairs.find((characters) => characters.includes(a) && characters.includes(b));
    if (pair) relations.push(relation(type, pair));
  }
  for (const group of BRANCH_GROUPS.trine) {
    if (group.includes(a) && group.includes(b)) {
      const characters = [...group].filter((branch) => branch === a || branch === b).join('');
      relations.push(relation('partialTrine', characters, { group, explanation: `${group} 삼합의 두 글자 연결 · 반합으로 보는 전통이 있음` }));
    }
  }
  return relations;
}

export function getGroupRelations(branches, { includePartial = true } = {}) {
  const unique = new Set(branches);
  const results = [];
  for (const [type, groups] of Object.entries(BRANCH_GROUPS)) {
    for (const group of groups) {
      const present = [...group].filter((branch) => unique.has(branch));
      if (present.length === 3) results.push(relation(type, group, { group, complete: true }));
      else if (includePartial && type === 'trine' && present.length === 2) {
        results.push(relation('partialTrine', present.join(''), { group, complete: false, explanation: `${group} 삼합의 두 글자 연결 · 반합으로 보는 전통이 있음` }));
      }
    }
  }
  return results;
}

export function getKnownPillars(person) {
  return Object.entries(person.pillars)
    .filter(([position, pillar]) => pillar && !(position === 'hour' && person.hourUnknown))
    .map(([position, pillar]) => ({ position, stem: pillar[0], branch: pillar[1] }));
}

export function compareSignals(a, b) {
  return b.weight - a.weight || a.id.localeCompare(b.id, 'en');
}

export function analyzePersonSignals(person, flow) {
  const pillars = getKnownPillars(person);
  const tenGod = getTenGod(person.dayMaster, flow.stem);
  const signals = [{ id: 'tenGod', type: 'tenGod', domain: 'tenGod', tenGod, label: `${flow.stem}=${tenGod}`, keyword: tenGod, weight: 8, tone: 'neutral', evidence: `${flow.stem} = ${person.dayMaster} 기준 ${tenGod}` }];
  for (const pillar of pillars) {
    const positionLabel = PILLAR_LABELS[pillar.position];
    for (const item of getStemRelations(flow.stem, pillar.stem)) {
      signals.push({ ...item, id: `stem:${pillar.position}:${item.type}`, domain: 'stem', position: pillar.position, natalStem: pillar.stem, weight: item.weight + POSITION_WEIGHTS[pillar.position], evidence: `${item.label} · ${person.name} ${positionLabel} 천간` });
    }
    for (const item of getBranchRelations(flow.branch, pillar.branch)) {
      // 破 is always a secondary cue, even at the day branch.
      const weight = item.type === 'break' ? 0.3 + POSITION_WEIGHTS[pillar.position] * 0.1 : item.weight + POSITION_WEIGHTS[pillar.position];
      signals.push({ ...item, id: `branch:${pillar.position}:${item.type}`, domain: 'branch', position: pillar.position, natalBranch: pillar.branch, weight, evidence: `${item.label} · ${person.name} ${positionLabel} 지지${item.type === 'break' ? ' · 유파 차이로 낮게 반영' : ''}` });
    }
  }
  const natalBranches = pillars.map((pillar) => pillar.branch);
  const activeGroups = getGroupRelations([...natalBranches, flow.branch], { includePartial: false }).filter((item) => item.characters.includes(flow.branch));
  for (const item of activeGroups) {
    const positions = pillars.filter((pillar) => item.characters.includes(pillar.branch)).map((pillar) => pillar.position);
    const alreadyComplete = getGroupRelations(natalBranches, { includePartial: false }).some((natal) => natal.label === item.label);
    signals.push({ ...item, id: `group:${item.type}:${item.characters}`, domain: 'branch', positions, weight: item.weight + Math.max(...positions.map((position) => POSITION_WEIGHTS[position])), alreadyComplete, evidence: `${item.label} · ${alreadyComplete ? '원국 구성 재자극' : `${flow.branch}가 더해져 세 글자 완성`} · ${positions.map((position) => PILLAR_LABELS[position]).join('·')}` });
  }
  return signals.sort(compareSignals);
}

export function selectKeySignals(signals, limit = 3) {
  const tenGod = signals.find((signal) => signal.type === 'tenGod');
  const branches = signals.filter((signal) => signal.domain === 'branch' && signal.type !== 'break');
  const selected = [tenGod, branches[0]].filter(Boolean);
  for (const signal of signals) {
    if (selected.length >= limit) break;
    if (selected.some((item) => item.id === signal.id || item.label === signal.label)) continue;
    // A complete group supersedes its two-character subset in the short summary.
    if (signal.type === 'partialTrine' && selected.some((item) => item.type === 'trine' && item.group === signal.group)) continue;
    selected.push(signal);
  }
  return selected.sort(compareSignals);
}

export function getPairPositionWeight(a, b) {
  if (a === 'day' && b === 'day') return 10;
  if (a === 'month' && b === 'month') return 9;
  if ([a, b].includes('day') && [a, b].includes('month')) return 8;
  return (POSITION_WEIGHTS[a] + POSITION_WEIGHTS[b]) / 2;
}
