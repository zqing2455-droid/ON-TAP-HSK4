/* ═══════════════════════════════════════════════════════════════════
   ÔN TẬP HSK 4 — bộ máy chung cho mọi bài (khung 4 kỹ năng)
   🎧 Nghe (2 đề) → 📖 Đọc (2 đề) → ✍️ Viết hoặc 🗣 Nói (luân phiên theo bài)
   Trang bài khai báo: const KEY, const TOTAL, window.CHE_DO = 'on' | 'tuhoc', window.DU_LIEU = {...}
   Dữ liệu sinh từ _tao-giao-an/baiN/data_ontap.py — KHÔNG sửa tay trong trang.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var D = window.DU_LIEU, CHE_DO = window.CHE_DO || 'on';
  var KHOA = 'hsk4-' + KEY;
  var goc = document.getElementById('app');

  /* ── tiện ích ── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function chuan(s) { return String(s || '').replace(/[\s　。，、？！；：．·…—－~,.?!;:"'“”‘’()（）《》【】＿_]/g, ''); }
  function demHan(s) { return (String(s || '').match(/[一-鿿]/g) || []).length; }
  function dem(s, z) { var n = 0, i = 0; while ((i = s.indexOf(z, i)) >= 0) { n++; i += z.length; } return n; }
  function maLuot() { return Date.now().toString(36).slice(-5).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(); }
  function gach(s) { return esc(s).replace(/__(.+?)__/g, '<u>$1</u>'); }

  /* ── hàm chấm câu tự gõ: need / avoid / order (KHÔNG so chuỗi) ── */
  function cham(tl, c) {
    var a = chuan(tl), i, z;
    if (!a) return { ok: false, msg: 'Em chưa trả lời.' };
    for (i = 0; i < (c.avoid || []).length; i++) {
      if (a.indexOf(chuan(c.avoid[i][0])) >= 0) return { ok: false, msg: c.avoid[i][1] };
    }
    for (i = 0; i < (c.need || []).length; i++) {
      z = c.need[i];
      if (typeof z === 'string') { if (a.indexOf(chuan(z)) < 0) return { ok: false, msg: 'Còn thiếu “' + z + '”.' }; }
      else if (Array.isArray(z)) { if (!z.some(function (x) { return a.indexOf(chuan(x)) >= 0; })) return { ok: false, msg: 'Câu trả lời chưa nêu đúng ý.' }; }
      else if (dem(a, chuan(z.z)) < z.n) return { ok: false, msg: 'Còn thiếu “' + z.z + '”.' };
    }
    for (i = 0; i < (c.order || []).length; i++) {
      var o = c.order[i], p = a.indexOf(chuan(o[0])), q = a.indexOf(chuan(o[1]));
      if (p >= 0 && q >= 0 && p > q) return { ok: false, msg: o[2] };
    }
    return { ok: true, msg: '' };
  }
  window.OnTap = { cham: cham, chuan: chuan };

  /* ── trạng thái, lưu vào máy để làm dở quay lại tiếp ── */
  var S, AM = null, dangODau = false, manTruoc = '';
  function moi() { return { ma: maLuot(), ten: '', lop: '', man: 'dau', i: 0, p: [], luot: {}, tl: {}, chon: [], sua: {}, vb: '', amGiay: 0, gui: '' }; }
  function luu() { try { localStorage.setItem(KHOA, JSON.stringify(S)); } catch (e) { /* không lưu được thì thôi */ } }
  function nap() { try { return JSON.parse(localStorage.getItem(KHOA) || 'null'); } catch (e) { return null; } }

  var SP = D.san_pham, VIET = SP && SP.loai === 'viet';
  var BUOC = [['ng1', 'ng2', 'xng'], ['dc1', 'dc2', 'xdc'], ['sp']];
  var TEN_BUOC = ['🎧 Nghe', '📖 Đọc', VIET ? '✍️ Viết' : '🗣 Nói'];
  function buocCua(man) { for (var k = 0; k < BUOC.length; k++) if (BUOC[k].indexOf(man) >= 0) return k; return -1; }
  function veBuoc() {
    var k = buocCua(S.man);
    if (CHE_DO === 'tuhoc' || dangODau || k < 0) return '';
    var xong = S.man.charAt(0) === 'x' ? k + 1 : k;
    return '<div class="buoc" style="--so:3">' + TEN_BUOC.map(function (t, j) {
      return '<div class="' + (j < xong ? 'xong' : '') + (j === k ? ' dang' : '') + '">' + t + '</div>';
    }).join('') + '</div>';
  }
  function ve(html) {
    if (html.indexOf('id="ten"') < 0) dangODau = false;
    goc.innerHTML = veBuoc() + html;
    var man = S.man + (S.man === 'c1' ? S.i : '') + dangODau;
    if (man !== manTruoc) window.scrollTo(0, 0);
    manTruoc = man; luu();
  }
  function bam(sel, fn) { var e = goc.querySelectorAll(sel); for (var i = 0; i < e.length; i++) e[i].addEventListener('click', fn); }
  function nhap(sel, fn) { var e = goc.querySelectorAll(sel); for (var i = 0; i < e.length; i++) e[i].addEventListener('input', fn); }
  function sang(man) { S.man = man; chay(); }

  /* ══════════ MÀN ĐẦU ══════════ */
  function manDau() {
    dangODau = true;
    var dangDo = S.man !== 'dau' && S.man !== 'kq';
    var gt = CHE_DO === 'tuhoc'
      ? '<p class="phu">5 câu · khoảng 2 phút · làm TRƯỚC buổi học để cô biết em đã tự học từ ☆ tới đâu.</p>'
      : '<p class="phu">Ba phần, khoảng 25 phút. Xong mỗi phần em thấy ngay mình làm được mấy câu. Thoát ra giữa chừng, lần sau mở lại vẫn làm tiếp được — có thể làm Nghe + Đọc hôm nay, ' + (VIET ? 'Viết' : 'Nói') + ' hôm sau.</p>' +
        '<ul class="dan-y"><li>🎧 <b>Nghe</b> — 2 đoạn: phán đoán đúng / sai · gõ câu trả lời</li>' +
        '<li>📖 <b>Đọc</b> — 2 đoạn: tìm và sửa câu sai · trả lời câu hỏi</li>' +
        '<li>' + (VIET ? '✍️ <b>Viết</b> — một đoạn văn ≥ ' + SP.chu_toi_thieu + ' chữ' : '🗣 <b>Nói</b> — nói một đoạn ≥ ' + SP.giay_toi_thieu + ' giây (≈ 200 chữ)') + ', có dàn ý và từ gợi ý</li></ul>' +
        '<p class="phu" style="margin-top:10px">🔈 Phần nghe cần loa hoặc tai nghe.</p>';
    ve('<div class="the"><h2>Bắt đầu</h2>' + gt +
      '<label class="o" for="ten">Họ tên</label><input class="o" id="ten" autocomplete="name" value="' + esc(S.ten) + '">' +
      '<label class="o" for="lop">Lớp</label><input class="o" id="lop" value="' + esc(S.lop) + '">' +
      '<div class="hang-nut">' + (dangDo ? '<button class="nut" id="tiep">Làm tiếp chỗ đang dở</button><button class="nut phu" id="vao">Làm lại từ đầu</button>' : '<button class="nut rong" id="vao">Bắt đầu</button>') + '</div>' +
      '<p class="canh-bao" id="loi" hidden>Em điền họ tên trước nhé.</p></div>');
    bam('#vao', function () {
      var ten = document.getElementById('ten').value.trim();
      if (!ten) { document.getElementById('loi').hidden = false; return; }
      S = moi(); S.ten = ten; S.lop = document.getElementById('lop').value.trim(); AM = null;
      sang(CHE_DO === 'tuhoc' ? 'c1' : 'ng1');
    });
    bam('#tiep', function () { S.ten = document.getElementById('ten').value.trim() || S.ten; S.lop = document.getElementById('lop').value.trim() || S.lop; chay(); });
  }

  /* ══════════ TRÌNH PHÁT — mỗi đoạn được nghe tối đa 2 lần ══════════ */
  function khungNghe(id) {
    return '<div class="nghe"><audio id="am-' + id + '" preload="auto" src="' + esc(D.audio[id]) + '"></audio>' +
      '<button class="nut" id="phat-' + id + '"></button><div class="tien"><i id="tien-' + id + '"></i></div>' +
      '<div class="dk"><button class="nut-nho" id="lui-' + id + '" aria-label="Lùi lại 5 giây">⏪ 5 giây</button>' +
      '<span class="dk-toc"><span class="dk-nhan">Tốc độ</span>' +
      TOC.map(function (r) { return '<button class="nut-nho toc" data-id="' + id + '" data-r="' + r + '">' + String(r).replace('.', ',') + '×</button>'; }).join('') +
      '</span></div><div class="phu" id="ghi-' + id + '" style="margin:0"></div></div>';
  }
  var TOC = [0.75, 1, 1.25, 1.5];   // tốc độ phát cho phép — dùng chung cho mọi đoạn nghe, nhớ trong S.toc
  function ganNghe(id) {
    var am = document.getElementById('am-' + id), nut = document.getElementById('phat-' + id), tien = document.getElementById('tien-' + id), ghi = document.getElementById('ghi-' + id);
    var luot = function () { return S.luot[id] || 0; };
    var dangLuot = false;   // một lượt nghe đang dở (đã bấm phát, chưa nghe hết)
    var lui = document.getElementById('lui-' + id);
    var tocNut = document.querySelectorAll('.toc[data-id="' + id + '"]');
    var datToc = function (r) {
      S.toc = r; luu(); am.playbackRate = r;
      if ('preservesPitch' in am) am.preservesPitch = true;   // đổi tốc độ không đổi giọng
      Array.prototype.forEach.call(tocNut, function (b) { b.classList.toggle('chon', +b.getAttribute('data-r') === r); });
    };
    datToc(TOC.indexOf(S.toc) >= 0 ? S.toc : 1);
    Array.prototype.forEach.call(tocNut, function (b) { b.addEventListener('click', function () { datToc(+b.getAttribute('data-r')); }); });
    // ⏪ chỉ lùi TRONG lượt đang nghe — không mở thêm lượt, không tính thêm lượt
    lui.addEventListener('click', function () { if (!dangLuot) return; am.currentTime = Math.max(0, am.currentTime - 5); });
    var veNut = function () {
      lui.disabled = !dangLuot;
      if (!am.paused) { nut.textContent = '⏸ Tạm dừng'; nut.disabled = false; return; }
      if (dangLuot) { nut.textContent = '▶ Nghe tiếp'; nut.disabled = false; return; }
      nut.disabled = luot() >= 2;
      nut.textContent = luot() >= 2 ? 'Đã nghe 2 lần' : '▶ Nghe lần ' + (luot() + 1) + ' / 2';
      ghi.textContent = luot() === 0 ? 'Đọc trước câu hỏi bên dưới rồi hãy bấm nghe.' : luot() === 1 ? 'Còn 1 lần nghe.' : 'Hết lượt nghe — em làm bài nhé.';
    };
    nut.addEventListener('click', function () {
      if (!am.paused) { am.pause(); return veNut(); }
      if (dangLuot) { am.play(); return veNut(); }
      if (luot() >= 2) return;
      S.luot[id] = luot() + 1; luu(); dangLuot = true;
      am.currentTime = 0; am.playbackRate = S.toc || 1;
      var hua = am.play();
      if (hua && hua.catch) hua.catch(function () { S.luot[id] = luot() - 1; luu(); dangLuot = false; ghi.textContent = 'Không phát được âm thanh — em bấm lại nhé.'; veNut(); });
      veNut();
    });
    am.addEventListener('timeupdate', function () { if (am.duration) tien.style.width = (am.currentTime / am.duration * 100) + '%'; });
    am.addEventListener('ended', function () { dangLuot = false; tien.style.width = '100%'; veNut(); });
    am.addEventListener('pause', veNut);
    am.addEventListener('play', veNut);
    veNut();
  }

  /* ══════════ 🎧 NGHE ══════════ */
  function nghe1() {
    var N = D.nghe[0];
    ve('<div class="the"><span class="chip">Nghe · đề 1</span><h2 style="margin-top:8px">' + esc(N.ten) + '</h2><p class="phu">' + esc(N.huong_dan) + '</p>' + khungNghe(N.id) + '</div>' +
      '<div class="the" id="khoi-ds">' + veDS(N) + '</div>' +
      '<button class="nut rong" id="tiep">Sang đề nghe 2</button><p class="canh-bao" id="loi" hidden></p>');
    ganNghe(N.id);
    ganDS(N);
    bam('#tiep', function () { canhBao(N.cau.filter(function (c) { return S.tl[c.id] === undefined; }).length, function () { dungAm(); sang('ng2'); }); });
  }
  function veDS(N) {
    return N.cau.map(function (c, j) {
      var v = S.tl[c.id];
      return '<div class="ds"><div class="han ds-cau">' + (j + 1) + '. ' + esc(c.zh) + '</div><div class="ds-nut">' +
        '<button class="dsb' + (v === true ? ' chon' : '') + '" data-id="' + c.id + '" data-v="1" aria-label="Đúng">√</button>' +
        '<button class="dsb' + (v === false ? ' chon' : '') + '" data-id="' + c.id + '" data-v="0" aria-label="Sai">×</button></div></div>';
    }).join('');
  }
  function ganDS(N) {   // vẽ lại riêng khối câu hỏi để KHÔNG làm ngắt âm thanh đang phát
    bam('.dsb', function (e) {
      var b = e.currentTarget; S.tl[b.getAttribute('data-id')] = b.getAttribute('data-v') === '1'; luu();
      document.getElementById('khoi-ds').innerHTML = veDS(N); ganDS(N);
    });
  }
  function nghe2() {
    var N = D.nghe[1];
    ve('<div class="the"><span class="chip">Nghe · đề 2</span><h2 style="margin-top:8px">' + esc(N.ten) + '</h2><p class="phu">' + esc(N.huong_dan) + '</p>' + khungNghe(N.id) + '</div>' +
      '<div class="the">' + N.cau.map(function (c, j) {
        return '<label class="o han" for="' + c.id + '" style="font-size:18px;font-weight:600">' + (j + 1) + '. ' + esc(c.hoi) + '</label>' +
          '<textarea class="o" rows="2" id="' + c.id + '" lang="zh" placeholder="Gõ câu trả lời bằng tiếng Trung…">' + esc(S.tl[c.id] || '') + '</textarea>';
      }).join('') + '</div>' +
      '<button class="nut rong" id="tiep">Xong phần Nghe</button><p class="canh-bao" id="loi" hidden></p>');
    ganNghe(N.id);
    nhap('textarea', function (e) { S.tl[e.target.id] = e.target.value; luu(); });
    bam('#tiep', function () { canhBao(N.cau.filter(function (c) { return !chuan(S.tl[c.id]); }).length, function () { dungAm(); sang('xng'); }); });
  }
  function dungAm() { var a = goc.querySelectorAll('audio'); for (var i = 0; i < a.length; i++) a[i].pause(); }
  function canhBao(thieu, di) {
    var loi = document.getElementById('loi');
    if (thieu && loi.hidden) { loi.textContent = 'Còn ' + thieu + ' câu chưa làm. Bấm lần nữa nếu em vẫn muốn đi tiếp.'; loi.hidden = false; return; }
    di();
  }

  /* ══════════ 📖 ĐỌC ══════════ */
  function doc1() {
    var R = D.doc[0];
    ve('<div class="the"><span class="chip">Đọc · đề 1</span><h2 style="margin-top:8px">' + esc(R.ten) + '</h2><p class="phu">' + esc(R.huong_dan) + '</p>' +
      '<h3 class="han tieu-de">' + esc(R.tieu_de) + '</h3><p class="van han">' + R.cau.map(function (c, j) {
        return '<span class="cau-bam' + (S.chon.indexOf(j) >= 0 ? ' chon' : '') + '" data-j="' + j + '" role="button" tabindex="0">' + esc(c) + '</span>';
      }).join('') + '</p><p class="phu" id="dem" style="margin:6px 0 0">Đã chọn ' + S.chon.length + ' / ' + R.loi.length + ' câu.</p></div>' +
      (S.chon.length ? '<div class="the">' + S.chon.map(function (j, k) {
        return '<div class="sua"><div class="phu" style="margin:0 0 4px">Câu em chọn ' + (k + 1) + ':</div><div class="han sai-goc">' + esc(R.cau[j]) + '</div>' +
          '<label class="o" for="sua-' + j + '">Sửa lại cho đúng</label><textarea class="o" rows="2" id="sua-' + j + '" data-j="' + j + '" lang="zh">' + esc(S.sua[j] != null ? S.sua[j] : R.cau[j]) + '</textarea></div>';
      }).join('') + '</div>' : '') +
      '<button class="nut rong" id="tiep">Sang đề đọc 2</button><p class="canh-bao" id="loi" hidden></p>');
    bam('.cau-bam', function (e) {
      var j = +e.currentTarget.getAttribute('data-j'), k = S.chon.indexOf(j);
      if (k >= 0) { S.chon.splice(k, 1); return doc1(); }
      if (S.chon.length >= R.loi.length) { var d = document.getElementById('dem'); d.textContent = 'Chỉ chọn ' + R.loi.length + ' câu — bấm vào câu đã chọn để bỏ chọn.'; d.style.color = 'var(--hong)'; return; }
      S.chon.push(j); doc1();
    });
    nhap('textarea', function (e) { S.sua[e.target.getAttribute('data-j')] = e.target.value; luu(); });
    bam('#tiep', function () { canhBao(R.loi.length - S.chon.length, function () { sang('dc2'); }); });
  }
  function doc2() {
    var R = D.doc[1];
    ve('<div class="the"><span class="chip">Đọc · đề 2</span><h2 style="margin-top:8px">' + esc(R.ten) + '</h2><p class="phu">' + esc(R.huong_dan) + '</p>' +
      '<h3 class="han tieu-de">' + esc(R.tieu_de) + '</h3><p class="van han">' + gach(R.van) + '</p></div>' +
      '<div class="the">' + R.cau.map(function (c, j) {
        var dau = '<div class="han hoi">' + (j + 1) + '. ' + esc(c.hoi) + '</div>';
        if (c.kieu === 'chon') return '<div class="khoi-hoi">' + dau + c.pa.map(function (p, k) {
          return '<button class="pa han' + (S.tl[c.id] === k ? ' chon' : '') + '" data-id="' + c.id + '" data-k="' + k + '">' + 'ABC'.charAt(k) + '. ' + esc(p) + '</button>';
        }).join('') + '</div>';
        return '<div class="khoi-hoi">' + dau + '<textarea class="o" rows="2" id="' + c.id + '" lang="zh" placeholder="Gõ câu trả lời bằng tiếng Trung…">' + esc(S.tl[c.id] || '') + '</textarea></div>';
      }).join('') + '</div>' +
      '<button class="nut rong" id="tiep">Xong phần Đọc</button><p class="canh-bao" id="loi" hidden></p>');
    bam('.pa', function (e) { S.tl[e.currentTarget.getAttribute('data-id')] = +e.currentTarget.getAttribute('data-k'); doc2(); });
    nhap('textarea', function (e) { S.tl[e.target.id] = e.target.value; luu(); });
    bam('#tiep', function () { canhBao(R.cau.filter(function (c) { return c.kieu === 'chon' ? S.tl[c.id] === undefined : !chuan(S.tl[c.id]); }).length, function () { sang('xdc'); }); });
  }

  /* ══════════ CHẤM ══════════ */
  function chamNghe() {
    var r = [];
    D.nghe.forEach(function (N) {
      N.cau.forEach(function (c) {
        if (N.loai === 'dung_sai') r.push({ c: c, de: N.id, ok: S.tl[c.id] === c.dung, tl: S.tl[c.id] === undefined ? '' : (S.tl[c.id] ? '√' : '×') });
        else { var k = cham(S.tl[c.id], c); r.push({ c: c, de: N.id, ok: k.ok, msg: k.msg, tl: S.tl[c.id] || '' }); }
      });
    });
    return r;
  }
  function chamDoc() {
    var R1 = D.doc[0], R2 = D.doc[1], r = [];
    R1.loi.forEach(function (L) {
      var thay = S.chon.indexOf(L.i) >= 0, bai = thay ? (S.sua[L.i] != null ? S.sua[L.i] : R1.cau[L.i]) : '';
      var k = thay ? cham(bai, L) : { ok: false, msg: 'Em chưa chọn câu này.' };
      r.push({ c: L, de: R1.id, phan: 'tim', ok: thay, tl: thay ? 'đã chọn' : '' });
      r.push({ c: L, de: R1.id, phan: 'sua', ok: k.ok, msg: k.msg, tl: bai });
    });
    R2.cau.forEach(function (c) {
      if (c.kieu === 'chon') r.push({ c: c, de: R2.id, ok: S.tl[c.id] === c.dung, tl: S.tl[c.id] === undefined ? '' : c.pa[S.tl[c.id]] });
      else { var k = cham(S.tl[c.id], c); r.push({ c: c, de: R2.id, ok: k.ok, msg: k.msg, tl: S.tl[c.id] || '' }); }
    });
    return r;
  }
  function soDung(ds) { return ds.filter(function (x) { return x.ok; }).length; }

  /* ══════════ MÀN NHỎ sau mỗi phần ══════════ */
  function manNho(ten, so, tong, dong, sau, toi) {
    ve('<div class="the nho"><span class="chip">Xong phần ' + ten + '</span>' +
      '<div class="lon" style="margin-top:14px">✓ ' + so + ' / ' + tong + '</div><p>' + dong + '</p>' +
      '<div class="hang-nut" style="justify-content:center"><button class="nut" id="di">' + sau + '</button></div>' +
      '<p class="thong-bao">Lời gốc, đáp án và lời giải sẽ mở ra ở cuối bài. Muốn nghỉ thì cứ thoát ra — lần sau mở lại làm tiếp.</p></div>');
    bam('#di', function () { sang(toi); });
  }

  /* ══════════ ✍️ VIẾT · 🗣 NÓI ══════════ */
  function kiemDoan(t) {
    var a = chuan(t);
    return {
      so: demHan(t),
      ct: SP.cau_truc.filter(function (x) { return x[1].every(function (z) { return z.charAt(0) === '/' ? new RegExp(z.slice(1)).test(a) : a.indexOf(z) >= 0; }); }).map(function (x) { return x[0]; }),
      tu: SP.tu_goi_y.filter(function (w) { return a.indexOf(w) >= 0; })
    };
  }
  function goiY() {
    return '<div class="goi-y"><b>Dàn ý triển khai</b><ol class="dan-y">' + SP.dan_y.map(function (x) {
      return '<li><span class="chip">' + esc(x[0]) + '</span> <span class="han">' + esc(x[1]) + '</span></li>';
    }).join('') + '</ol>' +
      '<b>Từ vựng gợi ý</b>' + (VIET ? ' <span class="phu" style="font-size:13px">(chạm để chèn vào bài)</span>' : '') + '<div class="chips">' + SP.tu_goi_y.map(function (w) { return '<button class="chip-tu han" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>' +
      (SP.bat_buoc ? '<b>Cấu trúc bắt buộc</b> <span class="phu" style="font-size:13px">(dùng ít nhất ' + SP.can_cau_truc + ')</span>' : '<b>Cấu trúc nên dùng</b>') + '<div class="chips">' + SP.cau_truc.map(function (x) { return '<span class="chip vang han">' + esc(x[0]) + '</span>'; }).join('') + '</div></div>';
  }
  function sanPham() { return VIET ? viet() : noi(); }
  function viet() {
    ve('<div class="the"><span class="chip">✍️ Viết đoạn văn</span><p class="han" style="font-size:21px;margin:10px 0 2px">' + esc(SP.de) + '</p><p class="phu">' + esc(SP.de_vi) + ' Viết ít nhất ' + SP.chu_toi_thieu + ' chữ.</p>' + goiY() + '</div>' +
      '<div class="the"><textarea class="o lon" id="vb" lang="zh" placeholder="Viết đoạn văn của em ở đây…">' + esc(S.vb) + '</textarea><ul class="kiem" id="kiem"></ul>' +
      '<button class="nut rong" id="nop" style="margin-top:16px">Nộp bài</button><p class="canh-bao" id="loi" hidden></p></div>');
    var vb = document.getElementById('vb');
    var veKiem = function () {
      var k = kiemDoan(vb.value), dd = [
        [k.so >= SP.chu_toi_thieu, 'Đủ ' + SP.chu_toi_thieu + ' chữ Hán — hiện có <b>' + k.so + '</b>'],
        [k.ct.length >= SP.can_cau_truc, 'Dùng ≥ ' + SP.can_cau_truc + ' cấu trúc: <span class="han">' + (k.ct.join(' · ') || '—') + '</span>'],
        [k.tu.length >= SP.can_tu, 'Dùng ≥ ' + SP.can_tu + ' từ gợi ý: <span class="han">' + (k.tu.join(' · ') || '—') + '</span>']];
      document.getElementById('kiem').innerHTML = dd.map(function (x) { return '<li class="' + (x[0] ? 'dat' : '') + '"><span>' + x[1] + '</span></li>'; }).join('');
    };
    vb.addEventListener('input', function () { S.vb = vb.value; luu(); veKiem(); });
    bam('.chip-tu', function (e) {
      var w = e.currentTarget.getAttribute('data-w'), a = vb.selectionStart, b = vb.selectionEnd;
      vb.value = vb.value.slice(0, a) + w + vb.value.slice(b); vb.focus(); vb.selectionStart = vb.selectionEnd = a + w.length;
      S.vb = vb.value; luu(); veKiem();
    });
    veKiem();
    bam('#nop', function () {
      var loi = document.getElementById('loi'), so = demHan(S.vb);
      if (!so) { loi.textContent = 'Em chưa viết gì.'; loi.hidden = false; return; }
      if (SP.bat_buoc && kiemDoan(S.vb).ct.length < SP.can_cau_truc) { loi.textContent = 'Đề yêu cầu dùng ít nhất ' + SP.can_cau_truc + ' cấu trúc của bài — em xem lại danh sách ở trên nhé.'; loi.hidden = false; return; }
      if (so < SP.chu_toi_thieu && loi.dataset.nhac !== 'chu') { loi.dataset.nhac = 'chu'; loi.textContent = 'Đoạn mới có ' + so + ' chữ, chưa đủ ' + SP.chu_toi_thieu + '. Bấm lần nữa nếu em vẫn muốn nộp.'; loi.hidden = false; return; }
      sang('kq');
    });
  }
  var rec = null, demGio = null;
  function noi() {
    ve('<div class="the"><span class="chip">🗣 Nói một đoạn</span><p class="han" style="font-size:21px;margin:10px 0 2px">' + esc(SP.de) + '</p><p class="phu">' + esc(SP.de_vi) + ' Nói ít nhất ' + SP.giay_toi_thieu + ' giây (khoảng 200 chữ). Nghĩ theo dàn ý khoảng 1 phút rồi hãy ghi.</p>' + goiY() + '</div>' +
      '<div class="the"><div class="ghi"><button class="tron" id="ghi" aria-label="Ghi âm">🎙</button><div class="so-giay" id="sg">' + (AM ? S.amGiay : 0) + ' / ' + SP.giay_toi_thieu + ' giây</div>' +
      '<div class="phu" id="tt">' + (AM ? 'Đã ghi xong. Nghe lại, chưa ưng thì bấm nút đỏ để ghi lại.' : 'Bấm nút đỏ để ghi, bấm lần nữa để dừng.') + '</div>' + (AM ? '<audio controls src="' + AM.url + '"></audio>' : '') + '</div>' +
      (SP.bat_buoc ? '<div class="tu-chon"><b>Em đã dùng những cấu trúc nào trong bài nói?</b> <span class="phu" style="font-size:13px">(chọn ít nhất ' + SP.can_cau_truc + ' — cô sẽ nghe đối chiếu)</span><div class="chips">' +
        SP.cau_truc.map(function (x, j) { return '<button class="chip-tu han' + ((S.ctChon || []).indexOf(j) >= 0 ? ' chon' : '') + '" data-ct="' + j + '">' + esc(x[0]) + '</button>'; }).join('') + '</div></div>' : '') +
      '<button class="nut rong" id="nop" style="margin-top:16px">Nộp bài</button><p class="canh-bao" id="loi" hidden></p></div>');
    bam('[data-ct]', function (e) {
      var j = +e.currentTarget.getAttribute('data-ct'), ds = S.ctChon = S.ctChon || [], v = ds.indexOf(j);
      if (v >= 0) ds.splice(v, 1); else ds.push(j);
      e.currentTarget.classList.toggle('chon', v < 0); luu();
    });
    bam('#ghi', function () {
      var nut = document.getElementById('ghi'), tt = document.getElementById('tt'), sg = document.getElementById('sg');
      if (rec && rec.state === 'recording') { rec.stop(); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) { tt.textContent = 'Trình duyệt này không ghi âm được — em mở bằng Chrome hoặc Safari bản mới nhé.'; return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (luong) {
        var manh = [], t0 = Date.now();
        rec = new MediaRecorder(luong);
        rec.ondataavailable = function (e) { if (e.data.size) manh.push(e.data); };
        rec.onstop = function () {
          clearInterval(demGio); luong.getTracks().forEach(function (t) { t.stop(); });
          var blob = new Blob(manh, { type: rec.mimeType || 'audio/webm' }), fr = new FileReader();
          fr.onload = function () { AM = { url: URL.createObjectURL(blob), data: fr.result, loai: blob.type }; S.amGiay = Math.round((Date.now() - t0) / 1000); noi(); };
          fr.readAsDataURL(blob);
        };
        rec.start(); nut.classList.add('dang'); nut.textContent = '■'; tt.textContent = 'Đang ghi… bấm lần nữa để dừng (tối đa 3 phút).';
        demGio = setInterval(function () { var s = Math.round((Date.now() - t0) / 1000); sg.textContent = s + ' / ' + SP.giay_toi_thieu + ' giây'; if (s >= 180) rec.stop(); }, 250);
      }, function () { tt.textContent = 'Em chưa cho phép dùng micro. Cho phép rồi bấm lại.'; });
    });
    bam('#nop', function () {
      var loi = document.getElementById('loi');
      if (!AM) { loi.textContent = 'Em chưa ghi âm.'; loi.hidden = false; return; }
      if (SP.bat_buoc && (S.ctChon || []).length < SP.can_cau_truc) { loi.textContent = 'Em đánh dấu những cấu trúc đã dùng (ít nhất ' + SP.can_cau_truc + ') rồi hãy nộp nhé.'; loi.hidden = false; return; }
      if (S.amGiay < SP.giay_toi_thieu && loi.dataset.nhac !== 'giay') { loi.dataset.nhac = 'giay'; loi.textContent = 'Bài nói mới ' + S.amGiay + ' giây, chưa đủ ' + SP.giay_toi_thieu + '. Bấm lần nữa nếu em vẫn muốn nộp.'; loi.hidden = false; return; }
      sang('kq');
    });
  }

  /* ══════════ KẾT QUẢ ══════════ */
  function dongXem(x, dau, tl, dung, giai) {
    return '<div class="xem"><div class="dau-xem"><span class="dung-sai ' + (x.ok ? 'd' : 's') + '">' + (x.ok ? '✓' : '✗') + '</span> ' + dau + '</div>' +
      (x.ok ? '' : '<div class="zh sai">' + (tl ? esc(tl) : '<i>(chưa làm)</i>') + '</div>' + (x.msg ? '<div class="giai">↳ ' + esc(x.msg) + '</div>' : '')) +
      '<div class="zh">✓ ' + dung + '</div>' + (giai ? '<div class="giai">' + esc(giai) + '</div>' : '');
  }
  function chiTiet(c) { return (c.more ? '<details><summary>Các cách trả lời đúng khác</summary><div class="zh">' + c.more.map(esc).join('<br>') + '</div></details>' : '') + '</div>'; }
  function ketQua() {
    if (CHE_DO === 'tuhoc') return ketQuaTuHoc();
    var rn = chamNghe(), rd = chamDoc(), tong = soDung(rn) + soDung(rd);
    var tim = rd.filter(function (x) { return x.phan === 'tim'; }), sua = rd.filter(function (x) { return x.phan === 'sua'; }), hieu = rd.filter(function (x) { return !x.phan; });
    var k = VIET ? kiemDoan(S.vb) : null;
    var N1 = D.nghe[0], N2 = D.nghe[1], R1 = D.doc[0], R2 = D.doc[1];
    var ngDS = rn.filter(function (x) { return x.de === N1.id; }), ngGo = rn.filter(function (x) { return x.de === N2.id; });

    var htmlNghe = '<div class="the"><h2>🎧 Nghe · ' + soDung(rn) + ' / ' + rn.length + '</h2>' +
      rn.map(function (x) {
        var c = x.c, ds = x.de === N1.id;
        return dongXem(x, '<span class="han">' + esc(ds ? c.zh : c.hoi) + '</span>', ds ? (x.tl ? 'em chọn ' + x.tl : '') : x.tl,
          ds ? (c.dung ? '√ đúng' : '× sai') : esc(c.model), c.giai) + chiTiet(ds ? {} : c);
      }).join('') +
      [N1, N2].map(function (N, j) {
        return '<details class="loi-goc"><summary>Lời gốc đoạn nghe ' + (j + 1) + ' + dịch</summary><audio controls src="' + esc(D.audio[N.id]) + '" style="width:100%;margin-top:8px"></audio><p class="han">' + esc(N.loi) + '</p><p class="giai">' + esc(N.dich) + '</p></details>';
      }).join('') + '</div>';
    var htmlDoc = '<div class="the"><h2>📖 Đọc · ' + soDung(rd) + ' / ' + rd.length + '</h2><h3 class="nho-h">Đề 1 · tìm và sửa câu sai</h3>' +
      R1.loi.map(function (L, j) {
        var t = tim[j], s = sua[j];
        return '<div class="xem"><div class="dau-xem"><span class="dung-sai ' + (t.ok ? 'd' : 's') + '">' + (t.ok ? '✓' : '✗') + '</span> Tìm ra　<span class="dung-sai ' + (s.ok ? 'd' : 's') + '">' + (s.ok ? '✓' : '✗') + '</span> Sửa đúng　<span class="chip">' + esc(L.yt) + '</span></div>' +
          '<div class="zh sai">' + esc(R1.cau[L.i]) + '</div>' + (t.ok && !s.ok ? '<div class="giai">Em sửa: <span class="han">' + esc(s.tl) + '</span> — ' + esc(s.msg) + '</div>' : '') +
          '<div class="zh">✓ ' + esc(L.model) + '</div><div class="giai">' + esc(L.giai) + '</div>' + chiTiet(L);
      }).join('') +
      S.chon.filter(function (j) { return !R1.loi.some(function (L) { return L.i === j; }); }).map(function (j) {
        return '<div class="xem"><div class="dau-xem"><span class="dung-sai s">✗</span> Em chọn nhầm một câu đúng</div><div class="zh">' + esc(R1.cau[j]) + '</div><div class="giai">Câu này không sai — đọc lại xem vì sao.</div></div>';
      }).join('') +
      '<details class="loi-goc"><summary>Dịch đoạn văn 1</summary><p class="giai">' + esc(R1.dich) + '</p></details>' +
      '<h3 class="nho-h">Đề 2 · đọc hiểu</h3>' +
      hieu.map(function (x) {
        var c = x.c;
        return dongXem(x, '<span class="han">' + esc(c.hoi) + '</span>', x.tl, esc(c.kieu === 'chon' ? c.pa[c.dung] : c.model), c.giai) + chiTiet(c);
      }).join('') + '<details class="loi-goc"><summary>Dịch đoạn văn 2</summary><p class="giai">' + esc(R2.dich) + '</p></details></div>';
    var htmlSp = '<div class="the"><h2>' + (VIET ? '✍️ Viết' : '🗣 Nói') + '</h2><p class="phu">Phần này cô chấm theo 4 tiêu chí: ' + SP.tieu_chi.map(esc).join(' · ') + '.</p>' +
      (VIET ? '<div class="mau em"><b>Bài của em · ' + k.so + ' chữ · ' + (k.ct.join(' · ') || 'chưa dùng cấu trúc của bài') + '</b><p>' + esc(S.vb) + '</p></div>'
            : '<div class="mau em"><b>Bài nói của em · ' + S.amGiay + ' giây</b>' + (AM ? '<p><audio controls src="' + AM.url + '" style="width:100%"></audio></p>' : '<p class="giai">(bản ghi đã nộp)</p>') + '</div>') +
      '<div class="mau"><b>Bài mẫu</b><p>' + esc(SP.mau) + '</p></div><details><summary>Dịch bài mẫu</summary><p class="giai">' + esc(SP.mau_dich) + '</p></details></div>';

    ve('<div class="the diem"><span class="chip">Đã nộp bài · mã ' + esc(S.ma) + '</span><div class="lon" style="margin-top:14px">' + tong + ' / ' + TOTAL + '</div>' +
      '<p class="phu" style="margin-top:6px">' + esc(S.ten) + (S.lop ? ' · ' + esc(S.lop) : '') + ' · phần ' + (VIET ? 'viết' : 'nói') + ' chờ cô chấm</p>' +
      '<div class="chi-so">' +
      '<div><span>🎧 Nghe</span><b>' + soDung(rn) + ' / ' + rn.length + '</b><small>đúng/sai ' + soDung(ngDS) + '/' + ngDS.length + ' · trả lời ' + soDung(ngGo) + '/' + ngGo.length + '</small></div>' +
      '<div><span>📖 Đọc</span><b>' + soDung(rd) + ' / ' + rd.length + '</b><small>tìm lỗi ' + soDung(tim) + '/' + tim.length + ' · sửa ' + soDung(sua) + '/' + sua.length + ' · hiểu ' + soDung(hieu) + '/' + hieu.length + '</small></div>' +
      '<div style="grid-column:1/-1"><span>' + (VIET ? '✍️ Viết' : '🗣 Nói') + '</span><b>' + (VIET ? k.so + ' chữ' : S.amGiay + ' giây') + '</b><small>' + (VIET ? k.ct.length + ' cấu trúc · ' + k.tu.length + ' từ gợi ý · ' : '') + 'cô chấm sau</small></div>' +
      '</div><p class="thong-bao" id="gui">' + (S.gui || 'Đang gửi kết quả cho cô…') + '</p></div>' +
      htmlNghe + htmlDoc + htmlSp + '<button class="nut phu rong" id="lai">Làm lại từ đầu</button>');
    bam('#lai', function () { if (!confirm('Xoá bài đang có và làm lại từ đầu?')) return; try { localStorage.removeItem(KHOA); } catch (e) {} AM = null; S = moi(); manDau(); });

    if (!S.gui) {
      var cau = rn.map(function (x) {
        var c = x.c, ds = x.de === N1.id;
        return { id: c.id, yt: c.yt, kn: 'nghe', cs: c.cs, dung: x.ok ? 1 : 0, tl: x.tl, de: ds ? c.zh : c.hoi, da: ds ? (c.dung ? '√' : '×') : c.model };
      }).concat(rd.map(function (x) {
        var c = x.c;
        return { id: c.id + (x.phan ? '-' + x.phan : ''), yt: c.yt, kn: 'đọc', cs: c.cs, dung: x.ok ? 1 : 0, tl: x.phan === 'tim' ? (x.ok ? 'tìm ra' : 'không chọn câu này') : x.tl,
          de: x.phan ? (x.phan === 'tim' ? 'Tìm câu sai: ' : 'Sửa: ') + R1.cau[c.i] : c.hoi, da: x.phan ? c.model : (c.kieu === 'chon' ? c.pa[c.dung] : c.model) };
      }));
      var goi = { dang: 'hsk4-on', ma: S.ma, ten: S.ten, lop: S.lop, bai: D.bai, dung: tong, tong: TOTAL,
        nghe: soDung(rn) + '/' + rn.length, doc: soDung(rd) + '/' + rd.length, tim_loi: soDung(tim) + '/' + tim.length, sua_loi: soDung(sua) + '/' + sua.length,
        luot_nghe: JSON.stringify(S.luot), cau: cau, cach: VIET ? 'viet' : 'noi',
        chon_nham: S.chon.filter(function (j) { return !R1.loi.some(function (L) { return L.i === j; }); }).map(function (j) { return R1.cau[j]; }).join(' / ') };
      if (VIET) { goi.baiviet = S.vb; goi.so_chu = k.so; goi.cau_truc = k.ct.join(' · '); goi.tu_goi_y = k.tu.join(' · '); }
      else if (AM) { if (SP.bat_buoc) goi.cau_truc = (S.ctChon || []).slice().sort().map(function (j) { return SP.cau_truc[j][0]; }).join(' · ') + ' (tự đánh dấu)'; goi.amGiay = S.amGiay; goi.amLoai = AM.loai; goi.amThanh = AM.data; goi.amTen = 'HSK4-B' + D.bai + '-' + S.ten + '-' + S.ma; }
      gui(goi);
    }
  }

  /* ══════════ LINK TỰ HỌC — một màn một câu ══════════ */
  function cauChon() {
    var ds = D.tu_hoc;
    if (S.i >= ds.length) return sang('kq');
    var c = ds[S.i];
    ve('<div class="the"><p class="phu">Câu ' + (S.i + 1) + ' / ' + ds.length + '</p>' +
      '<div class="tinh"><small>TÌNH HUỐNG</small>' + esc(c.tinh) + '</div><p class="han" style="font-size:21px;margin:14px 0 0">' + esc(c.cau) + '</p>' +
      c.pa.map(function (p, j) { return '<button class="pa han" data-j="' + j + '">' + esc(p) + '</button>'; }).join('') + '</div>');
    var daChon = false;
    bam('.pa', function (e) {
      if (daChon) return; daChon = true;
      e.currentTarget.classList.add('chon');
      S.p[S.i] = +e.currentTarget.getAttribute('data-j'); S.i++; luu();
      setTimeout(cauChon, 280);
    });
  }
  function ketQuaTuHoc() {
    var p = D.tu_hoc.map(function (c, j) { return { c: c, ok: S.p[j] === c.dung, chon: S.p[j] }; }), dung = soDung(p);
    ve('<div class="the diem"><span class="chip">Đã nộp · mã ' + esc(S.ma) + '</span><div class="lon" style="margin-top:14px">' + dung + ' / ' + p.length + '</div>' +
      '<p class="phu">' + (dung === p.length ? 'Em tự học rất chắc. Lên lớp mình dùng các từ này để nói nhé!' : 'Câu sai bên dưới là chỗ em mở lại flashcard trước khi lên lớp.') + '</p>' +
      '<p class="thong-bao" id="gui">' + (S.gui || 'Đang gửi kết quả cho cô…') + '</p></div>' +
      '<div class="the">' + p.map(function (x, j) {
        var c = x.c;
        return '<div class="xem"><div class="dau-xem"><span class="dung-sai ' + (x.ok ? 'd' : 's') + '">' + (x.ok ? '✓' : '✗') + '</span> Câu ' + (j + 1) + ' <span class="chip">' + esc(c.yt) + '</span></div>' +
          '<div class="giai">' + esc(c.tinh) + '</div><div class="zh">' + esc(c.cau.replace('______', '【' + c.pa[c.dung] + '】')) + '</div>' +
          (x.ok ? '' : '<div class="zh sai">em chọn: ' + esc(c.pa[x.chon]) + '</div>') + '<div class="giai">' + esc(c.giai) + '</div></div>';
      }).join('') + '</div><button class="nut phu rong" id="lai">Làm lại</button>');
    bam('#lai', function () { try { localStorage.removeItem(KHOA); } catch (e) {} S = moi(); manDau(); });
    if (!S.gui) gui({ dang: 'hsk4-tuhoc', ma: S.ma, ten: S.ten, lop: S.lop, bai: D.bai, dung: dung, tong: p.length,
      cau: p.map(function (x) { return { id: x.c.id, yt: x.c.yt, kn: x.c.kn, cs: x.c.cs, dung: x.ok ? 1 : 0, tl: x.c.pa[x.chon], de: x.c.cau, da: x.c.pa[x.c.dung] }; }) });
  }
  function gui(goi) {
    var dat = function (s) { S.gui = s; luu(); var e = document.getElementById('gui'); if (e) e.textContent = s; };
    if (!window.HSK4_GUI || !window.HSK4_WEBAPP) { dat('Trang chưa nối bảng tính của cô — em chụp màn hình kết quả gửi cô nhé.'); return; }
    window.HSK4_GUI(goi).then(function (ok) { dat(ok ? '✓ Đã gửi kết quả cho cô.' : 'Chưa gửi được (mất mạng?) — em chụp màn hình gửi cô nhé.'); });
  }

  /* ══════════ điều phối ══════════ */
  function chay() {
    switch (S.man) {
      case 'dau': return manDau();
      case 'c1': return cauChon();
      case 'ng1': return nghe1();
      case 'ng2': return nghe2();
      case 'xng': var rn = chamNghe(); return manNho('Nghe', soDung(rn), rn.length, 'Tiếp theo: hai đoạn đọc.', 'Sang phần 📖 Đọc', 'dc1');
      case 'dc1': return doc1();
      case 'dc2': return doc2();
      case 'xdc': var rd = chamDoc(); return manNho('Đọc', soDung(rd), rd.length, 'Còn phần cuối: ' + (VIET ? 'viết một đoạn văn.' : 'nói một đoạn.'), 'Sang phần ' + (VIET ? '✍️ Viết' : '🗣 Nói'), 'sp');
      case 'sp': return sanPham();
      case 'kq': return ketQua();
    }
  }
  S = nap() || moi();
  if (S.man === 'kq') chay(); else manDau();
})();
