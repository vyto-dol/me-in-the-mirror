# Me In The Mirror

Web app tĩnh để tạo poster minh hoạ cho hoạt động phản chiếu bản thân của học viên.

## Flow

1. Landing page: nhập tên học viên, code lớp, chọn giới tính hero.
2. Builder page:
   - Điền `The Proud`
   - Điền `The Myth`
   - Điền `The Upgrade` theo dạng `bad -> better`
   - Chọn thêm phụ kiện cho nhân vật trong gương
3. Tải poster ra `SVG` hoặc `PNG`

## Chạy local

Vì app không dùng dependency, chỉ cần serve thư mục hiện tại:

```bash
python3 -m http.server 4173
```

Sau đó mở:

```text
http://localhost:4173
```

## File chính

- `index.html`: khung giao diện landing + builder
- `styles.css`: toàn bộ visual style responsive
- `app.js`: state, render SVG poster, chọn phụ kiện, export ảnh
