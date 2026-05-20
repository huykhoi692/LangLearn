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

## Adaptive + Anti-duplicate
- App tăng độ khó theo tiến độ hoàn thành task 7 ngày gần nhất (level 1-7).
- Prompt sinh dữ liệu có blacklist từ vựng/chủ điểm ngữ pháp 14 ngày gần nhất để hạn chế trùng.
- Khi sync Supabase, vocab/grammar được ghi thêm vào `vocab_items` và `grammar_items`.


## 3 giai đoạn học
- App có phase selector (GĐ1/GĐ2/GĐ3). Prompt generate dùng phase hiện tại để điều chỉnh độ khó/focus.
- Vocab/Grammar tools render theo dữ liệu DB (vocab_items/grammar_items) của ngày hiện tại.


## Cập nhật Reading/Listening
- Reading có ô nhập câu trả lời cho từng câu hỏi + nút chấm nhanh theo đáp án AI sinh sẵn.
- Listening ưu tiên mở trực tiếp `youtubeUrl` nếu model trả về; nếu không có thì fallback link search YouTube.
