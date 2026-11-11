#!/usr/bin/env python3
"""
scripts/merge_ncs_dataset.py
ExamBomb(정보처리기사 1·2과목) + 공기출 7급 전산직 소프트웨어공학 기출 데이터를
NCS 소프트웨어개발 8대 능력단위 모듈(M1~M8)로 정밀하게 1:1 매핑하여 통합 데이터셋을 생성합니다.
"""

import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
EXAMBOMB_FILE = os.path.join(DATA_DIR, "exambomb_questions.json")
GICHUL7_FILE = os.path.join(DATA_DIR, "gichul7_questions.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "ncs_swe_unified_dataset.json")

NCS_MODULES = {
    "M1": {
        "title": "개발 프로세스 & 방법론",
        "keywords": [
            "방법론", "프로세스", "애자일", "agile", "스크럼", "scrum", "폭포수", "나선형",
            "sdlc", "프로토타입", "생명주기", "린", "lean", "칸반", "스프린트", "익스트림",
            "일일 스크럼", "스프린트 회고", "스프린트 리뷰", "백로그", "fdd", "tdd"
        ]
    },
    "M2": {
        "title": "요구사항 분석 (Requirements)",
        "keywords": [
            "요구사항", "요구공학", "유스케이스", "use case", "dfd", "액터", "비기능",
            "기능 요구", "명세서", "정형명세", "도출", "추출", "검증", "자료흐름도",
            "식별자", "자료사전", "mini-spec"
        ]
    },
    "M3": {
        "title": "아키텍처 & 객체지향 설계",
        "keywords": [
            "아키텍처", "디자인 패턴", "design pattern", "패턴", "solid", "객체지향",
            "응집도", "결합도", "결합", "응집", "클래스 다이어그램", "모듈화", "상속",
            "다형성", "mvc", "mvvm", "파이프", "필터", "gof", "자료 결합", "내용 결합",
            "제어 결합", "스탬프 결합", "공통 결합", "외부 결합", "기능적 응집", "순차적 응집",
            "교환적 응집", "절차적 응집", "시간적 응집", "논리적 응집", "우연적 응집"
        ]
    },
    "M4": {
        "title": "소프트웨어 테스팅 & 품질보증",
        "keywords": [
            "테스트", "testing", "화이트박스", "블랙박스", "커버리지", "인스펙션",
            "워크스루", "결함", "v-모델", "페어와이즈", "경계값", "동등분할", "단위 테스트",
            "통합 테스트", "시스템 테스트", "회귀 테스트", "스텁", "드라이버", "테스트 케이스",
            "오라클", "순환 복잡도", "mccabe", "제어 흐름"
        ]
    },
    "M5": {
        "title": "프로젝트 관리 (PM)",
        "keywords": [
            "프로젝트", "일정", "비용", "cpm", "pert", "cocomo", "기능점수", "fp",
            "man-month", "맨먼스", "wbs", "간트", "임계경로", "위험관리", "간트차트",
            "공정표", "임계 경로", "여유 시간", "slack"
        ]
    },
    "M6": {
        "title": "유지보수 & 형상관리 & 패키징",
        "keywords": [
            "형상", "형상관리", "버전", "git", "svn", "패키징", "유지보수", "리팩터링",
            "재공학", "역공학", "빌드", "배포", "baseline", "베이스라인", "형상 통제",
            "릴리스", "완전 유지보수", "적응 유지보수", "교정 유지보수", "예방 유지보수"
        ]
    },
    "M7": {
        "title": "품질 모델 & 공학 표준",
        "keywords": [
            "품질", "iso", "cmmi", "spice", "9126", "25000", "14598", "12207", "25010",
            "신뢰성", "가용성", "효율성", "사용성", "유지보수성", "이식성", "성숙도",
            "프로세스 개선", "품질 특성"
        ]
    },
    "M8": {
        "title": "시큐어코딩 & 구현 보안",
        "keywords": [
            "보안", "시큐어코딩", "취약점", "암호", "xss", "sql 인젝션", "접근제어",
            "인증", "인가", "세션", "동시성", "교착상태", "deadlock", "레이스 컨디션",
            "버퍼 오버플로우", "owasp"
        ]
    }
}

def classify_ncs_module(question_text, choices_text="", default_module="M1"):
    # Only classify against clean question stem and choices! (Never raw HTML context)
    full_text = f"{question_text} {choices_text}".lower()
    scores = {m: 0 for m in NCS_MODULES}

    # Word boundary regex for short english acronyms like 'xp'
    for m_code, m_info in NCS_MODULES.items():
        for kw in m_info["keywords"]:
            kw_low = kw.lower()
            if kw_low in full_text:
                scores[m_code] += full_text.count(kw_low)

    best_module = max(scores, key=scores.get)
    if scores[best_module] == 0:
        return default_module
    return best_module

def main():
    unified_dataset = []

    # 1. ExamBomb questions (Focus on SWE: Chapter 1 & Chapter 2)
    if os.path.exists(EXAMBOMB_FILE):
        with open(EXAMBOMB_FILE, "r", encoding="utf-8") as f:
            exambomb_data = json.load(f)
        
        for q in exambomb_data:
            ch_name = q.get("chapter_name", "")
            if ch_name not in ["소프트웨어 설계", "소프트웨어 개발"]:
                continue
            
            c_text = " ".join(c.get("text", "") for c in q.get("choices", []))
            mod = classify_ncs_module(
                question_text=q.get("question", ""),
                choices_text=c_text,
                default_module="M1" if ch_name == "소프트웨어 설계" else "M4"
            )

            unified_dataset.append({
                "id": f"EXAMBOMB_{q.get('question_id')}",
                "source": "정보처리기사",
                "exam_title": q.get("paper_name"),
                "chapter": ch_name,
                "ncs_module": mod,
                "ncs_title": NCS_MODULES[mod]["title"],
                "question": q.get("question"),
                "choices": q.get("choices"),
                "answer": q.get("answer"),
                "explain": q.get("explain")
            })

    # 2. 7급 전산직 questions
    if os.path.exists(GICHUL7_FILE):
        with open(GICHUL7_FILE, "r", encoding="utf-8") as f:
            gichul7_data = json.load(f)

        for q in gichul7_data:
            c_text = " ".join(c.get("text", "") for c in q.get("choices", []))
            mod = classify_ncs_module(
                question_text=q.get("question", ""),
                choices_text=c_text,
                default_module="M1"
            )

            unified_dataset.append({
                "id": f"GICHUL7_{q.get('paper_id')}_{q.get('question_num')}",
                "source": "공무원 7급",
                "exam_title": q.get("paper_name"),
                "chapter": "소프트웨어공학",
                "ncs_module": mod,
                "ncs_title": NCS_MODULES[mod]["title"],
                "question": q.get("question"),
                "choices": q.get("choices"),
                "answer": q.get("answer")
            })

    # Summary
    module_stats = {m: 0 for m in NCS_MODULES}
    source_stats = {}
    for item in unified_dataset:
        module_stats[item["ncs_module"]] += 1
        source_stats[item["source"]] = source_stats.get(item["source"], 0) + 1

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(unified_dataset, f, ensure_ascii=False, indent=2)

    print("=" * 60)
    print(f"[*] NCS 정밀 분류 통합 기출 데이터셋 빌드 완료: 총 {len(unified_dataset)}문항")
    print("=" * 60)
    print("[+] 출처별 분포:")
    for s, count in source_stats.items():
        print(f"  - {s}: {count}문항")
    print("\n[+] NCS 8대 모듈 정밀 매핑 결과:")
    for m, count in module_stats.items():
        print(f"  - [{m}] {NCS_MODULES[m]['title']}: {count}문항")
    print(f"\n저장 경로: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
