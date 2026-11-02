/**
 * 명탐정 코난 '검은 조직' 주류 기반 코드명 풀
 */
export const CONAN_CODENAMES = [
  '럼',
  '진',
  '워커',
  '베르무트',
  '버본',
  '라이',
  '키르',
  '치안티',
  '코른',
  '테킬라',
  '스카치',
  '칼바도스',
  '아이리시',
  '큐라소',
  '피스코',
] as const;

export type ConanCodename = (typeof CONAN_CODENAMES)[number];

/**
 * 코드명 1종을 무작위 추출한다.
 */
export function getRandomCodename(): ConanCodename {
  const index = Math.floor(Math.random() * CONAN_CODENAMES.length);
  return CONAN_CODENAMES[index];
}

/**
 * 주어진 이름이 코난 코드명 풀에 속하는지 판별한다.
 */
export function isCodename(name: string): boolean {
  return CONAN_CODENAMES.includes(name.trim() as ConanCodename);
}
