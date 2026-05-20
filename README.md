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
- Có ô nhập model để dùng model rẻ hơn (mặc định: `gemini-1.5-flash`).
- Lưu local bằng `localStorage`.

## Chạy dự án
```bash
python3 -m http.server 8000
```
Mở `http://localhost:8000`.


## Lỗi 404 thường gặp

Nếu gặp `API lỗi 404`, thường là do model name không hợp lệ cho endpoint. Hãy bấm **Test kết nối** và thử model `gemini-1.5-flash`.


## Công cụ học thêm
- Flashcard từ vựng: lật thẻ từ/nghĩa + ví dụ.
- Quiz nghĩa từ nhanh từ bộ từ trong ngày.
- Bài tập grammar có ô nhập đáp án và chấm nhanh tại chỗ.
