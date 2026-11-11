#!/usr/bin/env python3
"""
scripts/collector_exambomb.py
ExamBomb에서 정보처리기사 필기 기출문제 및 정답을 전수 수집하여 정형 JSON으로 저장합니다.
"""

import json
import os
import re
import sys
import time
import urllib.request

EXAMBOMB_PAPERS = [
    (1, "2022년 1회"),
    (2, "2022년 2회"),
    (4, "2021년 3회"),
    (5, "2021년 2회"),
    (6, "2021년 1회"),
    (7, "2020년 4회"),
    (8, "2020년 3회"),
    (9, "2020년 1회"),
]

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "exambomb_questions.json")

def fetch_paper(paper_id, paper_name):
    url = f"https://www.exambomb.com/test/pastQuestion/open/{paper_id}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode("utf-8")

    m = re.search(r"<script id=[\"']__NEXT_DATA__[\"'] type=[\"']application/json[\"']>(.*?)</script>", html)
    if not m:
        raise ValueError(f"Could not find __NEXT_DATA__ in {url}")

    data = json.loads(m.group(1))
    props = data.get("props", {}).get("pageProps", {})
    raw_questions = props.get("pastOpenTestPaper", [])

    parsed_list = []
    for item in raw_questions:
        chapter_info = item.get("chapter", {}) or {}
        chapter_name = chapter_info.get("chapterName", "기타")
        
        # choices & answer
        choices = []
        answer_num = None
        for idx, opt in enumerate(item.get("questionDetails", []), start=1):
            ex_text = opt.get("example") or ""
            choices.append({
                "number": idx,
                "text": str(ex_text).strip(),
                "is_correct": opt.get("answerYn") == "Y",
                "select_count": opt.get("selectCnt", 0)
            })
            if opt.get("answerYn") == "Y":
                answer_num = idx

        content_text = item.get("content") or ""
        explain_text = item.get("explain") or ""
        comment_text = item.get("comment") or ""

        parsed_list.append({
            "source": "ExamBomb_정처기",
            "paper_id": paper_id,
            "paper_name": paper_name,
            "question_id": item.get("questionId"),
            "chapter_id": item.get("chapterId"),
            "chapter_name": chapter_name,
            "question": str(content_text).strip(),
            "choices": choices,
            "answer": answer_num,
            "explain": str(explain_text).strip(),
            "comment": str(comment_text).strip()
        })

    return parsed_list

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    all_questions = []

    print(f"[*] 정보처리기사 필기 ExamBomb 수집 시작 ({len(EXAMBOMB_PAPERS)}회차)...")
    for pid, name in EXAMBOMB_PAPERS:
        try:
            print(f" -> 수집 중: {name} (ID: {pid})...", end=" ")
            questions = fetch_paper(pid, name)
            print(f"{len(questions)}문항 완료")
            all_questions.extend(questions)
            time.sleep(0.5)
        except Exception as e:
            print(f"실패: {e}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)

    print(f"[+] 총 {len(all_questions)}개 문항 수집 완료 -> {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
