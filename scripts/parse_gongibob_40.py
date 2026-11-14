#!/usr/bin/env python3
import json
import os
import re
from bs4 import BeautifulSoup

RAW_HTML_PATH = os.path.join(os.path.dirname(__file__), "raw_40_questions.html")
PRIVATE_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "private", "ncs_questions.json")

def categorize_question(desc, text_detail):
    combined = (desc + " " + text_detail).lower()
    
    if any(k in combined for k in ["스크럼", "scrum", "스프린트", "tdd", "sdlc", "익스트림", "xp", "애자일"]):
        return "M1", "1-1" if "sdlc" in combined else "1-2"
    if any(k in combined for k in ["자료흐름도", "dfd", "자료사전", "와이어프레임", "유한상태", "밀리", "무어", "ui", "oui"]):
        return "M2", "2-2" if any(k in combined for k in ["dfd", "자료사전"]) else "2-1"
    if any(k in combined for k in ["응집도", "결합도", "리팩토링", "refactoring", "패턴", "pattern", "프록시", "브릿지", "facade", "flyweight", "다형성"]):
        if any(k in combined for k in ["패턴", "pattern", "프록시", "브릿지", "facade", "flyweight"]):
            return "M3", "3-3"
        if any(k in combined for k in ["리팩토링", "refactoring", "다형성"]):
            return "M3", "3-2"
        return "M3", "3-1"
    if any(k in combined for k in ["순환복잡도", "cyclomatic", "mccabe", "커버리지", "coverage", "페어와이즈", "pairwise", "블랙박스", "black-box", "검사", "인터페이스 구현 검증"]):
        return "M4", "4-1" if any(k in combined for k in ["순환복잡도", "cyclomatic", "mccabe", "커버리지"]) else "4-2"
    if any(k in combined for k in ["pert", "cpm", "man-month", "인－월", "wbs", "일정"]):
        return "M5", "5-1" if any(k in combined for k in ["pert", "cpm"]) else "5-2"
    if any(k in combined for k in ["형상 관리", "git", "github", "ccb", "적응유지보수", "유지보수"]):
        return "M8", "8-1"
    if any(k in combined for k in ["품질", "감리", "워크스루", "신뢰성", "가용성", "mtbf", "안전성"]):
        return "M9", "9-1"
    
    return "M4", "4-2"

def parse_html():
    if not os.path.exists(RAW_HTML_PATH):
        print(f"Error: {RAW_HTML_PATH} does not exist.")
        return []

    with open(RAW_HTML_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    cntboxes = soup.find_all("div", class_="cntbox")
    print(f"Found {len(cntboxes)} question boxes.")

    parsed = []
    for idx, box in enumerate(cntboxes, 1):
        qdiv = box.find("div", class_="qdiv")
        if not qdiv:
            continue
        
        num_tag = qdiv.find("p", class_="number")
        q_num = int(num_tag.get_text(strip=True)) if num_tag else idx
        
        desc_tag = qdiv.find("p", class_="desc")
        q_desc = desc_tag.get_text(strip=True) if desc_tag else ""

        text_div = qdiv.find("div", class_="text")
        q_text = ""
        if text_div:
            # Clean up mathjax and redundant tags
            for s in text_div.find_all(["span", "script"]):
                if s.get("class") and "MJX" in " ".join(s.get("class")):
                    s.decompose()
            q_text = text_div.get_text("\n", strip=True)

        full_question = q_desc
        if q_text:
            full_question += f"\n\n[제시문]\n{q_text}"

        choices = []
        example_div = qdiv.find("div", class_="example")
        if example_div:
            c_tags = example_div.find_all("p")
            for c_idx, c_p in enumerate(c_tags, 1):
                c_num_span = c_p.find("span", class_="number")
                c_num = int(c_num_span.get_text(strip=True)) if c_num_span else c_idx
                if c_num_span:
                    c_num_span.decompose()
                c_text = c_p.get_text(strip=True)
                choices.append({
                    "number": c_num,
                    "text": c_text,
                    "is_correct": False
                })

        # Answer & Explain
        exp_div = box.find("div", class_="explain")
        ans_num = 1
        explain_text = ""
        if exp_div:
            ans_tag = exp_div.find("p", class_="correct_answer")
            if ans_tag:
                m = re.search(r"\d+", ans_tag.get_text())
                if m:
                    ans_num = int(m.group())
            for s in exp_div.find_all(["span", "script"]):
                if s.get("class") and "MJX" in " ".join(s.get("class")):
                    s.decompose()
            explain_text = exp_div.get_text("\n", strip=True)

        for c in choices:
            if c["number"] == ans_num:
                c["is_correct"] = True

        mod, sub = categorize_question(q_desc, q_text)

        item = {
            "id": f"GONGIBOB_{q_num:02d}",
            "source": "공무원·공기업 전공기출",
            "exam_title": "소프트웨어공학 핵심 기출 40제",
            "chapter": "소프트웨어공학",
            "ncs_module": mod,
            "subtopic_id": sub,
            "ncs_title": f"NCS {mod} 직무영역",
            "question": full_question,
            "choices": choices,
            "answer": ans_num,
            "explain": explain_text
        }
        parsed.append(item)

    return parsed

def main():
    parsed = parse_html()
    print(f"Parsed {len(parsed)} questions successfully.")
    
    if not os.path.exists(PRIVATE_DATA_PATH):
        print(f"Error: {PRIVATE_DATA_PATH} not found.")
        return

    with open(PRIVATE_DATA_PATH, "r", encoding="utf-8") as f:
        existing = json.load(f)

    existing_ids = {q["id"] for q in existing}
    added_count = 0
    for p in parsed:
        if p["id"] not in existing_ids:
            existing.append(p)
            added_count += 1

    with open(PRIVATE_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f"Merged {added_count} new questions. Total in private DB: {len(existing)}")

if __name__ == "__main__":
    main()
