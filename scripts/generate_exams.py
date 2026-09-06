#!/usr/bin/env python3
"""
generate_exams.py - Dung Gemini API de generate de thi JLPT theo format jlpt_exams.json

Usage:
  python scripts/generate_exams.py --level N5 --year 2019 --month 7
  python scripts/generate_exams.py --level N4 --year 2019 --month 7
  python scripts/generate_exams.py --level N3 --year 2019 --month 7
  python scripts/generate_exams.py --level N2 --year 2020 --month 7
  python scripts/generate_exams.py --level N1 --year 2020 --month 7
"""

import json
import os
import sys
import time
import argparse
import urllib.request
import urllib.error
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
TARGET_FILE = PROJECT_ROOT / "src" / "main" / "resources" / "data" / "jlpt_exams.json"


def load_env():
    env_file = PROJECT_ROOT / ".env"
    env = {}
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


ENV = load_env()
GEMINI_API_KEY = ENV.get("GEMINI_API_KEY", os.environ.get("GEMINI_API_KEY", ""))
GEMINI_MODEL = ENV.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_BASE_URL = ENV.get("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com")

if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found in .env", file=sys.stderr)
    sys.exit(1)


EXAM_SPECS = {
    "N5": {
        "totalTimeMinutes": 60,
        "description_template": "Đề thi chính thức kỳ thi Năng lực Nhật ngữ JLPT N5 đợt tháng {month}/{year}. Cấp độ nhập môn tiếng Nhật.",
        "sections": [
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 1,
                "title": "Mondai 1: Đọc chữ Hán",
                "instruction": "\u554f\u984c1\u3000\uff3f\uff3f\uff3fの言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 1, "targetCount": 7,
                "descript": "Cau hoi doc kanji N5: chon cach doc hiragana dung cho tu gach chan. 4 phuong an la hiragana. Tu vung N5 don gian: nui, nuoc, sach, nguoi, nuoc Nhat, hoc sinh, gia dinh"
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 2,
                "title": "Mondai 2: Viết chữ Hán",
                "instruction": "\u554f\u984c2\u3000\uff3f\uff3f\uff3fの言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 7, "orderIndex": 2, "targetCount": 6,
                "descript": "Cau hoi viet kanji N5: chon cach viet kanji dung cho tu hiragana gach chan. 4 phuong an la cac kanji khac nhau. Tu N5."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 3,
                "title": "Mondai 3: Điền từ vào chỗ trống",
                "instruction": "\u554f\u984c3\u3000\uff08\u3000\u3000\uff09に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 3, "targetCount": 10,
                "descript": "Cau hoi dien tu N5: chon tu dung dien vao cho trong trong cau. Tu vung N5 co ban."
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 6,
                "title": "Mondai 6: Điền ngữ pháp thích hợp cho câu",
                "instruction": "\u554f\u984c6\u3000次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 4, "targetCount": 10,
                "descript": "Cau hoi ngu phap N5: dien tro tu, mau cau co ban N5 nhu: wa, ga, wo, ni, de, he, to, mo, ka, ne, yo, kara, made, node, noni, nagara"
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 7,
                "title": "Mondai 7: Sắp xếp thứ tự trong câu (★)",
                "instruction": "\u554f\u984c7\u3000次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 7, "orderIndex": 5, "targetCount": 5,
                "descript": "Cau hoi sap xep tu N5. questionText dang: 'Phan dau cau _____ _____ _star_ _____ phan cuoi cau'. 4 phuong an la 4 tu can sap xep, correctOption la vi tri dau sao."
            }
        ]
    },
    "N4": {
        "totalTimeMinutes": 85,
        "description_template": "Đề thi chính thức kỳ thi Năng lực Nhật ngữ JLPT N4 đợt tháng {month}/{year}. Trình độ sơ-trung cấp tiếng Nhật.",
        "sections": [
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 1,
                "title": "Mondai 1: Đọc chữ Hán",
                "instruction": "\u554f\u984c1\u3000\uff3f\uff3f\uff3fの言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 1, "targetCount": 9,
                "descript": "Cau hoi doc kanji N4: chon cach doc dung. Kanji N4 nhu: kyuu, itai, betsu, osoi, byouin, kusuri, tenki, chizu, ongaku, undou, ryouri, sentaku, renshuu, setsumei, junbi"
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 2,
                "title": "Mondai 2: Viết chữ Hán",
                "instruction": "\u554f\u984c2\u3000\uff3f\uff3f\uff3fの言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 2, "targetCount": 6,
                "descript": "Cau hoi viet kanji N4: chon cach viet dung. Tu N4 thuong dung."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 3,
                "title": "Mondai 3: Điền từ vào chỗ trống",
                "instruction": "\u554f\u984c3\u3000\uff08\u3000\u3000\uff09に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 13, "orderIndex": 3, "targetCount": 13,
                "descript": "Cau hoi dien tu N4: tu vung va danh tu, tinh tu, dong tu N4."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 4,
                "title": "Mondai 4: Từ đồng nghĩa",
                "instruction": "\u554f\u984c4\u3000\uff3f\uff3f\uff3fの言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 7, "orderIndex": 4, "targetCount": 5,
                "descript": "Cau hoi tu dong nghia N4: chon tu co nghia gan nhat voi tu gach chan."
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 6,
                "title": "Mondai 6: Điền ngữ pháp thích hợp cho câu",
                "instruction": "\u554f\u984c6\u3000次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 13, "orderIndex": 5, "targetCount": 13,
                "descript": "Cau hoi ngu phap N4: mau cau N4 nhu ~te shimau, ~te oku, ~te aru, ~te iku/kuru, ~nagara, ~dake, ~shika~nai, ~tame ni, ~you ni, ~to omotteiru, ~tsumori, ~kamoshirenai, ~hazu da, ~sou da"
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 7,
                "title": "Mondai 7: Sắp xếp thứ tự trong câu (★)",
                "instruction": "\u554f\u984c7\u3000次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 6, "targetCount": 6,
                "descript": "Cau hoi sap xep tu N4. questionText dang: 'Phan dau _____ _____ _star_ _____ phan cuoi'. Ngu phap N4."
            }
        ]
    },
    "N3": {
        "totalTimeMinutes": 105,
        "description_template": "Đề thi chính thức kỳ thi Năng lực Nhật ngữ JLPT N3 đợt tháng {month}/{year}. Trình độ trung cấp, đọc hiểu văn bản thông thường.",
        "sections": [
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 1,
                "title": "Mondai 1: Đọc chữ Hán",
                "instruction": "\u554f\u984c1\u3000\uff3f\uff3f\uff3fの言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 12, "orderIndex": 1, "targetCount": 8,
                "descript": "Cau hoi doc kanji N3: kanji kho hon N4. N3 kanji nhu: teian, riyuu, keizai, seiji, bunka, kankyou, eikyou, kankei, henka, hatten, mondai, kaiketsu, kenkyuu, jikken, kanou, hitsuyou, juuyou"
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 2,
                "title": "Mondai 2: Viết chữ Hán",
                "instruction": "\u554f\u984c2\u3000\uff3f\uff3f\uff3fの言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 2, "targetCount": 6,
                "descript": "Cau hoi viet kanji N3."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 3,
                "title": "Mondai 3: Điền từ vào chỗ trống",
                "instruction": "\u554f\u984c3\u3000\uff08\u3000\u3000\uff09に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 15, "orderIndex": 3, "targetCount": 13,
                "descript": "Cau hoi dien tu N3: tu vung trung cap, phan biet cac tu gan nghia."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 4,
                "title": "Mondai 4: Từ đồng nghĩa",
                "instruction": "\u554f\u984c4\u3000\uff3f\uff3f\uff3fの言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 4, "targetCount": 5,
                "descript": "Cau hoi tu dong nghia N3: chon tu/cum tu co nghia gan nhat."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 5,
                "title": "Mondai 5: Cách dùng từ",
                "instruction": "\u554f\u984c5\u3000次の言葉の使い方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 5, "targetCount": 5,
                "descript": "Cau hoi cach dung tu N3: cho san mot tu, chon cau co cach dung tu do chinh xac nhat. questionText la tu cho san, 4 phuong an la 4 cau tieng Nhat."
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 6,
                "title": "Mondai 6: Điền ngữ pháp thích hợp cho câu",
                "instruction": "\u554f\u984c6\u3000次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 15, "orderIndex": 6, "targetCount": 13,
                "descript": "Cau hoi ngu phap N3: mau cau N3 nhu ~te shimau, ~tameni, ~youni, ~you ni naru, ~wake da, ~wake dewa nai, ~hazuda, ~hazuga nai, ~dake de naku, ~bakari, ~sae, ~koso, ~mono da, ~tokoro da, ~ba yokatta"
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 7,
                "title": "Mondai 7: Sắp xếp thứ tự trong câu (★)",
                "instruction": "\u554f\u984c7\u3000次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 7, "targetCount": 5,
                "descript": "Cau hoi sap xep tu N3. Format: 'Phan dau _____ _____ _star_ _____ phan cuoi'. Ngu phap N3."
            },
            {
                "sectionType": "READING", "mondaiNumber": 8,
                "title": "Mondai 8: Đọc hiểu đoạn văn",
                "instruction": "\u554f\u984c8\u3000次の文章を読んで、文章全体の内容を考えて、（1）から（4）の中に入る最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 20, "orderIndex": 8, "targetCount": 4,
                "descript": "Cau hoi dien vao cho trong trong doan van N3. Doan van khoang 250-300 chu Nhat ve chu de thong thuong (cuoc song, van hoa Nhat Ban). passageText chua doan van co cac cho trong danh so (1)(2)(3)(4). Moi cau hoi hoi tu/cum tu nao dien vao cho trong tuong ung."
            }
        ]
    },
    "N2": {
        "totalTimeMinutes": 105,
        "description_template": "Đề thi chính thức kỳ thi Năng lực Nhật ngữ JLPT N2 đợt tháng {month}/{year}. Trình độ trung-cao cấp, hiểu văn bản báo chí và tiếng Nhật thực tế.",
        "sections": [
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 1,
                "title": "Mondai 1: Đọc chữ Hán",
                "instruction": "\u554f\u984c1\u3000\uff3f\uff3f\uff3fの言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 1, "targetCount": 5,
                "descript": "Cau hoi doc kanji N2: kanji phuc tap, doc am On/Kun. N2 kanji kho: akunin, sokushin, kouken, gainen, chuushou, gutai"
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 2,
                "title": "Mondai 2: Viết chữ Hán",
                "instruction": "\u554f\u984c2\u3000\uff3f\uff3f\uff3fの言葉を漢字で書くとき、最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 7, "orderIndex": 2, "targetCount": 5,
                "descript": "Cau hoi viet kanji N2."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 3,
                "title": "Mondai 3: Cách dùng từ",
                "instruction": "\u554f\u984c3\u3000次の言葉の使い方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 3, "targetCount": 5,
                "descript": "Cau hoi cach dung tu N2: tu truu tuong, chuyen nganh don gian. questionText la tu cho san."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 4,
                "title": "Mondai 4: Điền từ vào chỗ trống",
                "instruction": "\u554f\u984c4\u3000\uff08\u3000\u3000\uff09に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 4, "targetCount": 7,
                "descript": "Cau hoi dien tu N2: tu vung trinh do cao, nhieu tu gan nghia can phan biet."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 5,
                "title": "Mondai 5: Từ đồng nghĩa",
                "instruction": "\u554f\u984c5\u3000\uff3f\uff3f\uff3fの言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 7, "orderIndex": 5, "targetCount": 5,
                "descript": "Cau hoi tu dong nghia N2."
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 6,
                "title": "Mondai 6: Điền ngữ pháp thích hợp cho câu",
                "instruction": "\u554f\u984c6\u3000次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 15, "orderIndex": 6, "targetCount": 12,
                "descript": "Cau hoi ngu phap N2: mau cau nang cao nhu ~ni tsurete, ~ni shitagatte, ~ni hanshite, ~koto naku, ~ni mo kakawarazu, ~wo tsuujite, ~ni kanshite, ~ni oite, ~ni saishite, ~wo megutte, ~ni taishite"
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 7,
                "title": "Mondai 7: Sắp xếp thứ tự trong câu (★)",
                "instruction": "\u554f\u984c7\u3000次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 7, "targetCount": 5,
                "descript": "Cau hoi sap xep tu N2. Ngu phap N2."
            },
            {
                "sectionType": "READING", "mondaiNumber": 9,
                "title": "Mondai 9: Đọc hiểu đoạn văn ngắn",
                "instruction": "\u554f\u984c9\u3000次の文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 15, "orderIndex": 8, "targetCount": 6,
                "descript": "Cau hoi doc hieu N2: doan van 300-400 chu, moi doan 3 cau hoi. passageText la doan van. questionText la cau hoi ve noi dung."
            }
        ]
    },
    "N1": {
        "totalTimeMinutes": 110,
        "description_template": "Đề thi chính thức kỳ thi Năng lực Nhật ngữ JLPT N1 đợt tháng {month}/{year}. Trình độ cao cấp, hiểu sâu tiếng Nhật ở mọi tình huống.",
        "sections": [
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 1,
                "title": "Mondai 1: Đọc chữ Hán",
                "instruction": "\u554f\u984c1\u3000\uff3f\uff3f\uff3fの言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 1, "targetCount": 6,
                "descript": "Cau hoi doc kanji N1: kanji kho, it gap. Kanji N1."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 2,
                "title": "Mondai 2: Điền từ vào chỗ trống",
                "instruction": "\u554f\u984c2\u3000\uff08\u3000\u3000\uff09に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 2, "targetCount": 7,
                "descript": "Cau hoi dien tu N1: tu vung cao cap, thanh ngu, tu Han-Nhat."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 3,
                "title": "Mondai 3: Từ đồng nghĩa",
                "instruction": "\u554f\u984c3\u3000\uff3f\uff3f\uff3fの言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 3, "targetCount": 6,
                "descript": "Cau hoi tu dong nghia N1."
            },
            {
                "sectionType": "VOCABULARY", "mondaiNumber": 4,
                "title": "Mondai 4: Cách dùng từ",
                "instruction": "\u554f\u984c4\u3000次の言葉の使い方として最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 8, "orderIndex": 4, "targetCount": 6,
                "descript": "Cau hoi cach dung tu N1: tu truu tuong, van hoc."
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 5,
                "title": "Mondai 5: Điền ngữ pháp thích hợp cho câu",
                "instruction": "\u554f\u984c5\u3000次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 15, "orderIndex": 5, "targetCount": 10,
                "descript": "Cau hoi ngu phap N1: mau cau cao cap nhu ~to wa ie, ~mono wo, ~ba koso, ~nashi ni wa, ~wo yoso ni, ~ni sokushite, ~nara iza shirazu, ~ni hikikaete, ~wo kagiri ni"
            },
            {
                "sectionType": "GRAMMAR", "mondaiNumber": 6,
                "title": "Mondai 6: Sắp xếp thứ tự trong câu (★)",
                "instruction": "\u554f\u984c6\u3000次の文の ★ に入る最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 10, "orderIndex": 6, "targetCount": 5,
                "descript": "Cau hoi sap xep tu N1. Ngu phap N1."
            },
            {
                "sectionType": "READING", "mondaiNumber": 7,
                "title": "Mondai 7: Đọc hiểu văn bản",
                "instruction": "\u554f\u984c7\u3000次の文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つ選びなさい。",
                "timeLimitMinutes": 20, "orderIndex": 7, "targetCount": 6,
                "descript": "Cau hoi doc hieu N1: van ban kho, hoc thuat. passageText la doan van 400-500 chu."
            }
        ]
    }
}


def call_gemini(prompt: str, retries: int = 8) -> str:
    url = f"{GEMINI_BASE_URL}/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    body = json.dumps({
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 4096
        }
    }).encode("utf-8")

    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url, data=body,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text
        except urllib.error.HTTPError as e:
            e.read()  # drain
            print(f"  [HTTP {e.code}] attempt {attempt+1}/{retries}", file=sys.stderr)
            if e.code in (429, 500, 503):
                wait = min(15 * (2 ** attempt), 210)
                print(f"  Retrying in {wait}s...", file=sys.stderr)
                time.sleep(wait)
            else:
                raise
        except Exception as ex:
            print(f"  Error: {ex}", file=sys.stderr)
            if attempt < retries - 1:
                time.sleep(20)
            else:
                raise
    raise RuntimeError("All retries failed")


def extract_json(text: str):
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:])
        if text.endswith("```"):
            text = text[:-3].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}", file=sys.stderr)
        print(f"Raw (first 500): {text[:500]}", file=sys.stderr)
        raise


BATCH_SIZE = 1  # 1 question per call: guaranteed no truncation


def _call_batch(level: str, month: int, year: int, sec_spec: dict, batch_count: int, batch_start: int) -> list:
    """Call Gemini for batch_count questions. Returns list of question dicts."""
    descript = sec_spec["descript"]

    prompt = (
        f"Ban la chuyen gia thi JLPT. Tao {batch_count} cau hoi JLPT {level} Thang {month}/{year}.\n"
        f"Loai: {sec_spec['title']}\n"
        f"Chi dan: {descript}\n"
        f"Bat dau tu cau so: {batch_start}\n\n"
        f"Yeu cau: cau hoi tieng Nhat chinh xac cap {level}, 4 phuong an hop ly, "
        "explanation tieng Viet ngan (1-2 cau), underlinedText la tu gach chan (Mondai 1/2/4) hoac null.\n\n"
        "Tra ve JSON object (khong phai array):\n"
        "{\n"
        f"  \"questionNumber\": {batch_start},\n"
        "  \"questionText\": \"<cau hoi tieng Nhat>\",\n"
        "  \"underlinedText\": null,\n"
        "  \"option1\": \"<lua chon 1>\",\n"
        "  \"option2\": \"<lua chon 2>\",\n"
        "  \"option3\": \"<lua chon 3>\",\n"
        "  \"option4\": \"<lua chon 4>\",\n"
        "  \"correctOption\": 1,\n"
        "  \"explanation\": \"<giai thich tieng Viet ngan>\"\n"
        "}\n"
        f"Cau so {batch_start}."
    )

    raw = call_gemini(prompt)
    parsed = extract_json(raw)
    # Could be single object or array
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict) and "questionNumber" in parsed:
        return [parsed]
    if isinstance(parsed, dict) and "questions" in parsed:
        return parsed["questions"]
    raise ValueError(f"Unexpected response structure: {list(parsed.keys()) if isinstance(parsed, dict) else type(parsed)}")


def generate_section(level: str, year: int, month: int, sec_spec: dict, start_q_num: int) -> dict:
    count = sec_spec["targetCount"]
    section_type = sec_spec["sectionType"]
    mondai_num = sec_spec["mondaiNumber"]
    descript = sec_spec["descript"]
    is_reading = section_type == "READING"

    print(f"    Generating Mondai {mondai_num} ({count} questions, start={start_q_num})...", flush=True)

    # Reading sections: single call for passage + questions together
    if is_reading:
        prompt = (
            f"Ban la chuyen gia thi JLPT. Tao 1 doan van va {count} cau hoi doc hieu "
            f"JLPT {level} Thang {month}/{year}.\n"
            f"Huong dan: {descript}\n\n"
            "YEU CAU:\n"
            "1. passageText: doan van tieng Nhat dai 250-350 chu ve chu de thong thuong (moi truong, van hoa, xa hoi).\n"
            "2. Cau hoi hoi ve noi dung, y chinh, tu/cum tu trong doan van.\n"
            "3. explanation TIENG VIET.\n\n"
            "Tra ve JSON (object, KHONG phai array):\n"
            "{\n"
            "  \"passageText\": \"<doan van tieng Nhat>\",\n"
            "  \"questions\": [\n"
            f"    {{\"questionNumber\": {start_q_num}, \"questionText\": \"...\", \"underlinedText\": null,\n"
            "     \"option1\": \"...\", \"option2\": \"...\", \"option3\": \"...\", \"option4\": \"...\",\n"
            "     \"correctOption\": 1, \"explanation\": \"...\"}},\n"
            "    ...\n"
            "  ]\n"
            "}\n"
            f"Tao {count} cau, so {start_q_num} den {start_q_num + count - 1}."
        )
        raw = call_gemini(prompt)
        data = extract_json(raw)
        qs = data.get("questions", [])
        print(f"    OK {len(qs)} q + passage for Mondai {mondai_num}", flush=True)
        return {
            "sectionType": section_type,
            "mondaiNumber": mondai_num,
            "title": sec_spec["title"],
            "instruction": sec_spec["instruction"],
            "passageText": data.get("passageText"),
            "audioUrl": None,
            "timeLimitMinutes": sec_spec["timeLimitMinutes"],
            "orderIndex": sec_spec["orderIndex"],
            "questions": qs
        }

    # Non-reading: batch into groups of BATCH_SIZE to avoid token truncation
    all_questions = []
    remaining = count
    current_start = start_q_num
    while remaining > 0:
        batch = min(remaining, BATCH_SIZE)
        time.sleep(2)
        batch_qs = _call_batch(level, month, year, sec_spec, batch, current_start)
        all_questions.extend(batch_qs)
        current_start += batch
        remaining -= batch
        print(f"    Batch done: {len(all_questions)}/{count} for Mondai {mondai_num}", flush=True)

    print(f"    Total {len(all_questions)} questions Mondai {mondai_num}", flush=True)
    return {
        "sectionType": section_type,
        "mondaiNumber": mondai_num,
        "title": sec_spec["title"],
        "instruction": sec_spec["instruction"],
        "passageText": None,
        "audioUrl": None,
        "timeLimitMinutes": sec_spec["timeLimitMinutes"],
        "orderIndex": sec_spec["orderIndex"],
        "questions": all_questions
    }


def generate_exam(level: str, year: int, month: int) -> dict:
    spec = EXAM_SPECS[level]
    code = f"{level}_{year}_{month:02d}"

    print(f"\n{'='*60}", flush=True)
    print(f"Generating: {code}", flush=True)
    print(f"{'='*60}", flush=True)

    sections = []
    q_num = 1

    for sec_spec in spec["sections"]:
        print(f"\n  Section: {sec_spec['title']}", flush=True)
        time.sleep(3)
        section_data = generate_section(level, year, month, sec_spec, q_num)
        sections.append(section_data)
        count = len(section_data.get("questions", []))
        q_num += count

    exam = {
        "code": code,
        "title": f"De thi JLPT {level} - Thang {month:02d}/{year}",
        "jlptLevel": level,
        "year": year,
        "month": month,
        "totalTimeMinutes": spec["totalTimeMinutes"],
        "description": spec["description_template"].format(month=month, year=year),
        "sections": sections
    }

    total_q = sum(len(s.get("questions", [])) for s in sections)
    print(f"\nGenerated {code}: {len(sections)} sections, {total_q} questions", flush=True)
    return exam


def main():
    parser = argparse.ArgumentParser(description="Generate JLPT exam data using Gemini API")
    parser.add_argument("--level", required=True, choices=["N1", "N2", "N3", "N4", "N5"])
    parser.add_argument("--year", type=int, default=2019)
    parser.add_argument("--month", type=int, default=7)
    args = parser.parse_args()

    level = args.level
    year = args.year
    month = args.month
    code = f"{level}_{year}_{month:02d}"

    # Check existing
    if TARGET_FILE.exists():
        existing = json.loads(TARGET_FILE.read_text(encoding="utf-8"))
        existing_codes = {e["code"] for e in existing}
        if code in existing_codes:
            print(f"Exam '{code}' already exists. Skipping.")
            sys.exit(0)
    else:
        existing = []

    exam_data = generate_exam(level, year, month)
    existing.append(exam_data)
    TARGET_FILE.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nSaved to {TARGET_FILE}")
    print(f"Total exams: {len(existing)}")


if __name__ == "__main__":
    main()
