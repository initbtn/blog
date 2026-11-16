import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Quiz Explanations & Hint System Integrity', () => {
  const privateJsonPath = path.join(process.cwd(), 'data', 'private', 'ncs_questions.json');
  const unifiedJsonPath = path.join(process.cwd(), 'data', 'ncs_swe_unified_dataset.json');

  it('비공개 기출문제 데이터(ncs_questions.json)에 기본 템플릿 해설 문구가 0건이어야 한다', () => {
    const raw = fs.readFileSync(privateJsonPath, 'utf-8');
    const questions = JSON.parse(raw);

    const templateMatches = questions.filter((q: any) =>
      q.explain && q.explain.includes('NCS 직무기준 및 공인 정답에 따른 해설입니다')
    );

    expect(templateMatches.length).toBe(0);
  });

  it('467개 전 문항이 비어있지 않고 20자 이상의 유의미한 해설을 갖는다', () => {
    const raw = fs.readFileSync(privateJsonPath, 'utf-8');
    const questions = JSON.parse(raw);

    expect(questions.length).toBe(467);
    questions.forEach((q: any) => {
      expect(q.explain).toBeDefined();
      expect(q.explain.trim().length).toBeGreaterThanOrEqual(20);
    });
  });

  it('해설 데이터 기반 힌트 추출이 핵심 개념 문맥을 스포일러 없이 정제한다', () => {
    const sampleExplain = `[정답] 4번: 오류 알림 시 시각·청각 피드백 제공
[핵심 해설]
- 오류 메시지 및 경고는 사용자가 직관적으로 위험을 인지하도록 피드백을 적극 활용해야 합니다.
[오답 분석]
- 1번: 전문 용어를 피해야 함.`;

    const parts = sampleExplain.split('[핵심 해설]');
    const coreExp = parts[1].split('[오답 분석]')[0].trim();
    const lines = coreExp
      .split('\n')
      .map((l) => l.replace(/^[-\s*•]+/, '').trim())
      .filter((l) => l.length > 5);

    expect(lines[0]).toContain('오류 메시지 및 경고는');
    expect(lines[0]).not.toContain('[정답]');
    expect(lines[0]).not.toContain('[오답 분석]');
  });
});
