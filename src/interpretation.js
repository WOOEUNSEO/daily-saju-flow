import { PEOPLE, PILLAR_LABELS } from './data.js';
import { getDayInfo, getSeoulDate } from './calendar.js';
import { analyzePersonSignals, getKnownPillars, getGroupRelations, selectKeySignals, getBranchTenGod, getTenGod } from './rules.js';

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


const TEN_GOD_DETAIL = {
  비견: {
    plain: '내 기준·자기 리듬·주도성',
    direct: '남의 반응보다 내 컨디션과 내 판단이 먼저 느껴지는 쪽으로 갑니다.',
    mechanism: '같은 오행이 겹치면 자기 감각이 커져, 평소 하던 방식과 내 기준을 더 선명하게 의식하는 흐름으로 읽습니다.',
    caution: '내 방식이 분명한 만큼 상대의 속도가 답답하게 보일 수 있으니, 다른 방식이 틀린 것은 아니라는 여지를 두는 게 좋습니다.',
  },
  겁재: {
    plain: '주변 의식·비교·조율·경쟁',
    direct: '내가 무엇을 원하는지보다 주변 사람이 어떻게 움직이는지가 더 눈에 들어올 수 있습니다.',
    mechanism: '같은 오행이지만 음양이 달라, 자기 에너지와 주변 사람의 움직임이 동시에 켜지는 흐름으로 봅니다.',
    caution: '비교와 눈치가 길어지면 실제 상황보다 관계를 크게 해석하기 쉬우니 내 몫과 상대 몫을 분리해 보는 게 좋습니다.',
  },
  식신: {
    plain: '표현·여유·생활감·자연스러운 행동',
    direct: '생각이 머리에만 머물지 않고 말·행동·생활 쪽으로 빠져나가서 답답함이 줄기 쉽습니다.',
    mechanism: '내 기운이 바깥으로 흘러나가는 십성이라, 안에서 계속 생각하기보다 직접 말하고 해보면서 정리되는 쪽으로 읽습니다.',
    caution: '편해진 만큼 해야 할 일의 긴장감까지 낮아질 수 있어 중요한 마감은 따로 붙잡아 두는 편이 좋습니다.',
  },
  상관: {
    plain: '표현력·예민한 감지·솔직함·개선 욕구',
    direct: '평소 그냥 넘기던 차이와 불편한 점이 빨리 보여서 하고 싶은 말도 선명해질 수 있습니다.',
    mechanism: '내 기운이 밖으로 강하게 빠지면서 관찰한 것을 바로 말이나 행동으로 바꾸려는 성질이 커지는 흐름으로 읽습니다.',
    caution: '맞는 말을 하더라도 말의 속도가 상대보다 빠를 수 있으니 한 박자만 늦추면 불필요한 마찰을 줄이기 쉽습니다.',
  },
  편재: {
    plain: '외부 활동·사람·변화 대응·기회',
    direct: '머릿속보다 바깥 상황과 사람, 당장 움직일 일이 더 크게 느껴져 생각이 한곳에 오래 붙지 않기 쉽습니다.',
    mechanism: '내가 통제하고 다루는 대상이 넓어지는 십성이라, 관심이 현실 바깥으로 퍼지고 즉각 대응하는 힘이 올라가는 흐름으로 봅니다.',
    caution: '여러 자극을 동시에 잡으려 하면 산만해질 수 있으니 그날의 우선순위를 한두 개로 좁히는 편이 좋습니다.',
  },
  정재: {
    plain: '현실 감각·정리·순서·결론·안정',
    direct: '감정과 관계의 의미를 오래 붙잡기보다 지금 확인되는 사실과 해야 할 일로 생각이 좁혀져 마음이 담백해지기 쉽습니다.',
    mechanism: '내가 다룰 수 있는 현실과 결과 쪽으로 시선이 모이는 십성이라, 머릿속 해석보다 실제 순서·마무리·생활 감각이 앞서는 흐름으로 읽습니다.',
    caution: '현실적으로 정리되는 힘이 강한 대신 감정을 너무 빨리 “별일 아님”으로 덮지 않는 정도의 여유는 필요합니다.',
  },
  편관: {
    plain: '압박·긴장·즉각 대응·집중',
    direct: '해야 할 것과 대응할 일이 선명해져 잡생각이 줄 수 있지만, 몸은 긴장한 채로 버티는 느낌이 생길 수 있습니다.',
    mechanism: '나를 제어하는 기운이 강하게 들어오면 선택지가 줄고 우선순위가 강제로 좁혀져 생각이 단순해지는 흐름으로 읽습니다.',
    caution: '집중이 잘된다고 컨디션까지 좋은 것은 아닐 수 있으니 피로와 긴장을 따로 확인하는 편이 좋습니다.',
  },
  정관: {
    plain: '기준·책임·질서·절제·자기 통제',
    direct: '감정을 바로 따라가기보다 “지금 어떻게 행동하는 게 맞는가”를 먼저 생각해서 내면이 비교적 단정해지기 쉽습니다.',
    mechanism: '나를 규칙과 기준 안에 세우는 십성이라 감정의 폭보다 질서, 책임, 적절한 선을 먼저 잡는 흐름으로 봅니다.',
    caution: '스스로를 너무 단정하게 관리하면 답답함을 늦게 알아차릴 수 있으니 쉬는 시간까지 기준에 넣는 편이 좋습니다.',
  },
  편인: {
    plain: '관찰·직감·새로운 해석·혼자 생각하기',
    direct: '사소한 표정과 분위기까지 의미가 있어 보이고, 평소와 다른 각도로 다시 생각하고 싶어질 수 있습니다.',
    mechanism: '나를 생해 주는 기운이 비정형적인 방식으로 들어와 생각의 가지가 늘고, 관찰·연상·해석이 넓어지는 흐름으로 읽습니다.',
    caution: '보이는 신호가 많아지는 날일수록 확인된 사실과 내가 붙인 의미를 분리해야 과생각이 줄어듭니다.',
  },
  정인: {
    plain: '이해·회복·학습·익숙한 생각·안정',
    direct: '서두르기보다 충분히 이해하고 익숙한 맥락 안에서 마음을 정리하려는 쪽으로 갑니다.',
    mechanism: '나를 안정적으로 생해 주는 십성이라 새로운 자극보다 이해, 정리, 회복, 익숙한 정보 쪽에 마음이 머무는 흐름으로 봅니다.',
    caution: '생각을 정리하는 시간이 회복이 될 수도 있지만 결론을 미루는 방식으로 길어지지 않는지 확인하면 좋습니다.',
  },
};

const DIRECT_HEADLINES = {
  비견: '내 기준과 내 컨디션이 먼저 느껴지는 날',
  겁재: '주변 사람과 내 속도의 차이가 더 잘 보이는 날',
  식신: '생각이 밖으로 빠지면서 마음이 가벼워지기 쉬운 날',
  상관: '불편한 점과 하고 싶은 말이 또렷해지는 날',
  편재: '생각보다 바깥 상황과 사람이 더 크게 느껴지는 날',
  정재: '생각이 덜 복잡해지고 현실 감각이 앞서는 날',
  편관: '압박이 잡생각을 줄이지만 긴장은 남기 쉬운 날',
  정관: '감정보다 기준과 질서가 먼저 잡히는 날',
  편인: '작은 신호까지 의미 있게 보여 생각이 늘기 쉬운 날',
  정인: '익숙한 생각과 이해 쪽으로 마음이 머무는 날',
};

const PERSON_TEN_GOD_EFFECT = {
  eunseo: {
    비견: '壬이 다시 들어오면 원래의 壬水 감각이 강해져 타인의 반응보다 “나는 지금 어떤가”가 먼저 잡힙니다.',
    겁재: '癸가 들어오면 수 기운 자체가 늘어 생각과 감정의 흐름이 커지고, 그 안에 주변 사람의 반응까지 함께 넣어 보려는 경향이 생길 수 있습니다.',
    식신: '甲은 壬水가 바깥으로 빠져나가는 통로라, 머릿속에서 돌던 생각을 말·행동으로 배출해 정체감을 줄이는 쪽으로 작용합니다.',
    상관: '乙은 壬水의 생각을 더 섬세하고 날카로운 표현으로 빼내는 쪽이라, 차이를 빨리 알아차리고 말하고 싶어질 수 있습니다.',
    편재: '丙이 들어오면 주의가 사람·일정·현실 자극 쪽으로 넓어져, 평소의 인성식 해석이 잠시 뒤로 밀릴 수 있습니다.',
    정재: '丁은 壬에게 정재입니다. 은서는 월간·시간에 辛 정인이 두 개라 평소 관찰과 해석이 길어지기 쉬운데, 정재가 들어오면 시선이 현실·순서·결론으로 옮겨가 그 “생각 회로”가 잠깐 조용해지는 쪽으로 읽을 수 있습니다.',
    편관: '戊土가 壬水를 강하게 잡으면 선택지가 줄고 “지금 해야 하는 것”이 앞에 서서, 생각이 많아도 행동 기준은 오히려 단순해질 수 있습니다.',
    정관: '己土가 壬水를 정돈하면 감정의 파도보다 규칙과 기준을 먼저 세우게 되어, 스스로를 차분하게 관리하는 힘이 생길 수 있습니다.',
    편인: '庚金은 壬水를 생하면서 새로운 관찰 포인트를 늘립니다. 원래 辛 정인이 두 개 있는 원국과 겹치면 평소보다 더 많이 보고 더 많이 연결해서 생각하기 쉽습니다.',
    정인: '辛金이 다시 들어오면 원국의 두 辛 정인과 같은 성질이 강조되어, 익숙한 생각·기억·관찰을 오래 붙잡는 힘이 커질 수 있습니다.',
  },
  hana: {
    비견: '庚이 다시 들어오면 자기 판단과 주도성이 강해져, 이미 정한 기준대로 처리하려는 힘이 커질 수 있습니다.',
    겁재: '辛이 들어오면 같은 금 기운이 늘면서 주변 사람의 방식과 내 기준을 동시에 보게 되어, 조율이나 역할 구분을 더 의식할 수 있습니다.',
    식신: '壬은 庚金의 기운이 바깥으로 빠지는 식신이라, 판단만 하고 끝내기보다 설명·챙김·행동으로 자연스럽게 풀어내는 쪽으로 갑니다.',
    상관: '癸는 庚의 판단을 더 직접적인 표현으로 빼내서, 평소보다 차이와 비효율을 빨리 말하거나 고치고 싶어질 수 있습니다.',
    편재: '甲은 庚이 직접 다루는 편재라 외부 상황, 사람, 일정 같은 여러 변수를 빠르게 정리하고 대응하는 쪽으로 에너지가 갑니다.',
    정재: '乙은 庚에게 정재라 세부적인 현실 관리, 정확한 마무리, 챙겨야 할 사람과 일을 구체적으로 정리하는 힘이 커질 수 있습니다.',
    편관: '丙火가 庚金을 강하게 누르면 즉시 판단하고 대응해야 한다는 긴장이 생겨, 평소보다 빠르고 단호하게 처리하는 쪽으로 갈 수 있습니다.',
    정관: '丁火는 庚에게 정관입니다. 책임·규칙·선이 또렷해져 감정보다 “내 역할에 맞게 처리한다”는 모드가 강해질 수 있습니다.',
    편인: '戊土가 庚金을 생하면 외부 반응보다 내부 판단과 관찰이 강해져, 바로 말하기보다 한 번 더 보고 결론을 내리려는 쪽으로 갈 수 있습니다.',
    정인: '己土는 庚을 안정적으로 받쳐 주어, 익숙한 방식·경험·기준으로 상황을 정리하고 회복하려는 힘이 커질 수 있습니다.',
  },
};



const TEN_GOD_LAYER = {
  비견: { front: '내 기준대로 움직이려는 힘', inner: '자기 감각과 자기 리듬을 선명하게 느끼는 힘', relation: '상대에게 맞추기보다 각자의 방식을 지키려는 쪽' },
  겁재: { front: '주변 사람의 움직임과 내 속도를 함께 의식하는 힘', inner: '비교·조율·관계 자극을 크게 받아들이는 힘', relation: '사람과의 접점이 늘고 상대의 반응이 더 잘 보이는 쪽' },
  식신: { front: '생각을 말과 행동으로 자연스럽게 풀어내는 힘', inner: '생활감과 여유를 회복하며 답답함을 빼는 힘', relation: '편하게 반응을 주고받고 챙김을 행동으로 보여주는 쪽' },
  상관: { front: '차이와 불편을 빠르게 알아차리고 표현하는 힘', inner: '예민하게 감지하고 개선점을 찾는 힘', relation: '솔직한 말과 빠른 반응이 늘어나는 쪽' },
  편재: { front: '바깥 상황과 사람에게 빠르게 대응하는 힘', inner: '변화·기회·여러 자극을 넓게 받아들이는 힘', relation: '가볍고 즉각적인 교류가 늘어나는 쪽' },
  정재: { front: '현실적인 순서와 결론을 잡는 힘', inner: '감정과 생각을 사실·생활·마무리 쪽으로 좁히는 힘', relation: '관계의 의미보다 실제로 주고받은 행동을 보게 되는 쪽' },
  편관: { front: '압박 속에서 빠르게 판단하고 대응하는 힘', inner: '긴장과 집중을 동시에 끌어올리는 힘', relation: '여유보다 해야 할 일과 즉각 반응이 앞서는 쪽' },
  정관: { front: '역할·기준·선을 지키며 행동을 단정하게 만드는 힘', inner: '감정을 바로 내보내지 않고 한 번 걸러 정리하는 힘', relation: '관계를 가볍게 휘두르기보다 적절한 선과 태도를 지키는 쪽' },
  편인: { front: '다른 각도에서 관찰하고 의미를 찾는 힘', inner: '연상과 해석의 가지를 늘리는 힘', relation: '작은 표정과 말투도 오래 보고 의미를 연결하는 쪽' },
  정인: { front: '익숙한 정보와 사람을 천천히 받아들이는 힘', inner: '이해·기억·회복 쪽으로 마음을 모으는 힘', relation: '편하고 익숙한 사람에게 마음이 머물고 들은 말을 오래 기억하는 쪽' },
};


const CONCRETE_EXPERIENCE = {
  비견: '실제로는 혼자 정리할 시간이 필요하거나, 남의 반응보다 내가 원하는 순서대로 움직일 때 편하다고 느끼기 쉽습니다.',
  겁재: '실제로는 주변 사람이 누구와 어떻게 움직이는지 평소보다 잘 보이고, 내 속도와 비교하면서 관계에 신경을 조금 더 쓸 수 있습니다.',
  식신: '실제로는 머릿속에서만 생각하기보다 말 한마디를 먼저 꺼내거나, 먹고 쉬고 움직이는 생활감이 살아나면서 답답함이 줄기 쉽습니다.',
  상관: '실제로는 평소 그냥 넘기던 말투·순서·비효율이 빨리 보여서 “이건 이렇게 하면 되지 않나?” 같은 생각이 바로 올라올 수 있습니다.',
  편재: '실제로는 한 가지 생각을 오래 붙잡기보다 사람·일정·눈앞의 상황으로 관심이 옮겨가고, 몸부터 움직이는 편이 자연스러울 수 있습니다.',
  정재: '실제로는 상대 표정의 숨은 뜻을 오래 추측하기보다 “지금 확인된 건 이거야” 하고 현실적인 결론을 내릴 때 마음이 편해지기 쉽습니다.',
  편관: '실제로는 해야 할 일이 선명해져 잡생각은 줄 수 있지만, 몸은 긴장한 채 버티고 있을 수 있어서 끝난 뒤 피로가 한꺼번에 느껴질 수 있습니다.',
  정관: '실제로는 기분대로 반응하기보다 “지금 어떤 태도가 맞지?”를 먼저 생각해 말과 행동이 평소보다 단정해질 수 있습니다.',
  편인: '실제로는 짧은 말이나 표정도 그냥 넘기지 않고 여러 가능성을 떠올리기 쉬워, 혼자 생각하는 시간이 길어질 수 있습니다.',
  정인: '실제로는 익숙한 사람·익숙한 방식이 편하고, 들은 말을 오래 기억하면서 충분히 이해한 뒤 움직이고 싶어질 수 있습니다.',
};

const PERSON_BASE_STYLE = {
  eunseo: '은서는 원국에 辛 정인이 월간과 시간에 두 번 있어 원래도 사람의 말·표정·상황을 관찰하고 의미를 연결해서 생각하는 힘이 강한 편입니다.',
  hana: '하나는 庚金이 반복되고 월지 子와 일지 午가 함께 있어, 바깥에서는 상황을 빠르게 관찰·판단하면서도 가까운 자리에서는 역할과 기준을 지키려는 두 모드가 같이 있는 편입니다.',
};

function flowFromGanZhi(ganZhi) {
  if (!ganZhi || ganZhi.length < 2) return null;
  return { stem: ganZhi[0], branch: ganZhi[1], ganZhi };
}

function monthLayer(person, flow) {
  const monthFlow = flowFromGanZhi(flow.monthGanZhi);
  if (!monthFlow) return null;
  const combo = tenGodPair(person, monthFlow.stem, monthFlow.branch);
  const signals = analyzePersonSignals(person, monthFlow);
  const branches = strongestBranchSignals(signals, 2);
  return { flow: monthFlow, combo, signals, branches };
}

function monthRelationExplanation(layer) {
  if (!layer?.branches?.length) return '';
  return layer.branches.map((signal) => relationEffect(signal)).join(' ');
}

function monthBackgroundFriendly(person, flow, dayCombo) {
  const layer = monthLayer(person, flow);
  if (!layer) return '';
  const m = layer.combo;
  const stem = TEN_GOD_DETAIL[m.stemTenGod];
  const branch = TEN_GOD_DETAIL[m.branchTenGod];
  const repeated = m.stemTenGod === m.branchTenGod
    ? `${m.stemTenGod}이 천간과 지지에서 겹쳐 ${stem.plain} 쪽 기운이 이번 달의 기본 분위기로 강하게 깔립니다.`
    : `${m.stemTenGod}의 ${stem.plain}과 ${m.branchTenGod}의 ${branch.plain}이 동시에 배경에 깔립니다.`;
  const relation = monthRelationExplanation(layer);
  const contrast = (m.stemTenGod === dayCombo.stemTenGod || m.branchTenGod === dayCombo.branchTenGod)
    ? `오늘의 ${dayCombo.stemTenGod} + ${dayCombo.branchTenGod} 중 일부가 월운과 겹쳐서 그 성향이 더 쉽게 체감될 수 있습니다.`
    : `그래서 오늘 ${dayCombo.stemTenGod} + ${dayCombo.branchTenGod} 조합이 들어오더라도, 한 달 전체의 ${m.stemTenGod} + ${m.branchTenGod} 분위기가 바닥에서 계속 작동합니다.`;
  return `이번 달 ${flow.monthGanZhi}의 흐름은 ${person.name}에게 ${m.stemTenGod} + ${m.branchTenGod}입니다. ${repeated} ${relation ? `여기에 월지 ${m.branch}가 원국과 만나면 ${relation}` : ''} ${contrast}`.trim();
}

function concreteDailyText(person, combo, signals) {
  const first = CONCRETE_EXPERIENCE[combo.stemTenGod] || '';
  const second = combo.branchTenGod === combo.stemTenGod ? '' : CONCRETE_EXPERIENCE[combo.branchTenGod] || '';
  const key = strongestBranchSignals(signals, 1)[0];
  const relation = key ? relationEffect(key) : '';
  return `${first}${second ? ` 동시에 ${combo.branchTenGod} 쪽에서는 ${second}` : ''}${relation ? ` ${relation}` : ''}`.trim();
}

function flowGanZhi(flow) {
  return flow.ganZhi || flow.dayGanZhi || flow.monthGanZhi || `${flow.stem}${flow.branch}`;
}

function tenGodPair(person, stem, branch) {
  const stemTenGod = getTenGod(person.dayMaster, stem);
  const branchInfo = getBranchTenGod(person.dayMaster, branch);
  return { stem, branch, stemTenGod, branchTenGod: branchInfo.tenGod, branchMainStem: branchInfo.mainStem };
}

function comboExplanation(person, combo, { label = '오늘' } = {}) {
  const a = TEN_GOD_LAYER[combo.stemTenGod];
  const b = TEN_GOD_LAYER[combo.branchTenGod];
  if (combo.stemTenGod === combo.branchTenGod) {
    return `${label}은 ${combo.stemTenGod} + ${combo.branchTenGod} 조합입니다. ${combo.stem} 천간과 ${combo.branch}의 본기 ${combo.branchMainStem}가 모두 ${combo.stemTenGod}으로 읽혀, ${a.front}과 ${a.inner}이 한 방향으로 겹칩니다. 그래서 이 십성의 주제가 평소보다 더 분명하게 체감되기 쉽습니다.`;
  }
  return `${label}은 ${combo.stemTenGod} + ${combo.branchTenGod} 조합입니다. ${combo.stem}의 ${particle(combo.stemTenGod)} 겉에서 ${a.front}을 만들고, ${combo.branch}의 본기 ${combo.branchMainStem} ${particle(combo.branchTenGod)} 안쪽에서 ${b.inner}을 받쳐 줍니다. 그래서 겉으로 드러나는 태도와 속에서 느끼는 반응이 한 가지 십성만 볼 때보다 더 입체적으로 나타날 수 있습니다.`;
}

function monthBackground(person, flow, dayCombo) {
  return monthBackgroundFriendly(person, flow, dayCombo);
}

function branchOverlapText(signals, limit = 4) {
  const branches = signals.filter((signal) => signal.domain === 'branch').slice(0, limit);
  if (!branches.length) return '';
  return `하지만 원국과 겹치는 지지까지 보면 ${branches.map(relationEffect).join(' ')}`;
}

function strongestBranchSignals(signals, limit = 3) {
  return signals.filter((signal) => signal.domain === 'branch' && signal.type !== 'break').slice(0, limit);
}

function relationEffect(signal) {
  if (!signal) return '';
  const position = signal.position || signal.positions?.[0];
  const place = PILLAR_LABELS[position] || '원국';
  const natal = signal.natalBranch || '';
  const prefix = natal ? `${place} ${natal}와 ${signal.label} 관계가` : `${place} 쪽에서 ${signal.label} 관계가`;
  const effects = {
    combination: ' 걸려 있어 상황을 억지로 밀기보다 자연스럽게 맞추는 힘이 생깁니다.',
    partialTrine: ' 생겨 생각·대화·행동이 한 방향으로 이어질 통로가 열립니다.',
    trine: ' 완성되어 흩어진 관심이 한 방향으로 모이는 힘이 강해집니다.',
    seasonal: ' 구성되어 바깥 활동과 움직임이 더 또렷해질 수 있습니다.',
    clash: ' 걸려 있어 감정과 반응이 평소보다 크게 움직이거나 속도 차이가 선명해질 수 있습니다.',
    harm: ' 걸려 있어 말하지 않은 기대나 미묘한 신경 쓰임이 생길 수 있습니다.',
    punishment: ' 걸려 있어 “왜 저렇게 하지?” 같은 기준 차이가 평소보다 예민하게 느껴질 수 있습니다.',
    triplePunishment: ' 구성되어 책임·기준·긴장을 스스로 강하게 잡는 쪽으로 갈 수 있습니다.',
    selfPunishment: ' 겹쳐 같은 생각이나 감정을 반복해서 확인하기 쉬워집니다.',
    repeat: ' 겹쳐 평소의 반응 패턴이 더 선명해집니다.',
  };
  return `${prefix}${effects[signal.type] || '이 들어옵니다.'}`;
}

function directWhy(person, flow, tenGod, signals, { monthly = false } = {}) {
  const detail = TEN_GOD_DETAIL[tenGod];
  const personal = PERSON_TEN_GOD_EFFECT[person.id]?.[tenGod] || detail.mechanism;
  const relations = strongestBranchSignals(signals, monthly ? 3 : 2).map(relationEffect).filter(Boolean);
  const relationText = relations.length ? ` 지지 쪽에서는 ${relations.join(' ')}` : '';
  return `${personal}${relationText}`;
}

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

function hasBatchim(value) {
  const text = String(value || '');
  const last = text.charCodeAt(text.length - 1);
  return last >= 0xAC00 && last <= 0xD7A3 ? ((last - 0xAC00) % 28) !== 0 : false;
}

function particle(value, withBatchim = '이', withoutBatchim = '가') {
  return `${value}${hasBatchim(value) ? withBatchim : withoutBatchim}`;
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
  const combo = tenGodPair(person, flow.stem, flow.branch);
  const branchTenGod = combo.branchTenGod;
  const copy = TEN_GOD_COPY[tenGod];
  const detail = TEN_GOD_DETAIL[tenGod];
  const branchDetail = TEN_GOD_DETAIL[branchTenGod];
  const seed = `${flowKey(flow)}:${person.id}:${monthly ? 'month' : 'day'}`;
  const primaryBranch = keySignals.find((signal) => signal.domain === 'branch');
  const personalBranch = pickBranchSignal(signals, ['day', 'hour']) || primaryBranch;
  const socialBranch = pickBranchSignal(signals, ['day', 'month']) || primaryBranch;
  const monthBranch = pickBranchSignal(signals, ['month']);
  const stemSignal = keySignals.find((signal) => signal.domain === 'stem');

  const condition = choose(copy.condition, `${seed}:condition`);
  const personalizedEffect = PERSON_TEN_GOD_EFFECT[person.id]?.[tenGod] || detail.direct;
  const comboText = comboExplanation(person, combo, { label: monthly ? '이번 달' : '오늘' });
  const overlap = branchOverlapText(signals, monthly ? 4 : 4);
  const monthText = monthly ? '' : monthBackgroundFriendly(person, flow, combo);
  const people = socialBranch ? branchSentence(socialBranch, `${seed}:social`) : copy.social;
  const work = monthBranch ? `${copy.work} ${branchSentence(monthBranch, `${seed}:work`)}` : copy.work;
  const extraState = stemSignal ? stemSentence(stemSignal, person) : copy.thought;

  const innerBlend = combo.stemTenGod === combo.branchTenGod
    ? `${detail.direct} 같은 주제가 천간과 지지에서 반복되기 때문에 평소보다 이 성향을 더 분명하게 체감하기 쉽습니다.`
    : `${detail.direct} 그런데 지지 쪽에는 ${branchTenGod}도 함께 있어서 ${branchDetail.direct} 즉 겉으로 드러나는 반응과 속에서 느끼는 결이 완전히 한 방향만은 아닐 수 있습니다.`;
  const peopleDirect = `${TEN_GOD_LAYER[tenGod].relation}에 더해 ${TEN_GOD_LAYER[branchTenGod].relation}도 함께 작동합니다. ${people}`;
  const workDirect = `${copy.work}${monthBranch ? ` ${relationEffect(monthBranch)}` : ''}`;
  const realLife = concreteDailyText(person, combo, signals);
  const baseStyle = PERSON_BASE_STYLE[person.id] || '';

  const sections = monthly
    ? {
        core: `${flowGanZhi(flow)}월은 ${tenGod} + ${branchTenGod} 조합입니다. ${flow.stem}은 ${person.name}에게 ${tenGod}, ${flow.branch}의 본기 ${combo.branchMainStem}은 ${branchTenGod}으로 읽습니다. 쉽게 말하면 ${detail.plain}과 ${branchDetail.plain}이 한 달 안에서 같이 움직이는 흐름입니다.`,
        state: `${comboText} ${innerBlend}`,
        overlap: `${baseStyle} ${overlap || '원국과의 지지 관계에서는 특정 한 가지 자극보다 평소의 반응 패턴이 더 크게 작동하는 달입니다.'}`,
        people: peopleDirect,
        work: workDirect,
        caution: combo.stemTenGod === combo.branchTenGod ? detail.caution : `${detail.caution} 또 ${branchTenGod}의 ${branchDetail.caution}`,
      }
    : {
        state: `${comboText} 쉽게 말하면 ${particle(detail.plain)} 겉의 반응을 만들고, ${particle(branchDetail.plain)} 속반응을 같이 만듭니다. ${condition}`,
        month: monthText,
        why: `${baseStyle} 오늘 흐름에서는 ${personalizedEffect} ${overlap} ${extraState}`.trim(),
        real: realLife,
        people: peopleDirect,
        work: workDirect,
      };

  const sentences = monthly
    ? unique([sections.core, sections.state, sections.overlap, sections.people, sections.work, sections.caution]).slice(0, 5)
    : unique([sections.state, sections.month, sections.why, sections.real, sections.people, sections.work]);

  return {
    id: person.id, name: person.name, tenGod, branchTenGod,
    tenGodPlain: detail.plain,
    branchTenGodPlain: branchDetail.plain,
    comboLabel: `${tenGod} + ${branchTenGod}`,
    combo,
    headline: monthly
      ? `${tenGod} + ${branchTenGod} · ${detail.plain} + ${branchDetail.plain}`
      : `${tenGod} + ${branchTenGod} · ${DIRECT_HEADLINES[tenGod] || choose(copy.headline, `${seed}:headline`)}`,
    sentences, sections,
    directLine: `${comboText} ${personalizedEffect}`,
    why: sections.why || sections.overlap,
    tags: unique([tenGod, branchTenGod, primaryBranch?.keyword, ...copy.keywords]).slice(0, 3),
    evidence: unique([
      `${flow.stem} = ${person.dayMaster} 기준 ${tenGod}`,
      `${flow.branch}(본기 ${combo.branchMainStem}) = ${person.dayMaster} 기준 ${branchTenGod}`,
      ...keySignals.filter((signal) => signal.domain === 'branch').map((signal) => signal.evidence),
    ]).slice(0, 3),
    signals, keySignals, condition, relationships: people, thought: copy.thought,
    rationale: monthly
      ? '월간 천간의 십성 하나만 보지 않고 월지의 본기 십성까지 함께 읽습니다. 그 위에 월지가 원국의 일지·월지·년지·시지와 만드는 합·충·형·해·연결을 겹쳐서, 왜 그 달에 특정한 감정·대화·행동 패턴이 나타나기 쉬운지 설명합니다.'
      : '당일 천간 십성과 당일 지지의 본기 십성을 먼저 조합하고, 그달 월운의 십성 조합과 월지가 원국을 건드리는 방식까지 함께 봅니다. 마지막으로 당일 지지가 원국의 일지·월지·년지·시지와 만드는 합·충·형·해를 겹쳐서 실제 체감이 왜 그렇게 나타날 수 있는지 풀어냅니다. 하나는 출생시간 미상이라 시주를 사용하지 않습니다.',
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
  const periodWord = monthly ? '이번 달' : '오늘';

  const firstMode = `${first.name}는 ${first.tenGod} + ${first.branchTenGod}`;
  const secondMode = `${second.name}는 ${second.tenGod} + ${second.branchTenGod}`;
  const modeContext = `${periodWord} ${firstMode}, ${secondMode} 조합입니다. 쉽게 말하면 ${first.name}는 ${TEN_GOD_DETAIL[first.tenGod].plain} 쪽 반응이 먼저 켜지고, 속에서는 ${TEN_GOD_DETAIL[first.branchTenGod].plain} 쪽 반응이 같이 움직입니다. ${second.name}는 ${TEN_GOD_DETAIL[second.tenGod].plain} 쪽 반응이 앞에 서고, ${TEN_GOD_DETAIL[second.branchTenGod].plain} 쪽 반응이 안쪽에서 함께 움직입니다.`;

  const firstMonth = !monthly ? monthLayer(people[0], flow) : null;
  const secondMonth = !monthly ? monthLayer(people[1], flow) : null;
  const monthContext = firstMonth && secondMonth
    ? `이번 달 ${flow.monthGanZhi}의 바탕까지 보면 ${first.name}는 ${firstMonth.combo.stemTenGod} + ${firstMonth.combo.branchTenGod}, ${second.name}는 ${secondMonth.combo.stemTenGod} + ${secondMonth.combo.branchTenGod}입니다. 그래서 하루 기분만 따로 움직이는 게 아니라, ${first.name}는 ${TEN_GOD_DETAIL[firstMonth.combo.stemTenGod].plain} 쪽의 월간 분위기 위에서 오늘을 보내고, ${second.name}는 ${TEN_GOD_DETAIL[secondMonth.combo.stemTenGod].plain} 쪽의 월간 분위기 위에서 오늘 반응합니다.`
    : '';

  const concretePair = `${first.name}는 ${CONCRETE_EXPERIENCE[first.tenGod]} ${second.name}는 ${CONCRETE_EXPERIENCE[second.tenGod]} 그래서 둘이 같은 공간에 있을 때도 ${first.name}는 무엇을 느끼고 해석하는지, ${second.name}는 무엇을 정리하고 행동하는지가 서로 다르게 보일 수 있습니다.`;

  const firstKey = strongestBranchSignals(first.signals, 1)[0];
  const secondKey = strongestBranchSignals(second.signals, 1)[0];
  const individualOverlap = `${firstKey ? `${first.name}에게는 ${relationEffect(firstKey)}` : ''}${firstKey && secondKey ? ' ' : ''}${secondKey ? `${second.name}에게는 ${relationEffect(secondKey)}` : ''}`.trim();

  let headline;
  let relationship;
  let together;
  if (axis) {
    headline = '각자의 십성은 다르고, 子午의 반응 속도 차이도 살아나는 흐름';
    relationship = `${modeContext} 여기에 두 사람의 기본 子午 축과 하나 원국 안의 子午冲까지 자극됩니다. 그래서 같은 장면을 봐도 은서는 의미와 맥락을 조금 더 오래 붙잡고, 하나는 어느 정도 판단이 끝나면 행동이나 다음 흐름으로 넘어가기 쉬울 수 있습니다. ${individualOverlap} ${concretePair}`;
    together = '같이 있을 때는 “누가 더 마음이 큰가”보다 반응 방식이 다르다는 점이 더 중요합니다. 은서는 짧은 말도 기억하고 의미를 이어갈 수 있고, 하나는 말보다 실제 행동이나 다음 처리로 관계를 이어갈 수 있어서, 긴 설명보다 짧은 스몰토크·같이 움직이는 행동·자연스러운 챙김에서 친숙함이 더 잘 보일 수 있습니다.';
  } else if (bothSupport) {
    headline = '각자의 컨디션은 달라도 서로에게 맞춰질 여지가 큰 흐름';
    relationship = `${modeContext} 오늘 지지는 두 사람 모두에게 원국과 연결되는 지점을 만들어, 각자의 상태가 달라도 상대를 낯설게 느끼기보다 익숙한 방식으로 받아들이기 쉽습니다. ${individualOverlap} ${concretePair} 기본 子午의 차이는 남아 있지만 오늘은 그 차이를 바로 갈등으로 키우기보다 서로의 장점을 나눠 쓰는 쪽으로 흐르기 쉽습니다.`;
    together = activeSupport[0]?.text || '같이 있을 때 꼭 대화를 길게 하지 않아도 각자 할 일을 하다가 필요한 순간에 자연스럽게 반응을 주고받는 방식이 편할 수 있습니다.';
  } else if (asymmetric) {
    headline = '같은 만남도 한쪽은 더 깊게, 한쪽은 더 단순하게 받아들일 수 있는 흐름';
    relationship = `${modeContext} 원국과 겹치는 자극은 ${moreTension.name} 쪽에서 조금 더 크게 잡혀, 같은 대화나 같은 표정도 두 사람이 저장하는 무게가 달라질 수 있습니다. ${individualOverlap} ${concretePair} 이럴 때는 상대의 관심 크기를 추측하기보다 각자의 오늘 십성이 무엇을 먼저 보게 만드는지 구분해서 보는 편이 이해가 쉽습니다.`;
    together = '한쪽은 대화를 끝낸 뒤에도 의미를 이어서 생각하고, 다른 쪽은 이미 자연스럽게 넘겼을 수 있습니다. 상대가 가볍게 넘겼다고 관계가 가벼운 것도 아니고, 오래 생각한다고 반드시 문제가 큰 것도 아닙니다.';
  } else {
    headline = '각자의 십성 조합 위에서 익숙함과 차이가 함께 보이는 흐름';
    relationship = `${modeContext} 두 사람의 기본 관계에서는 은서가 하나를 편인 방향으로 관찰·이해하려는 축, 하나가 은서를 식신 방향으로 반응하고 과정을 보는 축이 있습니다. 여기에 은서 일지 子와 하나 일지 午의 차이, 은서 일지 子와 하나 월지 子의 익숙함이 동시에 있어서 “편한데 완전히 같지는 않은 사람”처럼 느껴지기 쉽습니다. ${individualOverlap} ${concretePair}`;
    together = '상대를 일부러 맞추려 하기보다 각자의 컨디션대로 있다가 필요한 순간에 짧게 말을 주고받는 방식이 자연스럽습니다. 은서는 말의 의미를, 하나는 실제 상황과 행동을 더 먼저 볼 수 있다는 차이를 알고 있으면 훨씬 편합니다.';
  }

  const conversation = axis
    ? '대화에서는 은서가 상대의 한마디를 조금 더 오래 생각할 수 있고, 하나는 말의 뜻이 전달됐다고 느끼면 다음 주제로 넘어가기 쉬울 수 있습니다. 그래서 짧은 답이나 빠른 화제 전환을 관계의 온도로 바로 해석하지 않는 편이 좋습니다.'
    : bothSupport
      ? '대화는 가벼운 얘기에서 시작해서 자연스럽게 조금 깊어지는 흐름이 잘 맞습니다. 질문만 이어가기보다 각자 자기 경험이나 생각을 한두 마디씩 보태는 방식이 편할 수 있습니다.'
      : pairConversation(axis, bothSupport, asymmetric, moreTension.name);
  const work = bothSupport
    ? '업무에서는 상황을 보는 공통점과 각자의 장점이 이어지기 쉬워, 우선순위만 분명하면 한 사람은 흐름을 읽고 한 사람은 결론과 실행을 잡는 식으로 호흡을 나누기 좋습니다.'
    : axis
      ? '업무에서는 반응 속도가 달라도 역할과 완료 기준을 짧게 확인하면 오히려 서로 다른 장점을 쓰기 쉽습니다. 은서는 놓친 맥락을 보고, 하나는 판단과 실행을 빠르게 가져가는 식의 보완이 가능합니다.'
      : '업무에서는 말하지 않은 기준을 짐작하기보다 역할과 완료 기준을 짧게 확인하는 편이 안정적입니다.';

  const mode = `${modeContext}${individualOverlap ? ` ${individualOverlap}` : ''}`;
  const dynamic = monthly
    ? `${mode} 기본 관계에서는 은서가 하나를 편인 방향으로 관찰·이해하려는 축, 하나가 은서를 식신 방향으로 반응·성장 과정을 보는 축이 있습니다. 여기에 이번 달의 ${first.comboLabel} / ${second.comboLabel}이 얹히면서, 그 기본 관계가 더 편하게 드러나는지 아니면 각자의 컨디션이 앞서는지를 함께 봅니다.`
    : mode;
  const sections = monthly
    ? { relationship, dynamic, conversation, together, work }
    : { relationship, mode, month: monthContext, conversation, together, work };
  const sentences = monthly
    ? unique([relationship, dynamic, conversation, together, work, activeSupport[0]?.text]).slice(0, 6)
    : unique([relationship, mode, monthContext, conversation, together, work]);
  const evidence = unique([
    `${first.name} ${flow.stem}=${first.tenGod}`, `${first.name} ${flow.branch}(본기 ${first.combo.branchMainStem})=${first.branchTenGod}`,
    `${second.name} ${flow.stem}=${second.tenGod}`, `${second.name} ${flow.branch}(본기 ${second.combo.branchMainStem})=${second.branchTenGod}`,
    ...individual.map((summary) => summary.keySignals.find((signal) => signal.domain === 'branch')?.evidence),
    ...activations.filter((entry) => entry.active).map((entry) => entry.evidence),
  ]);

  return {
    id: 'pair', name: '둘의 흐름', headline, sentences, sections,
    tags: unique([axis ? '자극' : bothSupport ? '완충' : '조율', first.branchTenGod, second.branchTenGod]).slice(0, 3),
    evidence, activations,
    signals: individual.flatMap((summary) => summary.signals.map((signal) => ({ ...signal, personId: summary.id }))),
    rationale: '두 사람의 당일 천간 십성 + 당일 지지 본기 십성을 먼저 읽고, 그날이 놓인 월운의 십성 조합을 배경으로 겹칩니다. 그다음 각자의 원국에서 오늘 지지가 건드리는 지점과 두 사람의 기본 子午冲·子 공통점·합과 연결을 함께 보면서, 실제 만남에서 왜 대화 속도와 체감이 달라질 수 있는지 풀어냅니다.',
  };
}

export function generateDailySummary(dayInfo) {
  const people = PEOPLE.map((person) => generatePersonSummary(person, dayInfo));
  return { people, pair: generatePairSummary(PEOPLE, dayInfo, { summaries: people }) };
}

function shortDate(date) {
  return date.slice(5).replace('-', '.');
}

function phasePersonLine(summary) {
  const strongest = strongestBranchSignals(summary.signals, 1)[0];
  const relation = strongest ? relationEffect(strongest) : '';
  return `${summary.tenGod} 흐름. ${summary.directLine}${relation ? ` ${relation}` : ''}`;
}

function getMonthPhases(period) {
  if (!period.start || !period.end) return [];
  const start = new Date(period.start);
  const end = new Date(period.end);
  const duration = end.getTime() - start.getTime();
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const definitions = [
    { id: 'early', label: '초반', from: 0, to: 1 / 3 },
    { id: 'middle', label: '중반', from: 1 / 3, to: 2 / 3 },
    { id: 'late', label: '후반', from: 2 / 3, to: 1 },
  ];
  return definitions.map((definition) => {
    const fromInstant = new Date(start.getTime() + duration * definition.from);
    const toInstant = new Date(start.getTime() + duration * definition.to - 60_000);
    const representative = new Date(start.getTime() + duration * ((definition.from + definition.to) / 2));
    const date = getSeoulDate(representative);
    const dayInfo = getDayInfo(date);
    const people = PEOPLE.map((person) => generatePersonSummary(person, dayInfo));
    const pair = generatePairSummary(PEOPLE, dayInfo, { summaries: people });
    return {
      id: definition.id,
      label: definition.label,
      range: `${shortDate(getSeoulDate(fromInstant))}–${shortDate(getSeoulDate(toInstant))}`,
      representativeDate: date,
      ganZhi: dayInfo.dayGanZhi,
      people: people.map((summary) => ({ id: summary.id, name: summary.name, text: phasePersonLine(summary) })),
      pair: `${pair.headline}. ${pair.sections.relationship}`,
    };
  });
}

export function generateMonthlySummary(period) {
  const people = PEOPLE.map((person) => generatePersonSummary(person, period, { monthly: true }));
  const pair = generatePairSummary(PEOPLE, period, { monthly: true, summaries: people });
  return { people, pair, phases: getMonthPhases(period) };
}
