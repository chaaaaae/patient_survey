// 역코딩이 필요한 문항 번호 배열
// export는 해당 파일 내에서 선언한 변수나 함수를 다른 파일에서 불러다 쓸 수 있도록 해주는 것
export const reverseIds = [1,2,3,4,5,6,7,8,18,19,20,21,22,23,24,25,26,27,28];

// 역코딩 함수
export function reverseScore(score, max=5, min=1) {
    return max + min - score;
}

// 여러 문항에 역코딩을 적용하는 함수
export function applyReverseScore(answers) {
    // 역코딩 된 결과를 담을 객체
    const result = {};
    // answers 매개변수가 {'1': '3', '2': '4', ...} 처럼 질문 ID : 답변 값 형태로 되어있는 개체라고 가정
    // Object.entries() 메서드는 객체의 키-값 쌍을 배열로 반환
    for (const [qid, value] of Object.entries(answers)) {
        // qid가 'q1' 형태면 숫자만 추출
        const numId = Number(qid.replace(/^q/, ""));
        result[qid] = reverseIds.includes(numId) ? reverseScore(Number(value)) : Number(value);
    }
    return result;
}

// 섹션별 통계 정보
export const SectionStats =  {
    "암 이후 내 몸의 변화": { mean: 3.09, sd: 0.95 },
    "건강한 삶을 위한 관리": { mean: 3.63, sd: 0.76 },
    "회복을 도와주는 사람들": { mean: 3.84, sd: 0.94 },
    "심리적 부담": { mean: 3.08, sd: 0.91 },
    "사회적 삶의 부담": { mean: 3.39, sd: 1.20 },
    "암 이후 탄력성": { mean: 4.28, sd: 0.72 },
    "전체 평균 (암 생존자 건강관리)": { mean: 3.46, sd: 0.65 }
};

// T-점수별 Cut-off 기준 (이미지 표 기준)
export const CutoffScores = {
    "암 이후 내 몸의 변화": { high: 40, low: 60 },        // ≤40: 고위험, 40초과~60: 주의, >60: 저위험
    "건강한 삶을 위한 관리": { high: 40, low: 60 },
    "회복을 도와주는 사람들": { high: 40, low: 60 },
    "심리적 부담": { high: 40, low: 60 },
    "사회적 삶의 부담": { high: 40, low: 60 },
    "암 이후 탄력성": { high: 40, low: 60 },
    "전체 평균 (암 생존자 건강관리)": { high: 40, low: 60 }
};

// T-점수 변환 함수 (평균 50, 표준편차 10)
export function newScore(sectionName, userScore) {
    const stat = SectionStats[sectionName];
    if (!stat || typeof userScore !== 'number' || isNaN(userScore)) return null;
    
    // Z점수 계산: (개인 점수 - 평균) / 표준편차
    const z_score = (userScore - stat.mean) / stat.sd;
    
    // T점수 계산: (Z점수 * 10) + 50
    return Math.round((z_score * 10) + 50);
}

// 점수별 집단 분류 함수 (T-점수 기준 Cut-off 적용)
export function getRiskGroup(sectionName, meanScore) {
    const stat = SectionStats[sectionName];
    if (!stat || typeof meanScore !== 'number' || isNaN(meanScore)) return null;
    
    // 먼저 T-점수로 변환
    const tScore = newScore(sectionName, meanScore);
    if (tScore === null) return null;
    
    // Cut-off 기준 가져오기
    const cutoff = CutoffScores[sectionName];
    if (!cutoff) return null;
    
    // T-점수 기준으로 집단 분류
    if (tScore <= cutoff.high) return "고위험집단";        // ≤40
    if (tScore <= cutoff.low) return "주의집단";           // 40초과~60
    return "저위험집단";                                  // >60
}

// 설문조사 결과(집단)에 따른 **고정** 코멘트 
export const Comments = {
  patient: {
    "고위험집단": "🩺검사 결과를 보니 도움이 필요해 보여요. 혹시 불편한 점이 있으면 언제든 편하게 전문가와 상담해 보세요. 함께 곁에서 도와드릴게요❤️",
    "주의집단": "주기적인 점검과 관심이 필요합니다. 건강 상태를 꾸준히 확인해 주세요.😊",
    "저위험집단": "현재 양호한 상태를 유지하고 있습니다🌟 지금처럼 건강을 잘 관리해 주세요.계속 응원할게요🎉👍"
  },
  socialWorker: {
    "고위험집단": "환자가 고위험집단에 해당합니다. 추가적인 개입 및 전문 상담 연계가 필요합니다.",
    "주의집단": "환자가 주의집단에 해당합니다. 정기적인 모니터링과 예방적 지원이 권장됩니다.",
    "저위험집단": "환자가 저위험집단에 해당합니다. 현재 상태를 유지할 수 있도록 지속적인 격려가 필요합니다."
  }
};

// 메인 코멘트만 반환
export function getPatientComment(group) {
  return Comments.patient[group] || "";
}

// 12-1 문항 선택지가 1) 이런식으로 되어있는데 텍스트만 필요하므로 1)이런거 제거
const stripPrefix = (s = "") => s.replace(/^[0-9]+\)\s*/, "");

// 13-1 문항 선택에 따라 코멘트가 달라져야 하므로 세부 문항별 코멘트 추가
const SUB13 = [
  { id:'q13_1_1', text:'조미료 섭취를 줄인다.',            comment:"나트륨·조미료 섭취를 조금 더 줄여 보세요." },
  { id:'q13_1_2', text:'식품의 신선도를 중요시한다.',      comment:"신선한 식재료를 선택하면 건강에 도움이 됩니다!" },
  { id:'q13_1_3', text:'채식 및 과일 위주의 식습관을 한다.', comment:"🥗 채소·과일 섭취를 늘려 보세요." },
  { id:'q13_1_4', text:'육류 섭취를 조절한다.',            comment:"붉은 고기 섭취를 줄이고, 살코기·어류로 대체해 보세요." },
  { id:'q13_1_5', text:'탄수화물 섭취를 조절한다.',        comment:"정제 탄수화물 대신 통곡물을 선택해 보세요." },
  { id:'q13_1_6', text:'항암식품을 먹는다.',               comment:"항암식품을 꾸준히 섭취해 보세요." }
];

 // Q10, Q12-1 조건 추가
const BASE_RULES = [
  { id:'exercise',
    condition:a=>[1,2].includes(Number(a.q10)),
    comment:"💪 규칙적인 운동을 해보세요! 가벼운 걷기부터 시작해도 좋아요.",
    style:"info" }
];

  // 13-1 조건 추가
const DIET_RULES = SUB13.map(({ id, comment }) => ({
  id,
  condition: (a) => {
    const v = Number(a[id]);        // 1~5점
    return v && v <= 3;             // 1·2·3이면 true
  },
  comment,
  style: "warning"
}));

// 조건 테이블 - 모든 룰을 모아놓은 배열
const FEEDBACK_RULES = [
  /* 상담 권장 룰 (id: counselling) */
  // 1) Q12-1 문항이 1·2 → 상담 권장
  // 섹션 4(심리적 부담) 고위험집단 → 상담 권장
  {
    id: "counselling",
    condition: (a, _mean, risk) => {
      // 1) 12-1 이유 조건
      const reason12 = Array.isArray(a.q12_reasons) &&
        ["무엇을 해야 할지 몰라서",
         "건강관리 자체를 스트레스라고 생각해서",
         "의지가 없어서"]
        .some(t => a.q12_reasons.map(s=>s.replace(/^[0-9]+\)\s*/,""))
          .includes(t));

      // 2) 섹션4(심리적 부담) 고위험
      const psychHigh = risk?.psychologicalBurden === "고위험집단";

      return reason12 || psychHigh;          // 둘 중 하나면 true
    },
    comment: "참여자님은 사회복지사나 상담가와의 상담을 강력 권장합니다🚨",
    style: "error"
  },
  /* 섹션 6(암 이후 탄력성) 전용 RULES */
  // 6-A. 고위험집단
  {
    id: "resilience_high",
    condition: (answers, _mean, risk) =>
      risk?.resilience === "고위험집단",
    comment:
      "🚨 회복 탄력성이 낮게 평가되었습니다. 전문가와 상의해 심리·정서적 지원을 받아보세요!",
    style: "error"
  },
  // 6-B. 주의집단
  {
    id: "resilience_mid",
    condition: (answers, _mean, risk) =>
      risk?.resilience === "주의집단",
    comment:
      "💪 회복 탄력성을 높일 수 있도록 스트레스 관리와 규칙적인 생활에 조금 더 힘써보세요!",
    style: "warning"
  },
  // 6-C. 저위험집단
  {
    id: "resilience_low",
    condition: (answers, _mean, risk) =>
      risk?.resilience === "저위험집단",
    comment:
      "🌟 훌륭합니다! 현재의 긍정적인 회복 탄력성을 계속 유지해 보세요. 응원합니다!",
    style: "success"
  },
  // ...나머지 RULES 그대로...
  ...DIET_RULES,
  /* 7-A. 암 이후 '절주' 문항이 3·4·5 → 금주 권장 */
  {
    id: "alcohol_warning",
    condition: (a) => {
      const v = Number(a.q32);          // "3" → 3
      return v <= 3;                    // 1·2·3이면 true
    },
    comment: "🍺 술은 암 재발 위험을 높일 수 있습니다. 금주를 권장합니다.",
    style: "warning"
  },

  /* 7-B. 암 이후 '금연' 문항이 1·2·3 → 금연 권장 */
  {
    id: "smoke_warning",
    condition: (a) => {
      const v = Number(a.q33);
      return v <= 3;
    },
    comment: "🚭 담배는 암 재발 위험을 높일 수 있습니다. 금연을 권장합니다.",
    style: "warning"
  }
];

// answers -> 코멘트 배열 반환
// answers: 설문 응답 객체 ,mean : 섹션별 평균 점수, risk: 섹션별 집단 분류를 담은 객체를 전달
export function getAdditionalFeedback(answers={}, mean={}, risk={}) {
  return FEEDBACK_RULES
  // 1) 조건 검사
    .filter(r => r.condition(answers, mean, risk))
    // 2) { text: comment, style } 형태로 매핑
    .map(r => ({ text:r.comment, style:r.style }));
}
