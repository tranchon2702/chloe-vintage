# CHLOE — Relationship-led Sales Portfolio

Portfolio fullstack song ngữ Việt–Anh cho **Chloe** — người theo đuổi cách làm sales
dựa trên sự thấu hiểu, tư vấn rõ ràng và xây dựng quan hệ dài hạn.

Kiến trúc được tinh gọn từ những nguyên tắc tốt của PhoenixDo: tách frontend và
backend, API có version, cấu hình môi trường, module contact độc lập, response/error
thống nhất, rate limit, security headers, build production và test tích hợp.

## Stack

- Frontend: Vite + HTML/CSS/JavaScript modules.
- Backend: Node.js + Express + TypeScript + Zod.
- Persistence: NDJSON cục bộ cho contact; JSON + thư mục media cho nội dung quản trị.
- Monorepo: npm workspaces.

Không dùng React/Next.js hoặc MongoDB vì website hiện là một landing portfolio.
Dashboard quản trị được viết bằng JavaScript thuần và dùng chung API Express để giữ hệ
thống gọn, dễ triển khai và dễ backup.

## Cài đặt

Yêu cầu Node.js 20+ và npm 10+.

```powershell
npm install
Copy-Item backend\.env.example backend\.env
npm run dev
```

- Frontend development: `http://localhost:5173`
- Backend API: `http://localhost:4173/api/v1`
- Trang quản trị: `http://localhost:5173/admin` (mật khẩu local mặc định:
  `chloe-local-admin`)

Vite tự proxy `/api/*` sang backend trong development.

## Kiểm tra và build

```powershell
npm run check
npm test
npm run build
```

Hoặc chạy toàn bộ:

```powershell
npm run verify
```

Sau khi build, chạy production bằng một server:

```powershell
npm start
```

Mở `http://localhost:4173`. Express sẽ phục vụ cả API và frontend đã build.

## Cấu trúc

```text
chloe-web-vintage/
├─ frontend/
│  ├─ public/
│  │  ├─ assets/
│  │  ├─ robots.txt
│  │  ├─ sitemap.xml
│  │  └─ site.webmanifest
│  ├─ src/
│  │  ├─ lib/api-client.js
│  │  ├─ services/contact.service.js
│  │  ├─ config.js
│  │  ├─ content.js
│  │  ├─ main.js
│  │  └─ styles.css
│  ├─ .env.example
│  ├─ index.html
│  └─ vite.config.js
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ middlewares/
│  │  ├─ modules/contact/
│  │  ├─ routes/
│  │  ├─ utils/
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ tests/
│  ├─ storage/
│  ├─ .env.example
│  └─ tsconfig.json
├─ .editorconfig
├─ .gitignore
├─ .prettierrc
└─ package.json
```

## API v1

- `GET /api/v1/health`
- `GET /api/v1/profile`
- `GET /api/v1/projects`
- `POST /api/v1/contact`
- `GET /api/v1/content`
- `POST /api/v1/admin/login`
- `GET /api/v1/admin/content` (cần phiên quản trị)
- `PUT /api/v1/admin/content` (cần phiên quản trị)
- `PUT /api/v1/admin/media/:slot` (cần phiên quản trị)

Response thành công:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Response lỗi:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": {},
  "requestId": "..."
}
```

## Contact

Luồng contact được tách thành:

1. Route và rate limiter.
2. Zod schema và validation middleware.
3. Controller.
4. Service.
5. Repository.

Tin nhắn được lưu tại `backend/storage/contacts.ndjson`. File này nằm trong
`.gitignore`. Honeypot được xử lý âm thầm và request body giới hạn 32 KB.

## Song ngữ và hình ảnh

- Nội dung Việt–Anh mặc định nằm tại `frontend/src/content.js`.
- Nội dung đã lưu từ `/admin` nằm tại `backend/storage/content.json`.
- Ảnh tải từ `/admin` nằm tại `backend/storage/media/`.
- Admin có thể chỉnh toàn bộ nội dung song ngữ, email, SEO, ẩn/hiện từng phần và 9 vị
  trí ảnh. Website tự dùng nội dung mặc định nếu API chưa có dữ liệu.
- Website tự nhận ngôn ngữ trình duyệt và ghi nhớ lựa chọn.
- `ngan-web-2.jpg`: ảnh hero.
- `web-ngan.jpg`: ảnh phần hành trình.
- `chloe-social-card-v2.png`: ảnh social preview.

## Trước khi triển khai

- Đặt `ADMIN_PASSWORD` dài và riêng tư trong `backend/.env`; production sẽ từ chối khởi
  động nếu còn dùng mật khẩu local mặc định.
- Cập nhật `SITE_URL` và `CORS_ORIGINS` trong `backend/.env`.
- Chỉ truy cập trang admin qua HTTPS và backup cả `content.json` lẫn thư mục `media`.
- Kết nối `ContactRepository` với database/CRM nếu chạy nhiều instance.
- Cấu hình HTTPS và reverse proxy.

Xem thêm [DEPLOY.md](./DEPLOY.md).
