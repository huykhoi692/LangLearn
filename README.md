# LangLearn

App học IELTS/TOEIC có AI sinh dữ liệu học **đủ 1 ngày** cho:
- Reading (bài đọc + câu hỏi)
- Listening (link YouTube gợi ý)
- Speaking (câu hỏi + AI chấm)
- Writing (đề bài + AI chấm)
- Vocabulary (12 từ/ngày)
- Grammar (8 bài/ngày)

## Điểm chính
- Có ô nhập API key để thay key khi hết quota.
- Có ô nhập model để dùng model rẻ hơn (mặc định: `gemini-1.5-flash-8b`).
- Lưu local bằng `localStorage`.

## Chạy dự án
```bash
python3 -m http.server 8000
```
Mở `http://localhost:8000`.
