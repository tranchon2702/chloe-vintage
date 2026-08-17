# CHLOE — Organic Sales Personal Portfolio

Source fullstack độc lập cho thương hiệu cá nhân **Chloe**, sinh ngày **14/11/2000**.
Website định vị Chloe là người làm **sales thực phẩm organic**: kín đáo, quan sát kỹ,
yêu những chuyến đi chậm và xây dựng quan hệ bằng sự chân thành.

## Ngôn ngữ và hình ảnh

- Song ngữ Việt–Anh, tự nhận ngôn ngữ trình duyệt và ghi nhớ lựa chọn.
- `assets/ngan-web-2.jpg`: chân dung chính ở hero.
- `assets/web-ngan.jpg`: ảnh editorial cho phần hành trình.
- `assets/chloe-social-card-v2.png`: ảnh preview mới khi chia sẻ liên kết.
- Ảnh có alt text song ngữ và được crop responsive bằng CSS.

## Palette

- Apricot `#FFBE91`
- Peach sand `#FFDDB0`
- Ivory `#FFFCE1`
- Powder blue `#CFEBFF`

## Chạy project

Yêu cầu Node.js 20 trở lên:

```powershell
npm start
```

Mở `http://localhost:4173`. Khi phát triển:

```powershell
npm run dev
```

## Kiểm tra

```powershell
npm run check
npm test
```

Test tích hợp kiểm tra frontend, hai ảnh chân dung, API profile, health check,
validation form liên hệ và việc lưu tin nhắn.

## Cấu trúc chính

- `index.html`: giao diện portfolio, SEO, accessibility và form liên hệ.
- `styles.css`: design system vintage editorial, palette và responsive.
- `content.js`: toàn bộ nội dung song ngữ Việt–Anh.
- `script.js`: đổi ngôn ngữ, menu mobile, copy email, reveal và gửi form.
- `server.mjs`: server Node và REST API không cần dependency ngoài.

## Backend

- `GET /api/health`
- `GET /api/profile`
- `GET /api/projects`
- `POST /api/contact`

Form có validation, honeypot, giới hạn 5 lần gửi/10 phút/IP và lưu tin nhắn vào
`storage/contacts.ndjson`.

## Cần thay trước khi publish

- Thay email mẫu `hello@chloe.studio` trong `index.html`, `content.js` và `server.mjs`.
- Kiểm tra lại câu chữ nghề nghiệp với hồ sơ thật của Chloe.
- Khi cần vận hành production nhiều máy, kết nối form với email, CRM hoặc database.
