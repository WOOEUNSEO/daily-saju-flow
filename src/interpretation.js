import { PEOPLE } from './data.js';
import { analyzePersonSignals, getKnownPillars, getGroupRelations, selectKeySignals } from './rules.js';

const TEN_GOD_COPY = {
  비견: { keywords: ['기준', '집중'], focus: '자신의 기준', headline: ['자신의 속도를 확인하는 흐름', '익숙한 기준부터 살펴보기'], condition: ['스스로 정한 순서에 집중하기 쉬울 수 있습니다.', '자기 속도로 일을 정리하고 싶은 경향이 드러날 수 있습니다.'], relationships: '인간관계에서는 각자의 방식이 다를 수 있음을 먼저 확인하는 편이 자연스럽습니다.', thought: '생각을 정리할 때 내 기준과 상대의 기준을 구분해 볼 수 있습니다.' },
  겁재: { keywords: ['소통', '조율'], focus: '함께 하는 일의 경계', headline: ['각자의 몫을 나누는 흐름', '함께 할 일의 경계 살피기'], condition: ['주변의 움직임을 의식하며 속도를 맞추려는 경향이 생길 수 있습니다.', '함께 처리할 일과 개인의 몫을 나눠 보고 싶어질 수 있습니다.'], relationships: '인간관계에서는 협력할 범위와 서로 맡을 일을 구체적으로 확인하는 편이 편할 수 있습니다.', thought: '비교하는 생각이 길어진다면 자신의 목표로 시선을 돌려볼 수 있습니다.' },
  식신: { keywords: ['활동', '소통'], focus: '실행과 설명', headline: ['관찰한 것을 행동으로 옮기는 흐름', '작은 실행으로 생각 정리하기'], condition: ['알고 있는 것을 설명하거나 실제로 해보려는 흐름이 나타날 수 있습니다.', '작은 결과를 직접 확인하면서 생각을 정리하기 쉬울 수 있습니다.'], relationships: '인간관계에서는 알려주거나 함께 해보는 방식이 소통의 접점이 될 수 있습니다.', thought: '생각을 오래 품기보다 간단한 말이나 작은 결과로 꺼내 볼 수 있습니다.' },
  상관: { keywords: ['표현', '정리'], focus: '표현과 개선', headline: ['생각을 간결하게 꺼내는 흐름', '바꾸고 싶은 부분을 정리하기'], condition: ['평소와 다른 방법이나 개선할 부분에 시선이 갈 수 있습니다.', '관찰한 차이를 말이나 행동으로 표현하고 싶어질 수 있습니다.'], relationships: '인간관계에서는 제안과 평가가 다르게 들릴 수 있어 의도를 짧게 덧붙이면 편할 수 있습니다.', thought: '떠오르는 생각을 모두 펼치기보다 핵심 한 가지부터 정리해 볼 수 있습니다.' },
  편재: { keywords: ['현실적', '활동'], focus: '넓은 상황과 실행', headline: ['넓게 보고 한 가지씩 움직이는 흐름', '눈앞의 상황에 유연하게 대응하기'], condition: ['주변의 여러 일과 변화에 시선이 넓어질 수 있습니다.', '상황을 보고 필요한 일을 바로 처리하려는 흐름이 나타날 수 있습니다.'], relationships: '인간관계에서는 다양한 요청을 한꺼번에 맡기보다 가능한 범위를 먼저 나누는 편이 편할 수 있습니다.', thought: '여러 가능성을 보되 지금 처리할 한 가지를 먼저 골라 볼 수 있습니다.' },
  정재: { keywords: ['현실적', '정리'], focus: '현실적인 정리', headline: ['생각을 현실적인 결론으로 정리하기', '지금 할 일을 담백하게 살피는 흐름'], condition: ['지금 해야 할 일과 구체적인 순서를 정리하기 쉬울 수 있습니다.', '여러 의미를 덧붙이기보다 확인할 수 있는 사실에 시선이 갈 수 있습니다.'], relationships: '인간관계에서는 구체적인 약속과 역할을 짧게 확인하는 방식이 편할 수 있습니다.', thought: '생각이 길어질 때는 바로 할 수 있는 작은 일로 결론을 내려 볼 수 있습니다.' },
  편관: { keywords: ['집중', '업무'], focus: '해야 할 일과 대응', headline: ['우선순위를 좁혀 움직이는 흐름', '책임과 자신의 속도를 함께 살피기'], condition: ['해야 할 일과 대응할 과제가 더 선명하게 느껴질 수 있습니다.', '책임을 의식하며 빠르게 정리하려는 흐름이 나타날 수 있습니다.'], relationships: '인간관계에서는 요청의 우선순위와 가능한 속도를 함께 말하는 편이 도움이 될 수 있습니다.', thought: '모든 일을 한꺼번에 결론 내리기보다 필요한 판단부터 나눠 볼 수 있습니다.' },
  정관: { keywords: ['업무', '기준'], focus: '역할과 기준', headline: ['일의 기준을 차분히 맞추는 흐름', '맡은 역할을 선명하게 정리하기'], condition: ['역할과 책임, 일의 순서가 평소보다 또렷하게 느껴질 수 있습니다.', '정해진 기준 안에서 일을 안정적으로 마무리하려는 흐름이 나타날 수 있습니다.'], relationships: '인간관계에서는 서로 기대하는 역할과 완료 기준을 확인하는 편이 자연스럽습니다.', thought: '정답을 서두르기보다 지금 필요한 기준이 무엇인지 구분해 볼 수 있습니다.' },
  편인: { keywords: ['관찰', '정리'], focus: '관찰과 새로운 해석', headline: ['관찰한 것에 여백을 두는 흐름', '새로운 해석을 잠시 정리해 보기'], condition: ['세부적인 신호를 관찰하고 다른 의미를 떠올리기 쉬울 수 있습니다.', '익숙한 상황을 새로운 각도에서 살펴보고 싶어질 수 있습니다.'], relationships: '인간관계에서는 짐작한 의미와 실제로 들은 말을 구분해 확인하는 편이 편할 수 있습니다.', thought: '해석이 넓어질 때는 확인된 사실을 먼저 적어 생각에 여백을 둘 수 있습니다.' },
  정인: { keywords: ['차분', '관찰'], focus: '이해와 맥락', headline: ['맥락을 이해하고 차분히 정리하기', '익숙한 지식으로 흐름을 살피기'], condition: ['알고 있는 맥락을 되짚으며 차분히 이해하려는 흐름이 나타날 수 있습니다.', '서두르기보다 내용을 충분히 파악하고 싶은 경향이 드러날 수 있습니다.'], relationships: '인간관계에서는 설명을 듣고 필요한 부분만 다시 확인하는 방식이 편할 수 있습니다.', thought: '이해를 넓히는 시간과 결론을 내리는 시간을 나누어 볼 수 있습니다.' },
};

function stableIndex(key, length) {
  let hash = 2166136261;
  for (const character of String(key)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) % length;
}

function choose(variants, key) {
  return variants[stableIndex(key, variants.length)];
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function flowKey(flow) {
  return flow.date || flow.key || `${flow.ganZhi || flow.dayGanZhi}:${flow.start || ''}`;
}

function location(signal) {
  if (signal.position === 'day' || signal.positions?.includes('day')) return '가까운 관계와 자연스러운 반응에서';
  if (signal.position === 'month' || signal.positions?.includes('month')) return '업무와 사람을 대하는 방식에서';
  if (signal.position === 'year') return '주변 상황이나 익숙한 배경을 살필 때';
  return '일을 마무리하거나 세부 계획을 맞출 때';
}

function branchSentence(signal, key) {
  if (!signal) return '원국과의 지지 관계에서는 특정한 연결보다 평소의 속도를 살피는 편이 자연스럽습니다.';
  const place = location(signal);
  const copy = {
    combination: [`${place} 역할을 맞추고 협력할 접점이 생기기 쉬울 수 있습니다.`, `${place} 구체적인 순서를 함께 정하면 안정감을 느끼는 데 도움이 될 수 있습니다.`],
    partialTrine: [`${place} 생각을 표현하거나 함께 움직이는 연결이 드러날 수 있습니다.`, `${place} 공통으로 할 수 있는 일을 찾아 소통하기 쉬울 수 있습니다.`],
    trine: [`${place} 흩어진 관심이 한 방향으로 모이는 경향을 읽을 수 있습니다.`],
    seasonal: [`${place} 비슷한 방향의 움직임이 모여 활동의 리듬이 또렷해질 수 있습니다.`],
    clash: [`${place} 반응 속도나 처리 순서의 차이가 더 크게 느껴질 수 있습니다.`, `${place} 평소의 순서를 조정하고 싶어질 수 있어 결론을 서두르지 않는 편이 편할 수 있습니다.`],
    harm: [`${place} 생략된 말의 의미를 오래 해석하기보다 직접 확인하는 편이 편할 수 있습니다.`, `${place} 서로 말하지 않은 기대가 다를 수 있어 짧게 확인해 볼 수 있습니다.`],
    punishment: [`${place} 당연하게 여기는 기준이 다를 수 있어 기대를 말로 나눠 볼 수 있습니다.`],
    triplePunishment: [`${place} 책임의 범위와 세부 기준을 구체적으로 나누는 편이 편할 수 있습니다.`],
    selfPunishment: [`${place} 같은 생각을 거듭 확인하기 쉬울 수 있어 잠시 간격을 두어 볼 수 있습니다.`],
    repeat: [`${place} 익숙한 반응이 또렷해질 수 있어 자신의 속도를 한 번 살펴볼 수 있습니다.`],
    break: [`${place} 작은 순서 조정을 생각해 볼 수 있으나 비중은 낮게 읽습니다.`],
  };
  return choose(copy[signal.type] || copy.repeat, key);
}

function stemSentence(signal, person) {
  if (signal.type === 'stemCombination') {
    return person.id === 'eunseo'
      ? '관찰하고 해석한 생각을 구체적인 말이나 결론으로 묶어 보기 쉬울 수 있습니다.'
      : '자신의 판단과 주변의 요구를 한 가지 실행 순서로 맞춰 보기 쉬울 수 있습니다.';
  }
  if (signal.type === 'stemControls') return '해야 할 기준을 의식하기 쉬울 수 있어 자신의 처리 속도도 함께 살펴볼 수 있습니다.';
  if (signal.type === 'stemGenerates') return '새로 이해한 내용이나 도움을 자신의 방식으로 정리하는 접점이 될 수 있습니다.';
  if (signal.type === 'stemReceives') return '안에서 정리한 생각을 설명이나 작은 행동으로 옮겨 볼 수 있습니다.';
  if (signal.type === 'stemControlled') return '상황을 구체적으로 다루고 필요한 부분부터 정리해 볼 수 있습니다.';
  return '익숙한 판단 기준이 또렷해질 수 있어 다른 방식도 함께 살펴볼 수 있습니다.';
}

export function generatePersonSummary(person, flow, { monthly = false } = {}) {
  const signals = analyzePersonSignals(person, flow);
  const keySignals = selectKeySignals(signals);
  const tenGod = signals.find((signal) => signal.type === 'tenGod').tenGod;
  const copy = TEN_GOD_COPY[tenGod];
  const seed = `${flowKey(flow)}:${person.id}:${monthly ? 'month' : 'day'}`;
  const primaryBranch = keySignals.find((signal) => signal.domain === 'branch');
  const condition = choose(copy.condition, `${seed}:condition`);
  const relationships = branchSentence(primaryBranch, `${seed}:branch`);
  const thought = person.id === 'eunseo' && ['편인', '정인'].includes(tenGod)
    ? '원국의 두 辛 정인과 함께 관찰과 해석에 관심이 모일 수 있어, 확인된 사실과 떠오른 생각을 나누어 볼 수 있습니다.'
    : person.id === 'hana' && ['子', '午'].includes(flow.branch)
      ? '원국의 子午冲도 함께 자극되므로 업무에서의 판단과 개인적인 반응을 같은 속도로 결론 내리지 않아도 자연스럽습니다.'
      : copy.thought;
  const additional = keySignals.find((signal) => signal.domain !== 'tenGod' && signal.id !== primaryBranch?.id);
  const third = additional?.domain === 'stem' ? stemSentence(additional, person) : additional ? branchSentence(additional, `${seed}:secondary`) : copy.relationships;
  const sentences = monthly ? [condition, relationships, copy.relationships, thought] : unique([condition, relationships, third]);
  return {
    id: person.id, name: person.name, tenGod,
    headline: choose(copy.headline, `${seed}:headline`),
    sentences,
    tags: unique([primaryBranch?.keyword, ...copy.keywords]).slice(0, 3),
    evidence: keySignals.map((signal) => signal.evidence),
    signals, keySignals, condition, relationships, thought,
    rationale: '일지, 월지, 년지, 시지 순으로 자리의 비중을 두고 십성과 주요 지지 관계를 포함한 2~3개 근거를 골랐습니다. 破는 낮게 반영합니다.',
  };
}

function pairActivations(people, flow) {
  const branches = people.flatMap((person) => getKnownPillars(person).map((pillar) => pillar.branch));
  const known = new Set(branches);
  const completed = getGroupRelations([...branches, flow.branch], { includePartial: false });
  const entries = [
    { id: 'day-clash', label: '子午冲', involved: ['子', '午'], required: ['子', '午'], text: '가까운 사이의 반응 속도 차이를 더 의식할 수 있습니다.', quiet: '가까운 사이의 반응 속도 차이는 기본 배경으로 남아 있습니다.' },
    { id: 'shared-rat', label: '子子 공통점', involved: ['子', '丑', '申', '辰'], required: ['子'], text: '업무에서 상황을 함께 읽는 공통점을 활용해 볼 수 있습니다.', quiet: '상황 파악의 공통점은 유지되며 이번 지지가 직접 강조하는 연결은 아닙니다.' },
    { id: 'rat-ox', label: '子丑合', involved: ['子', '丑'], required: ['子', '丑'], text: '역할과 마무리 순서를 맞추는 실질적인 협력을 살려 볼 수 있습니다.', quiet: '실질적인 협력의 접점은 배경에 남으며 이번 지지가 직접 반복하지는 않습니다.' },
    { id: 'rabbit-goat', label: '卯未 연결', involved: ['亥', '卯', '未'], required: ['卯', '未'], group: '亥卯未', text: '함께 배우거나 생각을 나누는 부드러운 연결을 활용해 볼 수 있습니다.', quiet: '성장과 협력의 두 글자 연결은 배경으로 읽습니다.' },
    { id: 'horse-dog', label: '午戌 연결', involved: ['寅', '午', '戌'], required: ['午', '戌'], group: '寅午戌', text: '함께 행동하고 문제를 처리하는 접점이 드러날 수 있습니다.', quiet: '함께 움직이는 두 글자 연결은 배경으로 읽습니다.' },
  ];
  return entries.filter((entry) => entry.required.every((branch) => known.has(branch))).map((entry) => {
    const active = entry.involved.includes(flow.branch);
    const complete = active && entry.group && completed.some((group) => group.type === 'trine' && group.group === entry.group);
    return {
      id: entry.id, label: entry.label, active, complete: Boolean(complete),
      state: complete ? '세 글자 구성' : active ? '활성' : '기본 배경',
      text: complete ? `${entry.group}의 서로 다른 세 글자가 모여 ${entry.text}` : active ? entry.text : entry.quiet,
      evidence: `${entry.label} · ${flow.branch}${complete ? `가 더해져 ${entry.group} 삼합 구성` : active ? '에 의해 관련 연결 자극' : '의 직접 활성 없음'}`,
    };
  });
}

export function generatePairSummary(people, flow, { monthly = false, summaries } = {}) {
  const individual = summaries || people.map((person) => generatePersonSummary(person, flow, { monthly }));
  const [first, second] = individual;
  const activations = pairActivations(people, flow);
  const axis = activations.find((entry) => entry.id === 'day-clash')?.active;
  const supporters = individual.map((summary) => summary.signals.filter((signal) => signal.domain === 'branch' && signal.tone === 'support'));
  const tensions = individual.map((summary) => summary.signals.filter((signal) => signal.domain === 'branch' && signal.tone === 'friction' && signal.type !== 'break'));
  const bothSupport = supporters.every((list) => list.length > 0);
  const dominantTension = tensions.map((list) => list[0]);
  const asymmetric = Boolean(dominantTension[0]) !== Boolean(dominantTension[1]) || Math.abs((dominantTension[0]?.weight || 0) - (dominantTension[1]?.weight || 0)) >= 2;
  const activeSupport = activations.filter((entry) => entry.active && entry.id !== 'day-clash');
  const periodWord = monthly ? '이번 절기 구간에' : '오늘';
  const focus = `${periodWord} ${first.name}는 ${TEN_GOD_COPY[first.tenGod].focus}에, ${second.name}는 ${TEN_GOD_COPY[second.tenGod].focus}에 관심이 모일 수 있습니다.`;
  let headline;
  let interaction;
  let guidance;
  if (axis) {
    headline = '일은 명확하게, 반응에는 한 박자 여유';
    interaction = '두 사람의 일지 子午 축과 하나 원국의 子午冲이 함께 자극되어, 같은 말을 받아들이는 속도가 다르게 느껴질 수 있습니다.';
    guidance = '업무는 짧고 명확하게 확인하고 사적인 대화에서는 결론을 서두르지 않는 편이 편할 수 있습니다.';
  } else if (bothSupport) {
    headline = '함께 할 일부터 차분히 맞추기';
    interaction = '각자의 원국에 연결을 만드는 지지가 있어 함께 할 일을 구체적으로 나눌 때 협력의 접점을 찾기 쉬울 수 있습니다.';
    guidance = tensions.some((list) => list.length)
      ? '협력의 접점과 기대의 차이가 함께 있으므로, 짧은 말의 의미를 짐작하기보다 필요한 내용을 확인하는 편이 편할 수 있습니다.'
      : '같은 상황에서 확인한 사실을 나누고 각자의 속도를 존중하는 방식이 편할 수 있습니다.';
  } else if (asymmetric) {
    const moreTension = (dominantTension[0]?.weight || 0) > (dominantTension[1]?.weight || 0) ? first : second;
    headline = '서로의 처리 속도를 먼저 확인하기';
    interaction = `${moreTension.name} 쪽에는 기대나 반응을 조율하는 신호가 상대적으로 더해져, 같은 상황의 체감이 다를 수 있습니다.`;
    guidance = '요청하는 내용과 가능한 속도를 함께 말하고 상대의 반응에 곧바로 의미를 붙이지 않는 편이 편할 수 있습니다.';
  } else {
    headline = '각자의 기준을 짧게 나누는 흐름';
    interaction = '각자의 십성과 원국에 닿는 지지 관계가 달라, 일의 우선순위를 먼저 맞추는 것이 소통의 접점이 될 수 있습니다.';
    guidance = '말하지 않은 기대를 덧붙이기보다 역할과 완료 기준을 짧게 나눠 볼 수 있습니다.';
  }
  const activationText = activeSupport[0]?.text || '평소의 업무 공통점과 협력 접점은 배경에 남아 있어, 이번 흐름 하나로 관계를 결론 내리지 않는 편이 자연스럽습니다.';
  const axisContext = axis
    ? '업무 상황을 함께 읽는 子의 공통점도 남아 있으므로, 반응 속도의 차이와 실제 협력 가능성을 나누어 살펴볼 수 있습니다.'
    : '기본적인 子午의 반응 차이는 남아 있지만 이번 지지가 그 축을 직접 반복하는 구간은 아닙니다.';
  const sentences = monthly ? [focus, interaction, activationText, axisContext, guidance] : [focus, interaction, guidance];
  const evidence = unique([
    `${first.name} ${flow.stem}=${first.tenGod}`, `${second.name} ${flow.stem}=${second.tenGod}`,
    ...individual.map((summary) => summary.keySignals.find((signal) => signal.domain === 'branch')?.evidence),
    ...activations.filter((entry) => entry.active).map((entry) => entry.evidence),
  ]);
  return {
    id: 'pair', name: '둘의 흐름', headline, sentences,
    tags: unique([axis ? '자극' : bothSupport ? '완충' : '조율', '업무', tensions.some((list) => list.length) ? '확인' : '소통']).slice(0, 3),
    evidence, activations,
    signals: individual.flatMap((summary) => summary.signals.map((signal) => ({ ...signal, personId: summary.id }))),
    rationale: '두 사람의 실제 십성·지지 신호를 함께 비교합니다. 연결과 긴장이 함께 있으면 둘 다 반영하며, 연결이 기존 충을 없앤다고 해석하지 않습니다.',
  };
}

export function generateDailySummary(dayInfo) {
  const people = PEOPLE.map((person) => generatePersonSummary(person, dayInfo));
  return { people, pair: generatePairSummary(PEOPLE, dayInfo, { summaries: people }) };
}

export function generateMonthlySummary(period) {
  const people = PEOPLE.map((person) => generatePersonSummary(person, period, { monthly: true }));
  return { people, pair: generatePairSummary(PEOPLE, period, { monthly: true, summaries: people }) };
}
