#!/usr/bin/env python3
"""
scripts/collector_gichul7.py
공기출(0gichul.com)에서 7급 전산직 소프트웨어공학 기출문제 본문 및 공인 정답표를 수집합니다.
"""

import html
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.request

TARGET_POSTS = [
    {"id": "92873926", "title": "2022 국가직 7급 2차", "dap_srl": "93549085"},
    {"id": "65445772", "title": "2021 국가직 7급 2차", "dap_srl": "65445774"},
    {"id": "58102994", "title": "2020 국가직 7급", "dap_srl": "58102996"},
    {"id": "57052671", "title": "2019 국가직 7급", "dap_srl": "57052673"},
    {"id": "56551542", "title": "2018 국가직 7급", "dap_srl": "56551544"},
]

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "gichul7_questions.json")

def parse_post_questions(doc_id, title):
    url = f"https://0gichul.com/{doc_id}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw_html = resp.read().decode("utf-8")

    # Extract answers from body if present or DAP links
    m_body = re.search(rf"<div[^>]*class=[\"'][^\"']*document_{doc_id}[^\"']*[\"'][^>]*>(.*?)</div>\s*<!--\s*After\s*Content\s*-->", raw_html, re.DOTALL)
    body_html = m_body.group(1) if m_body else raw_html

    # Clean text
    text = re.sub(r"<br\s*/?>", "\n", body_html)
    text = re.sub(r"</p>", "\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)

    # Split by "문 1.", "문 2.", etc.
    pattern = re.compile(r"문\s*(\d+)\.\s*")
    matches = list(pattern.finditer(text))
    if not matches:
        return []

    questions = []
    for i in range(len(matches)):
        q_num = int(matches[i].group(1))
        start_idx = matches[i].end()
        end_idx = matches[i+1].start() if i + 1 < len(matches) else len(text)
        block = text[start_idx:end_idx].strip()

        # Try to parse choices ①, ②, ③, ④
        choice_p = re.compile(r"([①②③④])\s*")
        c_matches = list(choice_p.finditer(block))
        choices = []
        if len(c_matches) == 4:
            q_stem = block[:c_matches[0].start()].strip()
            for c_idx in range(4):
                c_start = c_matches[c_idx].end()
                c_end = c_matches[c_idx+1].start() if c_idx + 1 < 4 else len(block)
                c_text = block[c_start:c_end].strip()
                choices.append({
                    "number": c_idx + 1,
                    "text": c_text,
                    "is_correct": False
                })
        else:
            q_stem = block

        questions.append({
            "source": "공기출_7급",
            "paper_id": doc_id,
            "paper_name": title,
            "question_num": q_num,
            "question": q_stem,
            "raw_block": block,
            "choices": choices,
            "answer": None
        })

    # Detect book type (가/나/다/라/마)
    book_type = None
    book_m = re.search(r"([가나다라마])\s*책형", text)
    if book_m:
        book_type = book_m.group(1)

    # Try to find DAP PDF link
    dap_m = re.search(r"<a[^>]*href=[\"']([^\"']*procFileDownload[^\"']*)[\"'][^>]*>\s*정답\s*</a>", raw_html)
    if dap_m:
        dap_url = "https://0gichul.com" + dap_m.group(1).replace("&amp;", "&")
        answers = extract_answers_from_pdf(dap_url, book_type)
        if answers:
            for q in questions:
                if q["question_num"] <= len(answers):
                    ans = answers[q["question_num"] - 1]
                    q["answer"] = ans
                    if q["choices"] and 1 <= ans <= len(q["choices"]):
                        q["choices"][ans - 1]["is_correct"] = True

    return questions

def extract_answers_from_pdf(pdf_url, book_type=None):
    try:
        req = urllib.request.Request(pdf_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            pdf_bytes = resp.read()
        
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(pdf_bytes)
            f_path = f.name

        proc = subprocess.run(["pdftotext", "-layout", f_path, "-"], capture_output=True, text=True)
        if os.path.exists(f_path):
            os.remove(f_path)
        
        lines = proc.stdout.split("\n")
        for i, line in enumerate(lines):
            if "소프트웨어공학" in line:
                # 1) Same line numbers
                tokens = line.split()
                nums = [int(t) for t in tokens if t.isdigit() and 1 <= int(t) <= 4]
                if len(nums) >= 20:
                    return nums[:25]
                # 2) Check surrounding lines for matching book type
                for offset in [-1, 1, 2]:
                    if 0 <= i + offset < len(lines):
                        cand_line = lines[i + offset]
                        cand_tokens = cand_line.split()
                        cand_nums = [int(t) for t in cand_tokens if t.isdigit() and 1 <= int(t) <= 4]
                        if len(cand_nums) >= 20:
                            if book_type and book_type in cand_tokens:
                                return cand_nums[:25]
                            elif not book_type:
                                return cand_nums[:25]
                # If book_type was specified but not matched strictly, take the first row with >=20 nums
                for offset in [-1, 1]:
                    if 0 <= i + offset < len(lines):
                        cand_line = lines[i + offset]
                        cand_tokens = cand_line.split()
                        cand_nums = [int(t) for t in cand_tokens if t.isdigit() and 1 <= int(t) <= 4]
                        if len(cand_nums) >= 20:
                            return cand_nums[:25]
    except Exception as e:
        print(f"Failed to extract answers from PDF: {e}")
    return []

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    all_questions = []

    print("[*] 공기출 7급 소프트웨어공학 기출 수집 시작...")
    for target in TARGET_POSTS:
        try:
            print(f" -> 수집 중: {target['title']} ({target['id']})...", end=" ")
            qs = parse_post_questions(target["id"], target["title"])
            print(f"{len(qs)}문항 수집 (정답 매핑: {sum(1 for q in qs if q['answer'] is not None)}개)")
            all_questions.extend(qs)
            time.sleep(0.5)
        except Exception as e:
            print(f"실패: {e}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)

    print(f"[+] 총 {len(all_questions)}개 7급 문항 수집 완료 -> {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
