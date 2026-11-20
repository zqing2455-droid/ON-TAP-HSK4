#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dựng dữ liệu "chữ Hán chạy bút thuận" cho các bộ flashcard HSK4.

    python3 assets/dung-net-chu.py        # chạy ở gốc repo, chạy lại bao nhiêu lần cũng được

  1. Đọc mọi assets/du-lieu-flashcard/bai-*.json, lấy chữ Hán của từ vựng (trường hz).
  2. Chữ nào chưa có assets/net-chu/<mã Unicode>.json thì tải từ jsDelivr
     (hanzi-writer-data 2.0.1 — nguồn Make Me a Hanzi, giấy phép Arphic PL) và lưu dạng {"s": nét, "m": đường giữa}.
Chữ nào chưa có file nét thì chay-net.js tự lấy tạm từ jsDelivr; không lấy được thì hiện chữ tĩnh."""
import glob, io, json, os, re, urllib.request, urllib.parse
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DICH = os.path.join(GOC, 'assets', 'net-chu')
CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/'
chu = set()
for f in glob.glob(os.path.join(GOC, 'assets', 'du-lieu-flashcard', 'bai-*.json')):
    for w in json.load(io.open(f, encoding='utf-8')):
        chu.update(c for c in w['hz'] if '一' <= c <= '鿿')
os.makedirs(DICH, exist_ok=True)
moi, thieu = 0, []
for c in sorted(chu):
    ra = os.path.join(DICH, '%x.json' % ord(c))
    if os.path.exists(ra): continue
    try:
        with urllib.request.urlopen(CDN + urllib.parse.quote(c) + '.json', timeout=20) as r:
            d = json.load(r)
        json.dump({'s': d['strokes'], 'm': d['medians']}, io.open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        moi += 1
    except Exception as e:
        thieu.append(c)
io.open(os.path.join(DICH, 'NGUON.txt'), 'w', encoding='utf-8').write(
    'Dữ liệu thứ tự nét (strokes, medians) lấy từ hanzi-writer-data 2.0.1\n'
    'https://github.com/chanind/hanzi-writer-data\n'
    'Nguồn gốc: Make Me a Hanzi (https://github.com/skishore/makemeahanzi), giấy phép Arphic Public License.\n'
    'Mỗi file <mã Unicode>.json: {"s": các nét (đường viền SVG), "m": đường giữa từng nét}.\n'
    'Dựng lại bằng: python3 assets/dung-net-chu.py\n')
print('tổng chữ %d · tải mới %d · thiếu %s' % (len(chu), moi, ''.join(thieu) or 'không'))
