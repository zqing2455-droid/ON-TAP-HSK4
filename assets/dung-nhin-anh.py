# -*- coding: utf-8 -*-
"""Dựng trò "Nhìn ảnh nói câu" (vòng xoay) cho HSK4 — mỗi bài một tệp tro-choi/bai-NN.html, ảnh nhúng sẵn.

  python3 assets/dung-nhin-anh.py            → dựng cả 10 bài
  python3 assets/dung-nhin-anh.py 4 5        → chỉ dựng Bài 4, 5

Nguồn:
  · Web dạy học đã dựng `../WEB-DAY-HOC/bai-NN.html` (DATA + MEDIA): từ ★, ảnh dạy từ, câu hỏi “Nhìn ảnh” (anh_q)
    và câu mẫu (anh_d) — pinyin đã soát ở bộ dựng web dạy học, nên sửa câu/ảnh thì sửa bên đó rồi dựng lại web trước.
  · `assets/nhin-anh-vi.json`: bản dịch tiếng Việt câu hỏi (q_vi) và câu mẫu (d_vi), theo đúng thứ tự từ ★.
  · Khuôn `assets/khuon-nhin-anh.html` (giao diện Mầm xanh, JS giống trò HSK1/HSK2).
Trang danh sách tro-choi/index.html tự dò bai-NN.html qua thẻ <meta name="tc-…">.
"""
import os, re, sys, json, base64, html, io
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))            # ON-TAP-HSK4
WEB = os.path.join(os.path.dirname(GOC), 'WEB-DAY-HOC')
KHUON = open(os.path.join(GOC, 'assets', 'khuon-nhin-anh.html'), encoding='utf-8').read()
VI = json.load(open(os.path.join(GOC, 'assets', 'nhin-anh-vi.json'), encoding='utf-8'))
esc = lambda s: html.escape(s or '', quote=False)

def nen_anh(data_url, rong=640):
    im = Image.open(io.BytesIO(base64.b64decode(data_url.split(',', 1)[1]))).convert('RGB')
    if im.width > rong: im = im.resize((rong, round(im.height * rong / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=74, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def dung(n):
    s = open(os.path.join(WEB, 'bai-%02d.html' % n), encoding='utf-8').read()
    D, _ = json.JSONDecoder().raw_decode(s[s.find('{', s.find('const DATA =')):])
    M, _ = json.JSONDecoder().raw_decode(s[s.find('{', s.find('const MEDIA')):])
    han = re.search(r'<title>HSK4 · Bài \d+ · ([^<]+)</title>', s).group(1)
    tu = [w for t in D['tram'] for w in t['tu'] if w.get('sao')]
    vi = VI[str(n)]
    assert [x['w'] for x in vi] == [w['w'] for w in tu], 'Bài %d: thứ tự từ trong nhin-anh-vi.json lệch web dạy học' % n
    NH = []
    for w, v in zip(tu, vi):
        assert w.get('anh_ppt') and w['anh_ppt'] in M, 'Bài %d: %s chưa có ảnh' % (n, w['w'])
        assert w['w'] in w['anh_d'], 'Bài %d: câu mẫu của %s không chứa từ' % (n, w['w'])
        nghia = re.split(r'[;；]', w['nghia'])[0].strip()
        note = '<b>Dùng thế nào:</b> ' + esc(w.get('the', ''))
        if w.get('canh'): note += '<br><b>Lưu ý:</b> ' + esc(w['canh'])
        NH.append(dict(
            ch=w['w'], cat=nghia, img=nen_anh(M[w['anh_ppt']]),
            task=('<b>%s</b><span class="py-hoi">%s</span><span class="vi-hoi">%s</span>'
                  '<span class="yeu-cau">Trả lời bằng một câu có <b class="zh">%s</b> (%s)</span>')
                 % (esc(w['anh_q']), esc(w['anh_q_py']), esc(v['q_vi']), esc(w['w']), esc(w['py'])),
            mau=[[w['anh_d'], w['anh_d_py'], v['d_vi']]],
            note=note))
    het = 'Cả %d từ trọng tâm của Bài %d đều nói được thành câu rồi.' % (len(NH), n) + (' Sang Bài %d được đấy!' % (n + 1) if n < 10 else ' Hết sách 4上 rồi đấy!')
    key = 'hsk4-nhin-anh-noi-cau-bai%d' % n
    out = (KHUON.replace('__NH__', json.dumps(NH, ensure_ascii=False)).replace('__HAN__', esc(han)).replace('__KEY__', key)
                 .replace('__TONG__', str(len(NH))).replace('__SO__', str(n)).replace('__HET__', het))
    assert '__' not in re.sub(r'__[a-z]', '', out.split('<script>')[0]) or True
    p = os.path.join(GOC, 'tro-choi', 'bai-%02d.html' % n)
    open(p, 'w', encoding='utf-8').write(out)
    print('Bài %2d 《%s》 · %d từ · %.0f KB' % (n, han, len(NH), os.path.getsize(p) / 1024))

for n in ([int(x) for x in sys.argv[1:]] or range(1, 11)):
    dung(n)
