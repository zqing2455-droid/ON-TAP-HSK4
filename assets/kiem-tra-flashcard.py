#!/usr/bin/env python3
"""Kiểm tra dữ liệu flashcard HSK4 so với CSV giáo án. Chạy ở gốc repo:
    python3 -I assets/kiem-tra-flashcard.py assets/du-lieu-flashcard/bai-01.json "../GIÁO ÁN/Flashcard-HSK4-Bai-1.csv"
In OK là đạt. Sau đó: python3 assets/dung-flashcard.py 1 · python3 assets/dung-net-chu.py"""
import json, sys, re, csv, io
POS = {"danh từ · n.","động từ · v.","tính từ · adj.","phó từ · adv.","liên từ · conj.","đại từ · pron.","lượng từ · m.",
       "trợ từ · part.","giới từ · prep.","số từ · num.","thán từ · interj.","động từ / danh từ","danh từ / động từ",
       "cụm cố định","danh từ riêng","hậu tố","danh từ / tính từ","tính từ / danh từ","giới từ / động từ","động từ / giới từ",
       "động từ / tính từ","tính từ / động từ","danh từ / lượng từ","lượng từ / danh từ","trợ động từ · aux."}
TONE = re.compile(r'[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]')
errs = []
data = json.load(open(sys.argv[1], encoding='utf-8'))
rows = list(csv.DictReader(io.StringIO(open(sys.argv[2], encoding='utf-8-sig').read())))
expect = [r['tu'] for r in rows]; got = [w.get('hz') for w in data]
if got != expect: errs.append(f"danh sách từ không khớp CSV giáo án.\n  mong: {expect}\n  có:   {got}")
csvpy = {r['tu']: r['pinyin'] for r in rows}
for i, w in enumerate(data):
    k = set(w.keys())
    if k != {"hz","py","pos","vn","hv","use","tip","ph","se"}: errs.append(f"[{i}] {w.get('hz')}: khoá sai {sorted(k)}"); continue
    for f in ("hz","py","pos","vn","hv","use","tip"):
        if not isinstance(w[f], str) or not w[f].strip(): errs.append(f"[{i}] {w['hz']}: {f} rỗng")
    if w['py'] != csvpy.get(w['hz']): errs.append(f"[{i}] {w['hz']}: pinyin khác CSV ({w['py']} ≠ {csvpy.get(w['hz'])})")
    if w['pos'] not in POS: errs.append(f"[{i}] {w['hz']}: pos lạ “{w['pos']}”")
    if w['hv'] != w['hv'].upper(): errs.append(f"[{i}] {w['hz']}: hv phải viết hoa")
    if not TONE.search(w['py']): errs.append(f"[{i}] {w['hz']}: py thiếu dấu thanh")
    if not (isinstance(w['ph'], list) and len(w['ph']) == 2 and all(isinstance(p, list) and len(p) == 3 for p in w['ph'])): errs.append(f"[{i}] {w['hz']}: ph phải là 2 bộ [zh, py, vn]")
    if not (isinstance(w['se'], list) and len(w['se']) == 2 and all(isinstance(s, list) and len(s) == 4 for s in w['se'])): errs.append(f"[{i}] {w['hz']}: se phải là 2 bộ"); continue
    for j, s in enumerate(w['se']):
        if s[3] not in s[0]: errs.append(f"[{i}] {w['hz']}: se[{j}] cụm nổi bật “{s[3]}” không nằm trong câu")
        if not re.search(r'[。？！]$', s[0]): errs.append(f"[{i}] {w['hz']}: se[{j}] câu thiếu dấu kết câu “{s[0]}”")
        if not TONE.search(s[1]): errs.append(f"[{i}] {w['hz']}: se[{j}] pinyin thiếu dấu")
        if w['hz'] not in s[0]: errs.append(f"[{i}] {w['hz']}: se[{j}] câu không chứa từ đang học")
        if w['hz'] not in s[3]: errs.append(f"[{i}] {w['hz']}: se[{j}] cụm nổi bật không chứa từ đang học")
        cau = {rows[i]['cau_1'], rows[i]['cau_2']}
        if s[0] not in cau: errs.append(f"[{i}] {w['hz']}: se[{j}] câu không có trong CSV: {s[0]}")
    for j, p in enumerate(w['ph']):
        if not TONE.search(p[1]): errs.append(f"[{i}] {w['hz']}: ph[{j}] pinyin thiếu dấu")
        if p[0] not in [c.strip() for c in rows[i]['cum_tu'].split('·')]: errs.append(f"[{i}] {w['hz']}: ph[{j}] cụm “{p[0]}” không có trong CSV")
    for f in ("use","tip","vn"):
        if '"' in w[f]: errs.append(f"[{i}] {w['hz']}: {f} có dấu nháy thẳng")
    if len(w['use']) < 40: errs.append(f"[{i}] {w['hz']}: use quá ngắn")
    if len(w['tip']) < 30: errs.append(f"[{i}] {w['hz']}: tip quá ngắn")
    if len(w['use']) > 260: errs.append(f"[{i}] {w['hz']}: use dài {len(w['use'])}")
if errs: print("\n".join(errs)); print(f"{len(errs)} lỗi"); sys.exit(1)
print("OK", len(data), "từ")
