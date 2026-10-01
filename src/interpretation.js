import { PEOPLE } from './data.js';
import { analyzePersonSignals, getKnownPillars, getGroupRelations, selectKeySignals } from './rules.js';

const TEN_GOD_COPY = {
  비견: {
    keywords: ['자기리듬', '집중'], focus: '자신의 기준과 속도',
    headline: ['내 속도가 또렷해지는 흐름', '익숙한 기준으로 하루를 정리하기'],
    condition: ['자기 리듬과 기준이 평소보다 또렷해져 혼자 생각을 정리하고 싶어질 수 있습니다.', '주변보다 자신의 컨디션과 순서를 먼저 확인하고 싶은 경향이 드러날 수 있습니다.'],
    social: '사적인 관계에서는 상대에게 맞추기보다 각자의 방식이 다름을 인정할 때 편안할 수 있습니다.',
    work: '일에서는 익숙한 방식으로 집중하기 좋지만, 다른 사람의 속도와 맞출 부분은 짧게 확인하는 편이 좋습니다.',
    thought: '생각을 정리할 때 내 기준과 상대의 기준을 분리해 보면 감정 소모를 줄이기 쉽습니다.',
  },
  겁재: {
    keywords: ['주변의식', '조율'], focus: '주변과 내 속도의 차이',
    headline: ['주변의 움직임을 더 의식하는 날', '내 몫과 상대의 몫을 나누어 보기'],
    condition: ['주변 사람의 움직임이나 반응이 평소보다 눈에 들어와 내 속도와 비교하기 쉬울 수 있습니다.', '혼자 결정하기보다 주변 상황을 보며 속도를 조절하고 싶어질 수 있습니다.'],
    social: '사적인 대화에서는 상대의 반응을 지나치게 기준 삼기보다 각자 원하는 바를 짧게 나누는 편이 편할 수 있습니다.',
    work: '일에서는 역할이 겹치거나 속도가 달라질 때 누가 무엇을 맡는지 분명히 하면 흐름이 정리되기 쉽습니다.',
    thought: '비교하는 생각이 길어진다면 지금 내가 원하는 것과 해야 할 일을 따로 적어 보는 편이 좋습니다.',
  },
  식신: {
    keywords: ['표현', '여유'], focus: '표현과 자연스러운 실행',
    headline: ['생각을 밖으로 풀어내기 좋은 흐름', '말과 행동이 자연스럽게 이어지는 날'],
    condition: ['머릿속에 있던 것을 말이나 행동으로 가볍게 꺼내면서 마음이 정리되기 쉬울 수 있습니다.', '작은 즐거움이나 익숙한 활동을 통해 긴장을 풀고 싶어질 수 있습니다.'],
    social: '사적인 관계에서는 설명하거나 반응을 주고받는 과정 자체가 편안하게 느껴질 수 있습니다.',
    work: '일에서는 알고 있는 것을 직접 해보거나 누군가에게 설명하면서 결과를 만들기 좋습니다.',
    thought: '생각을 오래 품기보다 간단한 말이나 작은 행동으로 꺼내 보면 흐름이 가벼워질 수 있습니다.',
  },
  상관: {
    keywords: ['표현', '민감'], focus: '차이를 알아차리고 표현하는 일',
    headline: ['평소와 다른 점이 잘 보이는 흐름', '하고 싶은 말이 선명해질 수 있는 날'],
    condition: ['평소 그냥 넘기던 차이나 불편함이 더 또렷하게 보이고 바꾸고 싶은 마음이 생길 수 있습니다.', '생각이 빠르게 이어지며 자신의 관점을 밖으로 표현하고 싶어질 수 있습니다.'],
    social: '사적인 대화에서는 솔직함이 장점이 되지만, 상대가 받아들일 여지를 남겨 두면 더 편하게 이어질 수 있습니다.',
    work: '일에서는 비효율이나 개선점을 빨리 발견하기 쉬워 한 가지씩 제안하면 도움이 될 수 있습니다.',
    thought: '떠오르는 생각을 모두 펼치기보다 지금 가장 중요한 한 가지부터 정리해 보는 편이 좋습니다.',
  },
  편재: {
    keywords: ['활동', '유연함'], focus: '외부 상황과 즉각적인 대응',
    headline: ['주변 변화에 가볍게 반응하는 흐름', '넓게 보고 움직이기 쉬운 날'],
    condition: ['주변에서 들어오는 자극과 변화에 시선이 넓어지고 몸을 움직이고 싶어질 수 있습니다.', '한 가지 생각에 오래 머물기보다 눈앞의 상황에 맞춰 유연하게 넘어가기 쉬울 수 있습니다.'],
    social: '사적인 관계에서는 가벼운 대화나 즉흥적인 약속처럼 부담이 적은 교류가 자연스러울 수 있습니다.',
    work: '일에서는 여러 상황을 동시에 보게 될 수 있으니 지금 처리할 우선순위를 한 번씩 좁히는 편이 좋습니다.',
    thought: '가능성을 넓게 보되 지금 실제로 할 수 있는 한 가지를 먼저 고르면 마음이 산만해지는 것을 줄일 수 있습니다.',
  },
  정재: {
    keywords: ['담백함', '현실적'], focus: '현실적인 정리와 안정',
    headline: ['생각을 현실적인 결론으로 정리하기', '지금의 상태를 담백하게 받아들이는 흐름'],
    condition: ['여러 의미를 덧붙이기보다 지금 확인되는 사실과 실제 컨디션에 시선이 가기 쉬울 수 있습니다.', '감정을 크게 확장하기보다 지금 필요한 것과 아닌 것을 구분하며 마음이 단순해질 수 있습니다.'],
    social: '사적인 관계에서도 상대의 말에 숨은 의미를 길게 추측하기보다 실제로 주고받은 내용대로 받아들이는 편이 편할 수 있습니다.',
    work: '일에서는 해야 할 일의 순서와 마무리 기준을 차분하게 정리하기 좋습니다.',
    thought: '생각이 길어질 때는 바로 확인할 수 있는 사실과 지금 할 수 있는 행동으로 결론을 좁혀 볼 수 있습니다.',
  },
  편관: {
    keywords: ['긴장', '집중'], focus: '압박 속에서 우선순위를 잡는 일',
    headline: ['긴장감이 집중력으로 바뀌기 쉬운 날', '해야 할 것이 선명해지는 흐름'],
    condition: ['해야 할 일이나 주변의 요구가 또렷하게 느껴져 평소보다 긴장감이 올라갈 수 있습니다.', '여유롭게 고민하기보다 빨리 판단하고 대응하고 싶은 마음이 생길 수 있습니다.'],
    social: '사적인 관계에서는 마음의 여유가 적으면 반응이 짧아질 수 있으니, 말수가 적다고 감정까지 단정하지 않는 편이 좋습니다.',
    work: '일에서는 우선순위를 빠르게 잡고 책임 있게 처리하는 힘으로 쓰기 좋습니다.',
    thought: '모든 일을 동시에 해결하려 하기보다 지금 필요한 판단부터 나누면 긴장을 다루기 쉬울 수 있습니다.',
  },
  정관: {
    keywords: ['정돈', '절제'], focus: '기준을 세우고 스스로를 정돈하는 일',
    headline: ['마음과 행동을 단정하게 정리하는 흐름', '자기 기준이 선명해지는 날'],
    condition: ['감정에 바로 휩쓸리기보다 자신의 기준 안에서 상황을 정리하고 행동을 절제하기 쉬울 수 있습니다.', '해야 할 것과 하지 않을 것을 구분하면서 마음이 비교적 단정해질 수 있습니다.'],
    social: '사적인 관계에서는 과하게 파고들기보다 서로의 선을 지키며 차분하고 둥글게 대화하는 편이 자연스러울 수 있습니다.',
    work: '일에서는 역할과 책임, 우선순위가 또렷해져 안정적으로 마무리하려는 경향이 나타날 수 있습니다.',
    thought: '정답을 서두르기보다 지금 내게 필요한 기준이 무엇인지 구분해 보면 생각이 정돈되기 쉽습니다.',
  },
  편인: {
    keywords: ['관찰', '해석'], focus: '낯선 의미와 세부 신호를 살피는 일',
    headline: ['작은 신호가 많이 보일 수 있는 날', '생각에 여백을 두고 관찰하기'],
    condition: ['세부적인 분위기나 작은 차이가 눈에 들어와 여러 의미를 떠올리기 쉬울 수 있습니다.', '익숙한 상황도 다른 각도에서 다시 보고 싶어져 혼자 생각하는 시간이 늘 수 있습니다.'],
    social: '사적인 관계에서는 상대의 말투나 반응을 흥미롭게 관찰할 수 있지만, 짐작한 의미와 실제 말을 분리해 두는 편이 편합니다.',
    work: '일에서는 익숙한 방식보다 다른 접근이나 숨은 문제를 찾아내는 데 강점이 생길 수 있습니다.',
    thought: '해석이 넓어질 때는 확인된 사실을 먼저 두고 나머지는 가능성으로 남겨 두면 과생각을 줄이기 쉽습니다.',
  },
  정인: {
    keywords: ['차분', '이해'], focus: '이해와 회복, 맥락 정리',
    headline: ['천천히 이해하고 마음을 정리하는 흐름', '익숙한 것에서 안정감을 찾는 날'],
    condition: ['서두르기보다 익숙한 환경과 알고 있는 맥락 안에서 마음을 정리하고 싶어질 수 있습니다.', '외부 자극을 늘리기보다 충분히 이해하고 쉬면서 컨디션을 회복하는 쪽이 편할 수 있습니다.'],
    social: '사적인 관계에서는 말을 많이 하기보다 상대 이야기를 듣고 필요한 부분만 천천히 반응하는 방식이 자연스러울 수 있습니다.',
    work: '일에서는 이미 아는 내용을 정리하거나 배운 것을 안정적으로 적용하는 데 집중하기 좋습니다.',
    thought: '이해를 넓히는 시간과 결론을 내리는 시간을 나누어 두면 생각이 과하게 늘어나는 것을 줄일 수 있습니다.',
  },
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
  if (signal.position === 'day' || signal.positions?.includes('day')) return '가까운 관계나 순간적인 반응에서';
  if (signal.position === 'month' || signal.positions?.includes('month')) return '사람을 대하고 바깥 활동을 하는 방식에서';
  if (signal.position === 'year') return '주변 분위기나 익숙한 환경을 받아들일 때';
  return '혼자 있을 때의 생각과 생활 리듬에서';
}

function branchSentence(signal, key) {
  if (!signal) return '원국과의 지지 관계에서는 특정한 자극보다 평소의 리듬이 더 크게 느껴질 수 있습니다.';
  const place = location(signal);
  const copy = {
    combination: [`${place} 힘을 빼고 자연스럽게 맞춰지는 지점이 생길 수 있습니다.`, `${place} 상대나 상황을 낯설게 느끼기보다 익숙하게 받아들이기 쉬울 수 있습니다.`],
    partialTrine: [`${place} 생각이나 감정을 밖으로 풀어내는 연결이 드러날 수 있습니다.`, `${place} 공통의 관심이나 자연스러운 대화거리를 찾기 쉬울 수 있습니다.`],
    trine: [`${place} 흩어진 관심이 한 방향으로 모여 흐름이 자연스럽게 이어질 수 있습니다.`],
    seasonal: [`${place} 비슷한 방향의 움직임이 모여 활동 리듬이 또렷해질 수 있습니다.`],
    clash: [`${place} 평소와 다른 반응이나 속도 차이가 더 크게 체감될 수 있습니다.`, `${place} 바로 결론 내리기보다 한 박자 두고 반응하면 훨씬 편할 수 있습니다.`],
    harm: [`${place} 짧은 말이나 표정에 의미를 덧붙이기 쉬워, 실제로 확인된 내용과 생각을 구분해 두는 편이 좋습니다.`, `${place} 말하지 않은 기대가 어긋날 수 있어 혼자 추측하기보다 필요한 부분만 확인하는 편이 편합니다.`],
    punishment: [`${place} 당연하다고 여기는 기준이 평소보다 예민하게 느껴질 수 있어, 다른 방식도 가능하다는 여지를 두면 편합니다.`],
    triplePunishment: [`${place} 책임감이나 스스로 세운 기준이 강해져 마음을 너무 조이지 않는 것이 중요할 수 있습니다.`],
    selfPunishment: [`${place} 같은 생각을 반복해서 확인하기 쉬워 잠시 다른 활동으로 시선을 돌리는 편이 도움이 될 수 있습니다.`],
    repeat: [`${place} 평소의 반응 패턴이 더 선명해져 익숙한 장점과 습관이 함께 드러날 수 있습니다.`],
    break: [`${place} 작은 순서 조정이나 미묘한 변화가 눈에 들어올 수 있으나 비중은 낮게 읽습니다.`],
  };
  return choose(copy[signal.type] || copy.repeat, key);
}

function stemSentence(signal, person) {
  if (signal.type === 'stemCombination') {
    return person.id === 'eunseo'
      ? '머릿속에서 이어지던 생각을 한 가지 결론이나 구체적인 표현으로 묶어 보기 쉬울 수 있습니다.'
      : '자신의 판단과 주변에서 들어오는 요구를 한 흐름으로 정리하려는 경향이 생길 수 있습니다.';
  }
  if (signal.type === 'stemControls') return '스스로 통제하거나 정리하고 싶은 마음이 강해져 반응을 조금 더 단정하게 만들 수 있습니다.';
  if (signal.type === 'stemGenerates') return '새로 이해한 것을 자연스럽게 표현하거나 다른 사람에게 흘려보내기 쉬울 수 있습니다.';
  if (signal.type === 'stemReceives') return '외부에서 들어온 자극을 자기 방식으로 받아들이고 표현으로 연결하기 쉬울 수 있습니다.';
  if (signal.type === 'stemControlled') return '현실적인 요구가 생각을 정리하는 기준이 되어 복잡함을 줄이는 데 도움이 될 수 있습니다.';
  return '익숙한 판단 기준이 또렷해져 자신의 평소 반응을 더 분명하게 느낄 수 있습니다.';
}

function pickBranchSignal(signals, positions) {
  return signals.find((signal) => signal.domain === 'branch' && signal.type !== 'break'
    && (positions.includes(signal.position) || signal.positions?.some((position) => positions.includes(position))));
}

export function generatePersonSummary(person, flow, { monthly = false } = {}) {
  const signals = analyzePersonSignals(person, flow);
  const keySignals = selectKeySignals(signals);
  const tenGod = signals.find((signal) => signal.type === 'tenGod').tenGod;
  const copy = TEN_GOD_COPY[tenGod];
  const seed = `${flowKey(flow)}:${person.id}:${monthly ? 'month' : 'day'}`;
  const primaryBranch = keySignals.find((signal) => signal.domain === 'branch');
  const personalBranch = pickBranchSignal(signals, ['day', 'hour']) || primaryBranch;
  const socialBranch = pickBranchSignal(signals, ['day', 'month']) || primaryBranch;
  const monthBranch = pickBranchSignal(signals, ['month']);
  const stemSignal = keySignals.find((signal) => signal.domain === 'stem');

  const condition = choose(copy.condition, `${seed}:condition`);
  const thought = person.id === 'eunseo' && ['편인', '정인'].includes(tenGod)
    ? '원국의 두 辛 정인과 함께 관찰과 해석이 늘 수 있어, 확인된 사실과 떠오른 생각을 분리해 두면 마음이 훨씬 가벼울 수 있습니다.'
    : person.id === 'hana' && ['子', '午'].includes(flow.branch)
      ? '원국 안의 子午冲도 함께 자극되므로, 겉으로는 빠르게 정리해도 속에서는 다른 생각이 함께 움직일 수 있습니다.'
      : copy.thought;
  const personal = branchSentence(personalBranch, `${seed}:personal`);
  const people = socialBranch ? branchSentence(socialBranch, `${seed}:social`) : copy.social;
  const work = monthBranch
    ? `${copy.work} ${branchSentence(monthBranch, `${seed}:work`)}`
    : copy.work;
  const extraState = stemSignal ? stemSentence(stemSignal, person) : thought;

  const sections = {
    state: unique([condition, extraState]).join(' '),
    people: unique([copy.social, people]).join(' '),
    work,
  };
  const sentences = monthly
    ? unique([condition, personal, copy.social, work, thought]).slice(0, 5)
    : unique([sections.state, sections.people, sections.work]);

  return {
    id: person.id, name: person.name, tenGod,
    headline: choose(copy.headline, `${seed}:headline`),
    sentences, sections,
    tags: unique([primaryBranch?.keyword, ...copy.keywords]).slice(0, 3),
    evidence: keySignals.map((signal) => signal.evidence),
    signals, keySignals, condition, relationships: people, thought,
    rationale: '당일 천간의 십성뿐 아니라 확정된 년·월·일·시주와 당일 지지의 관계를 함께 봅니다. 일지는 가까운 반응, 월지는 바깥 활동과 사회적 방식, 년지는 배경, 시지는 개인적 리듬으로 비중을 달리합니다. 하나는 출생시간 미상이라 시주를 사용하지 않습니다.',
  };
}

function pairActivations(people, flow) {
  const branches = people.flatMap((person) => getKnownPillars(person).map((pillar) => pillar.branch));
  const known = new Set(branches);
  const completed = getGroupRelations([...branches, flow.branch], { includePartial: false });
  const entries = [
    { id: 'day-clash', label: '子午冲', involved: ['子', '午'], required: ['子', '午'], text: '가까이 있을수록 서로의 반응 속도와 감정 처리 차이가 더 눈에 들어올 수 있습니다.', quiet: '가까운 사이의 반응 속도 차이는 기본 배경으로 남아 있습니다.' },
    { id: 'shared-rat', label: '子子 공통점', involved: ['子', '丑', '申', '辰'], required: ['子'], text: '상황과 분위기를 관찰하는 공통점이 살아나 서로의 맥락을 이해하는 데 도움이 될 수 있습니다.', quiet: '상황을 읽는 공통점은 기본 배경으로 유지됩니다.' },
    { id: 'rat-ox', label: '子丑合', involved: ['子', '丑'], required: ['子', '丑'], text: '서로를 지나치게 자극하기보다 현실적인 안정감과 협력의 접점을 찾기 쉬울 수 있습니다.', quiet: '실질적인 안정과 협력의 접점은 기본 배경으로 남아 있습니다.' },
    { id: 'rabbit-goat', label: '卯未 연결', involved: ['亥', '卯', '未'], required: ['卯', '未'], group: '亥卯未', text: '대화나 관계에서 부드럽게 이어지는 지점과 서로 배우는 흐름이 드러날 수 있습니다.', quiet: '성장과 부드러운 교류의 두 글자 연결은 배경으로 읽습니다.' },
    { id: 'horse-dog', label: '午戌 연결', involved: ['寅', '午', '戌'], required: ['午', '戌'], group: '寅午戌', text: '같이 움직이거나 무언가를 해낼 때 호흡이 붙는 지점이 드러날 수 있습니다.', quiet: '함께 움직일 때 힘이 붙는 두 글자 연결은 배경으로 읽습니다.' },
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

function pairConversation(axis, bothSupport, asymmetric, moreTensionName) {
  if (axis) return '말의 내용보다 반응 속도 차이가 먼저 느껴질 수 있습니다. 은서는 맥락이나 의미를 조금 더 오래 보고, 하나는 어느 정도 이해되면 자연스럽게 다음 이야기로 넘어가려는 차이가 드러날 수 있습니다.';
  if (bothSupport) return '가벼운 이야기에서 시작해 자연스럽게 조금 깊어지는 흐름이 편할 수 있습니다. 상대의 반응을 시험하거나 결론을 재촉하기보다 주고받는 대화가 잘 맞습니다.';
  if (asymmetric) return `${moreTensionName} 쪽이 같은 대화를 조금 더 예민하거나 복잡하게 체감할 수 있어, 짧은 답을 관심의 크기로 바로 해석하지 않는 편이 좋습니다.`;
  return '대화의 주제보다 각자 그 이야기를 어디까지 생각하고 언제 마무리하는지가 다를 수 있습니다. 한쪽이 정리하려는 신호가 보이면 자연스럽게 다른 이야기로 넘어가도 괜찮습니다.';
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
  const moreTension = (dominantTension[0]?.weight || 0) > (dominantTension[1]?.weight || 0) ? first : second;
  const activeSupport = activations.filter((entry) => entry.active && entry.id !== 'day-clash');
  const periodWord = monthly ? '이번 절기 구간에는' : '오늘은';

  let headline;
  let relationship;
  let together;
  if (axis) {
    headline = '다른 속도가 더 잘 보이는 흐름';
    relationship = `${periodWord} 두 사람의 기본 子午 축과 하나 원국 안의 子午冲이 함께 자극될 수 있어 서로가 평소보다 조금 더 의식되거나, 같은 상황을 다르게 받아들이는 순간이 생길 수 있습니다. 다름 자체가 불편함을 뜻하지는 않습니다.`;
    together = '가까이 있을수록 은서는 상대의 반응과 의미를 조금 더 살피고, 하나는 상황이 정리되면 다음 흐름으로 넘어가려는 차이가 드러날 수 있습니다. 서로의 속도를 바꾸려 하기보다 차이를 알아차리는 정도가 편합니다.';
  } else if (bothSupport) {
    headline = '편안함과 차이가 함께 보이는 흐름';
    relationship = `${periodWord} 두 사람 모두에게 연결을 만드는 지지가 있어, 서로를 낯설게 느끼기보다 자연스럽게 받아들이는 순간이 생길 수 있습니다. 기본적인 子午의 차이는 남아 있어 완전히 같은 방식으로 반응하는 관계는 아닙니다.`;
    together = activeSupport[0]?.text || '같이 있을 때 꼭 많은 말을 하지 않아도 각자의 흐름을 유지하며 편하게 머무는 방식이 잘 맞을 수 있습니다.';
  } else if (asymmetric) {
    headline = '체감의 온도가 다를 수 있는 흐름';
    relationship = `${periodWord} ${moreTension.name} 쪽에 조율이 필요한 신호가 조금 더 강해, 같은 만남을 두 사람이 서로 다른 무게로 받아들일 수 있습니다. 상대의 속마음을 추측하기보다 실제 반응을 그대로 보는 편이 좋습니다.`;
    together = '한쪽이 말수가 적거나 혼자 정리할 시간이 필요해 보여도 관계의 거리감으로 바로 연결하지 않는 편이 자연스럽습니다.';
  } else {
    headline = '각자의 리듬을 유지하며 만나는 흐름';
    relationship = `${periodWord} 두 사람의 당일 십성과 원국에 닿는 지점이 서로 달라, 같은 공간에서도 각자 다른 데에 신경이 갈 수 있습니다. 기본적인 익숙함과 차이가 함께 있는 관계라는 바탕은 그대로 유지됩니다.`;
    together = '상대를 맞추려 하기보다 각자의 컨디션을 존중하면서 짧게 반응을 주고받는 방식이 편할 수 있습니다.';
  }

  const conversation = pairConversation(axis, bothSupport, asymmetric, moreTension.name);
  const work = bothSupport
    ? '업무에서는 상황을 관찰하는 공통점과 실질적인 협력 연결을 살리기 쉬워, 우선순위만 분명하면 호흡을 맞추기 비교적 편할 수 있습니다.'
    : axis
      ? '업무에서는 반응 속도 차이가 생겨도 역할과 우선순위를 짧게 확인하면 오히려 서로 다른 장점을 나누어 쓰기 쉽습니다.'
      : '업무에서는 말하지 않은 기준을 짐작하기보다 역할과 완료 기준을 짧게 확인하는 편이 안정적입니다.';

  const sections = { relationship, conversation, together, work };
  const sentences = monthly
    ? unique([relationship, conversation, together, work, activeSupport[0]?.text]).slice(0, 5)
    : [relationship, conversation, together, work];
  const evidence = unique([
    `${first.name} ${flow.stem}=${first.tenGod}`, `${second.name} ${flow.stem}=${second.tenGod}`,
    ...individual.map((summary) => summary.keySignals.find((signal) => signal.domain === 'branch')?.evidence),
    ...activations.filter((entry) => entry.active).map((entry) => entry.evidence),
  ]);

  return {
    id: 'pair', name: '둘의 흐름', headline, sentences, sections,
    tags: unique([axis ? '자극' : bothSupport ? '완충' : '조율', axis ? '의식' : '대화', tensions.some((list) => list.length) ? '확인' : '편안함']).slice(0, 3),
    evidence, activations,
    signals: individual.flatMap((summary) => summary.signals.map((signal) => ({ ...signal, personId: summary.id }))),
    rationale: '두 사람을 직장 관계로만 보지 않고, 당일의 개인 컨디션과 기본 인간관계를 먼저 종합합니다. 대화·정서적 거리·같이 있을 때의 체감·업무 호흡을 나누어 보고, 기본 子午冲과 합·연결을 동시에 반영합니다.',
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
