# Nối bài ôn HSK 4 với Google Trang tính

Làm một lần, khoảng 5 phút. Xong thì mọi bài ôn và phiếu tự học HSK 4 tự gửi kết quả về bảng tính.

1. Mở bảng tính **Kết quả ôn tập HSK4** trên Google Drive (hoặc tạo bảng tính mới).
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá hết chữ có sẵn trong `Code.gs`, dán **toàn bộ** file `Code.gs` ở thư mục này vào, bấm 💾 Lưu.
4. Ở ô chọn hàm phía trên, chọn **thuTay** → bấm **Chạy**.
   Google hỏi quyền → chọn tài khoản của cô → *Nâng cao* → *Đi tới … (không an toàn)* → **Cho phép**.
   (Script chỉ ghi vào bảng tính này và lưu bài nói vào thư mục Drive có ID ghi ở dòng `THU_MUC_NOI_ID` đầu `Code.gs`.
   Hiện là "ÔN TẬP HSK4 – Kết quả học sinh / Bài nói học sinh (ghi âm)", mỗi bài một thư mục con "Bài 02", "Bài 04"…)
   Quay lại bảng tính: thấy trang "Bài ôn" và "Từng câu" có một dòng "Thử" là chạy được. Xoá dòng thử đi.
5. **Triển khai → Tùy chọn triển khai mới** → bánh răng chọn **Ứng dụng web**:
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   → **Triển khai** → chép **URL ứng dụng web** (kết thúc bằng `/exec`).
6. Dán URL đó vào `assets/gui-ket-qua.js`, dòng `window.HSK4_WEBAPP = '…';`, rồi chạy lại `dung-on-tap.py` và tải lên GitHub.

Sửa `Code.gs` về sau: **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Mới → Triển khai**, URL giữ nguyên.
