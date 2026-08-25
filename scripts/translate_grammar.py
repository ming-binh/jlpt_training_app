#!/usr/bin/env python3
"""
translate_grammar.py
====================
Dịch field 'meaning' (tiếng Trung) và 'examples[].vi' (trống) trong file JSON ngữ pháp
sang tiếng Việt bằng Gemini REST API (không cần SDK).

Usage:
    python translate_grammar.py --file grammar_n2.json [--batch-size 5] [--dry-run]

Requirements: Python 3.8+ (dùng stdlib requests alternative urllib)
    pip install requests  (hoặc dùng urllib tích hợp sẵn)
"""

import json
import argparse
import re
import time
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# ─── Config ───────────────────────────────────────────────────────────────────
# Load API key from .env file if available
def _load_api_key():
    env_file = Path(__file__).parent.parent / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding='utf-8').splitlines():
            if line.startswith('GEMINI_API_KEY='):
                return line.split('=', 1)[1].strip()
    return os.environ.get("GEMINI_API_KEY", "")

API_KEY = _load_api_key()
MODEL_NAME = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"
BASE_DIR = Path(__file__).parent.parent / "src/main/resources/data"
PROGRESS_DIR = Path(__file__).parent / ".progress"


def has_chinese(text: str) -> bool:
    """Kiểm tra text có ký tự Hán tự tiếng Trung (không phải Việt)."""
    if not text:
        return False
    has_cjk = bool(re.search(r'[\u4e00-\u9fff]', text))
    has_viet = bool(re.search(
        r'[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]',
        text, re.IGNORECASE
    ))
    return has_cjk and not has_viet


def needs_translation(entry: dict) -> bool:
    """Entry cần dịch nếu meaning có tiếng Trung hoặc examples.vi trống."""
    meaning_needs = has_chinese(entry.get("meaning", ""))
    examples_need = False
    try:
        examples = json.loads(entry.get("examples", "[]"))
        examples_need = any(ex.get("vi", "") == "" for ex in examples if isinstance(ex, dict))
    except (json.JSONDecodeError, TypeError):
        pass
    return meaning_needs or examples_need


def build_prompt(entries: list) -> str:
    entries_json = json.dumps(entries, ensure_ascii=False, indent=2)
    return f"""Bạn là chuyên gia dịch thuật ngữ pháp tiếng Nhật sang tiếng Việt cho học viên JLPT Việt Nam.

NHIỆM VỤ: Dịch các trường sau trong mỗi entry sang tiếng Việt thuần túy:
1. "meaning": Dịch toàn bộ nội dung sang tiếng Việt. Giữ lại phần tiếng Việt nếu có, bổ sung/dịch phần còn tiếng Trung. Ngắn gọn, rõ ràng, học sinh dễ hiểu. KHÔNG giữ lại tiếng Trung.
2. "examples": Với mỗi example, dịch câu "ja" sang tiếng Việt tự nhiên, điền vào "vi". Nếu "vi" đã có nội dung, giữ nguyên.

KHÔNG THAY ĐỔI: title, structure, relatedGrammar, examples[].ja

QUY TẮC:
- meaning: ngắn gọn, ví dụ "Chỉ cần... là..." không dài dòng
- examples.vi: tự nhiên như người Việt nói, không dịch cứng nhắc từng từ

Input JSON:
{entries_json}

Trả về DUY NHẤT JSON array hợp lệ, không thêm text nào ngoài JSON:"""


def call_gemini(entries: list, retry: int = 3) -> list:
    """Gọi Gemini REST API để dịch batch entries."""
    prompt = build_prompt(entries)
    
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json"
        }
    }, ensure_ascii=False).encode('utf-8')
    
    for attempt in range(retry):
        try:
            req = urllib.request.Request(
                GEMINI_URL,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode('utf-8'))
            
            text = result['candidates'][0]['content']['parts'][0]['text'].strip()
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            
            translated = json.loads(text)
            if not isinstance(translated, list):
                raise ValueError(f"Expected list, got {type(translated)}")
            if len(translated) != len(entries):
                raise ValueError(f"Expected {len(entries)} entries, got {len(translated)}")
            return translated
            
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')
            wait = 5 * (2 ** attempt)
            print(f"  WARNING: HTTP {e.code} attempt {attempt+1}/{retry}: {body[:200]}")
            if e.code == 429:
                wait = max(wait, 30)
            if attempt < retry - 1:
                print(f"  Retrying in {wait}s...")
                time.sleep(wait)
        except Exception as e:
            wait = 5 * (2 ** attempt)
            print(f"  WARNING: Attempt {attempt+1}/{retry} failed: {e}")
            if attempt < retry - 1:
                print(f"  Retrying in {wait}s...")
                time.sleep(wait)
    
    print(f"  ERROR: All {retry} attempts failed. Returning original entries unchanged.")
    return entries


def load_progress(progress_file: Path) -> set:
    if progress_file.exists():
        with open(progress_file, 'r', encoding='utf-8') as f:
            return set(json.load(f))
    return set()


def save_progress(progress_file: Path, done_indices: set):
    PROGRESS_DIR.mkdir(exist_ok=True)
    with open(progress_file, 'w', encoding='utf-8') as f:
        json.dump(list(done_indices), f)


def translate_file(input_path: Path, batch_size: int = 5, dry_run: bool = False):
    print(f"\n{'='*60}")
    print(f"Processing: {input_path.name}")
    print(f"{'='*60}")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        entries = json.load(f)
    
    total = len(entries)
    to_translate = [i for i, e in enumerate(entries) if needs_translation(e)]
    need_meaning = [i for i in to_translate if has_chinese(entries[i].get("meaning", ""))]
    
    print(f"Total entries: {total}")
    print(f"Need meaning translation: {len(need_meaning)}")
    print(f"Need examples.vi fill: {len(to_translate)}")
    
    if not to_translate:
        print("Nothing to translate!")
        return
    
    if dry_run:
        print(f"\n[DRY RUN] Would translate {len(to_translate)} entries in batches of {batch_size}")
        for i in to_translate[:5]:
            e = entries[i]
            print(f"  #{i}: {e['title']}")
            print(f"       meaning: {e.get('meaning', '')[:100]}")
        return
    
    # Backup
    backup_path = input_path.with_suffix('.bak.json')
    if not backup_path.exists():
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        print(f"Backup saved: {backup_path.name}")
    
    # Progress tracking
    progress_file = PROGRESS_DIR / f"{input_path.stem}_progress.json"
    done_indices = load_progress(progress_file)
    remaining = [i for i in to_translate if i not in done_indices]
    print(f"Already done: {len(done_indices)}, Remaining: {len(remaining)}")
    
    updated = list(entries)
    total_batches = (len(remaining) + batch_size - 1) // batch_size
    
    for batch_num, start in enumerate(range(0, len(remaining), batch_size)):
        batch_indices = remaining[start:start + batch_size]
        batch_entries = [entries[i] for i in batch_indices]
        
        print(f"\nBatch {batch_num+1}/{total_batches} | entries #{batch_indices[0]}-#{batch_indices[-1]}")
        
        translated = call_gemini(batch_entries)
        
        for orig_idx, trans in zip(batch_indices, translated):
            orig = updated[orig_idx]
            
            # Update meaning
            if has_chinese(orig.get("meaning", "")):
                new_meaning = trans.get("meaning", "")
                if new_meaning and not has_chinese(new_meaning):
                    orig["meaning"] = new_meaning
            
            # Update examples.vi
            try:
                orig_examples = json.loads(orig.get("examples", "[]"))
                trans_ex_raw = trans.get("examples", "[]")
                trans_examples = json.loads(trans_ex_raw) if isinstance(trans_ex_raw, str) else trans_ex_raw
                
                for j, orig_ex in enumerate(orig_examples):
                    if j < len(trans_examples) and orig_ex.get("vi", "") == "":
                        vi_val = trans_examples[j].get("vi", "")
                        if vi_val:
                            orig_ex["vi"] = vi_val
                
                orig["examples"] = json.dumps(orig_examples, ensure_ascii=False)
            except Exception as e:
                print(f"  WARNING: Could not update examples #{orig_idx}: {e}")
            
            updated[orig_idx] = orig
            done_indices.add(orig_idx)
        
        save_progress(progress_file, done_indices)
        
        with open(input_path, 'w', encoding='utf-8') as f:
            json.dump(updated, f, ensure_ascii=False, indent=2)
        
        pct = len(done_indices) / len(to_translate) * 100
        print(f"  Saved. Progress: {len(done_indices)}/{len(to_translate)} ({pct:.1f}%)")
        
        if batch_num < total_batches - 1:
            time.sleep(2)
    
    if progress_file.exists():
        progress_file.unlink()
    
    print(f"\nDone! {input_path.name}: {len(done_indices)} entries translated.")


def main():
    parser = argparse.ArgumentParser(description='Translate grammar JSON files to Vietnamese using Gemini')
    parser.add_argument('--file', required=True, help='Grammar JSON filename (e.g. grammar_n2.json)')
    parser.add_argument('--batch-size', type=int, default=5, help='Entries per API call (default: 5)')
    parser.add_argument('--dry-run', action='store_true', help='Preview without API calls')
    args = parser.parse_args()
    
    input_path = BASE_DIR / args.file
    if not input_path.exists():
        print(f"ERROR: File not found: {input_path}")
        sys.exit(1)
    
    translate_file(input_path, batch_size=args.batch_size, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
