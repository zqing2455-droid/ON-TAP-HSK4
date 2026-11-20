/**
 * ══════════════════════════════════════════════════════════════════
 *  NHẬN BÀI NỘP  ·  ÔN TẬP HSK 4
 *  ------------------------------------------------------------------
 *  Dán TOÀN BỘ file này vào Apps Script của Google Trang tính
 *  (Tiện ích mở rộng → Apps Script), rồi Triển khai thành Ứng dụng web.
 *  Hướng dẫn từng bước: xem HUONG-DAN.md cùng thư mục.
 *
 *  Ba trang tính tự tạo khi có bài nộp đầu tiên:
 *   · "Bài ôn"      — mỗi lượt nộp bài ôn một dòng (điểm, bài viết, link ghi âm)
 *   · "Từng câu"    — mỗi câu của mỗi lượt một dòng (đề · em trả lời · đáp án)
 *   · "Tự học"      — mỗi lượt làm phiếu tự học trước Buổi 1 một dòng
 *  Bài nói (bài chẵn) lưu thành file trong thư mục Drive
 *  "ÔN TẬP HSK4 – Kết quả học sinh / Bài nói học sinh (ghi âm) / Bài NN",
 *  cột "Ghi âm" của trang "Bài ôn" có link bấm vào nghe ngay.
 * ══════════════════════════════════════════════════════════════════
 */

var SHEET_BAI    = 'Bài ôn';
var SHEET_CAU    = 'Từng câu';
var SHEET_TUHOC  = 'Tự học';
/* ID thư mục "Bài nói học sinh (ghi âm)" — lấy ở đường link drive.google.com/drive/folders/<ID>.
   Đổi thư mục khác thì dán ID mới vào đây rồi triển khai phiên bản mới. */
var THU_MUC_NOI_ID = '1QL9kEkcgKbg70NhPV7SkTU_0RHno2-jm';
var THU_MUC_NOI    = 'Bài nói học sinh (ghi âm)';   // dự phòng: không mở được ID thì tìm / tạo theo tên

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d  = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var luc = new Date();
    if (d.dang === 'hsk4-tuhoc') ghiTuHoc(ss, d, luc);
    else ghiBaiOn(ss, d, luc);
    ghiTungCau(ss, d, luc);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, loi: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* Mở link Web App bằng trình duyệt thấy dòng này là chạy được */
function doGet() {
  return json({ ok: true, note: 'Web App HSK4 dang chay binh thuong.' });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Lấy trang tính, chưa có thì tạo kèm dòng tiêu đề */
function sheet(ss, ten, tieuDe) {
  var sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    sh.appendRow(tieuDe);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  } else {
    var cu = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
    if (cu.join('|') !== tieuDe.join('|')) sh.getRange(1, 1, 1, tieuDe.length).setValues([tieuDe]);
  }
  sh.getRange(1, 1, 1, tieuDe.length).setFontWeight('bold').setBackground('#e3ece4');
  return sh;
}

function phanTram(a, b) { return b ? Math.round(a / b * 100) + '%' : ''; }

/* ── Bài ôn: một lượt một dòng ── */
function ghiBaiOn(ss, d, luc) {
  var sh = sheet(ss, SHEET_BAI, [
    'Thời gian', 'Họ tên', 'Lớp', 'Bài', 'Mã lượt', 'Điểm', 'Tổng', '%',
    'Nghe', 'Đọc', 'Tìm lỗi', 'Sửa lỗi', 'Chọn nhầm câu đúng', 'Câu sai',
    'Viết / Nói', 'Số chữ · số giây', 'Cấu trúc đã dùng', 'Từ gợi ý đã dùng', 'Bài viết', 'Ghi âm', 'Lượt nghe'
  ]);
  var sai = (d.cau || []).filter(function (c) { return !c.dung; }).map(function (c) { return c.id; });
  var ghiAm = '';
  if (d.amThanh) ghiAm = luuGhiAm(d);
  sh.appendRow([
    luc, d.ten || '(chưa ghi tên)', d.lop || '', d.bai || '', d.ma || '',
    d.dung, d.tong, phanTram(d.dung, d.tong),
    d.nghe || '', d.doc || '', d.tim_loi || '', d.sua_loi || '', d.chon_nham || '', sai.join(' · '),
    d.cach === 'noi' ? 'Nói' : 'Viết',
    d.cach === 'noi' ? (d.amGiay || 0) + ' giây' : (d.so_chu || 0) + ' chữ',
    d.cau_truc || '', d.tu_goi_y || '', d.baiviet || '', ghiAm, d.luot_nghe || ''
  ]);
  var r = sh.getLastRow();
  sh.getRange(r, 19).setWrap(true).setVerticalAlignment('top');
  sh.setColumnWidth(19, 360);
  // ô chữ gắn link (không dùng công thức HYPERLINK vì dấu ngăn đổi theo ngôn ngữ bảng tính)
  if (/^https:/.test(ghiAm)) sh.getRange(r, 20).setRichTextValue(
    SpreadsheetApp.newRichTextValue().setText('▶ Nghe bài nói').setLinkUrl(ghiAm).build());
}

/* Thư mục gốc chứa bài nói */
function thuMucNoi() {
  try { return DriveApp.getFolderById(THU_MUC_NOI_ID); } catch (e) {}
  var it = DriveApp.getFoldersByName(THU_MUC_NOI);
  return it.hasNext() ? it.next() : DriveApp.createFolder(THU_MUC_NOI);
}

/* Thư mục con theo bài: "Bài 02", "Bài 04"… */
function thuMucBai(goc, bai) {
  var ten = 'Bài ' + ('0' + (bai || 0)).slice(-2);
  var it = goc.getFoldersByName(ten);
  return it.hasNext() ? it.next() : goc.createFolder(ten);
}

/* Lưu bài nói vào Drive, trả về link file */
function luuGhiAm(d) {
  try {
    // Chrome ghi ra "data:audio/webm;codecs=opus;base64,…", Safari "data:audio/mp4;base64,…" — chấp nhận cả hai
    var m = String(d.amThanh).match(/^data:([^,]*?);base64,(.*)$/);
    if (!m) return '(không đọc được bản ghi)';
    var loai = (d.amLoai || m[1]).split(';')[0];
    var duoi = /mp4|m4a|aac/.test(loai) ? '.m4a' : (/ogg/.test(loai) ? '.ogg' : '.webm');
    var luc = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM HH.mm');
    var ten = ['Bài ' + ('0' + (d.bai || 0)).slice(-2), d.ten || 'chưa ghi tên', d.lop || '', luc]
      .filter(String).join(' - ').replace(/[\\\/:*?"<>|]/g, '_') + duoi;
    var f = thuMucBai(thuMucNoi(), d.bai).createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), loai, ten));
    f.setDescription((d.ten || '') + ' · ' + (d.lop || '') + ' · Bài ' + d.bai + ' · ' + (d.amGiay || 0) + ' giây · mã ' + (d.ma || ''));
    return f.getUrl();
  } catch (err) {
    return '(lỗi lưu ghi âm: ' + err + ')';
  }
}

/* ── Tự học: một lượt một dòng ── */
function ghiTuHoc(ss, d, luc) {
  var sh = sheet(ss, SHEET_TUHOC, ['Thời gian', 'Họ tên', 'Lớp', 'Bài', 'Mã lượt', 'Đúng', 'Tổng', '%', 'Từ sai']);
  var sai = (d.cau || []).filter(function (c) { return !c.dung; }).map(function (c) { return c.yt || c.id; });
  sh.appendRow([luc, d.ten || '(chưa ghi tên)', d.lop || '', d.bai || '', d.ma || '',
    d.dung, d.tong, phanTram(d.dung, d.tong), sai.join(' · ')]);
}

/* ── Từng câu: mỗi câu một dòng — lọc theo cột "Đúng?" để xem câu cả lớp hay sai ── */
function ghiTungCau(ss, d, luc) {
  var ds = d.cau || [];
  if (!ds.length) return;
  var sh = sheet(ss, SHEET_CAU, ['Thời gian', 'Họ tên', 'Lớp', 'Bài', 'Loại', 'Câu', 'Kỹ năng', 'Nội dung kiểm tra', 'Đúng?', 'Đề', 'Em trả lời', 'Đáp án']);
  var loai = d.dang === 'hsk4-tuhoc' ? 'Tự học' : 'Bài ôn';
  var dau = sh.getLastRow() + 1;
  sh.getRange(dau, 1, ds.length, 12).setValues(ds.map(function (c) {
    return [luc, d.ten || '(chưa ghi tên)', d.lop || '', d.bai || '', loai, c.id || '', c.kn || '', c.yt || '',
            c.dung ? '✓' : '✗', c.de || '', c.tl || '(bỏ trống)', c.da || ''];
  }));
  sh.getRange(dau, 10, ds.length, 3).setWrap(true).setVerticalAlignment('top');
  sh.setColumnWidth(10, 300); sh.setColumnWidth(11, 240); sh.setColumnWidth(12, 240);
}

/* Chạy thử trong trình soạn Apps Script (chọn hàm thuTay → Chạy) để cấp quyền và xem 3 trang tính hiện ra */
function thuTay() {
  doPost({ postData: { contents: JSON.stringify({
    dang: 'hsk4-on', ma: 'THU', ten: 'Thử', lop: 'GV', bai: 1, dung: 10, tong: 12, nghe: '4/5', doc: '6/7', tim_loi: '2/2', sua_loi: '1/2',
    cach: 'viet', baiviet: '我想学国际贸易。', so_chu: 7, cau_truc: '要是……就……', tu_goi_y: '留学',
    cau: [{ id: 'NG1-1', kn: 'nghe', yt: 'nghe chi tiết', dung: 1, tl: '×', de: '陈天中一个人去办理。', da: '×' }]
  }) } });
}
