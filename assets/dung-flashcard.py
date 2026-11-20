#!/usr/bin/env python3
"""Sinh flashcard/bai-NN.html từ assets/du-lieu-flashcard/bai-NN.json theo khuôn assets/khuon-flashcard.html.
Chạy ở thư mục gốc repo:  python3 assets/dung-flashcard.py        (tất cả bài)
                            python3 assets/dung-flashcard.py 3      (một bài)
Tên bài (chữ Hán) lấy trong assets/du-lieu-flashcard/ten-bai.json."""
import json, sys, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = os.path.join(ROOT, 'assets', 'du-lieu-flashcard')
KHUON = open(os.path.join(ROOT, 'assets', 'khuon-flashcard.html'), encoding='utf-8').read()
TEN = json.load(open(os.path.join(DL, 'ten-bai.json'), encoding='utf-8'))

def js(s):  # chuỗi JS trong dấu nháy kép, giữ Unicode
    return json.dumps(s, ensure_ascii=False)

def mot_tu(w):
    ph = ', '.join('[%s, %s, %s]' % tuple(js(x) for x in p) for p in w['ph'])
    se = ', '.join('[%s, %s, %s, %s]' % tuple(js(x) for x in s) for s in w['se'])
    return ('    {hz:%s, py:%s, pos:%s, vn:%s, hv:%s, use:%s, tip:%s,\n'
            '      ph:[%s],\n'
            '      se:[%s]}') % (js(w['hz']), js(w['py']), js(w['pos']), js(w['vn']), js(w['hv']),
                                 js(w['use']), js(w['tip']), ph, se)

def dung(n):
    nn = '%02d' % n
    words = json.load(open(os.path.join(DL, 'bai-%s.json' % nn), encoding='utf-8'))
    rieng = sum(1 for w in words if w['pos'] == 'danh từ riêng')
    moi = len(words) - rieng
    sub = '%d từ mới' % moi + (' + %d danh từ riêng' % rieng if rieng else '')
    html = (KHUON.replace('{{WORDS}}', ',\n\n'.join(mot_tu(w) for w in words))
            .replace('{{LESSON}}', str(n)).replace('{{NN}}', nn)
            .replace('{{HAN}}', TEN[str(n)]).replace('{{TOTAL}}', str(len(words)))
            .replace('{{SUB}}', sub).replace('{{PCT}}', str(round(100 / len(words)))))
    assert '{{' not in html
    out = os.path.join(ROOT, 'flashcard', 'bai-%s.html' % nn)
    open(out, 'w', encoding='utf-8').write(html)
    print(out, len(words), 'thẻ')

if __name__ == '__main__':
    ns = [int(a) for a in sys.argv[1:]] or sorted(int(m.group(1)) for f in os.listdir(DL) for m in [re.match(r'bai-(\d+)\.json', f)] if m)
    for n in ns: dung(n)
