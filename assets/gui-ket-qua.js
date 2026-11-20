/* ═══════════════════════════════════════════════════════════════════
   GỬI KẾT QUẢ VỀ BẢNG TÍNH CỦA CÔ — dùng chung cho mọi bài ôn HSK 4
   Dán địa chỉ web app Apps Script (kết thúc bằng /exec) vào giữa hai dấu ' '.
   Để trống '' thì trang báo học viên chụp màn hình gửi cô.
   ═══════════════════════════════════════════════════════════════════ */
window.HSK4_WEBAPP = 'https://script.google.com/macros/s/AKfycbxNVfYkWaqvUdphICveSEZeKfgwG3HSrf96lwdrtHy3lOWXI_enozry-B3v8TEOp0nipw/exec';

/* Gói gồm: dang ('hsk4-on' | 'hsk4-tuhoc'), ma, ten, lop, bai, dung, tong,
   nam_bai, giu_lau, phan_xa_tb, cau_cham, ghep_doan,
   cau: [{id, yt (yếu tố), muc (mức nhận thức), kn (kỹ năng), cs (chỉ số), dung, giay, tl}],
   cach ('viet' | 'noi'), baiviet, so_chu, so_chu_them, cau_truc, tu_sao, (amTen, amLoai, amThanh, amGiay). */
window.HSK4_GUI = function (goi) {
  if (!window.HSK4_WEBAPP) return Promise.resolve(false);
  return fetch(window.HSK4_WEBAPP, {
    method: 'POST', mode: 'no-cors', cache: 'no-store',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(goi)
  }).then(function () { return true; }, function () { return false; });
};
