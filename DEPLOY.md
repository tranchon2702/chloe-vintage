# Production deployment

## 1. Chuẩn bị

```powershell
npm ci
Copy-Item backend\.env.example backend\.env
```

Cập nhật tối thiểu trong `backend/.env`:

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=4173
SITE_URL=https://your-domain.example
CORS_ORIGINS=https://your-domain.example
SERVE_FRONTEND=true
ADMIN_PASSWORD=mot-mat-khau-rieng-tu-toi-thieu-12-ky-tu
```

## 2. Xác minh và build

```powershell
npm run verify
```

## 3. Chạy

```powershell
npm start
```

Đặt Nginx, Caddy hoặc Cloudflare Tunnel ở phía trước `127.0.0.1:4173` để xử lý
HTTPS. Không public trực tiếp cổng Node nếu máy chủ có reverse proxy.

## 4. Dữ liệu contact

`backend/storage/contacts.ndjson` là persistence một máy. Hãy backup file này và
giới hạn quyền đọc. Khi chạy nhiều instance, thay repository bằng database hoặc
dịch vụ CRM trước khi scale.

## 5. Nội dung quản trị

Trang quản trị production nằm tại `/admin`. Nội dung và ảnh được lưu tại:

```text
backend/storage/content.json
backend/storage/media/
```

Backup cả hai vị trí, chỉ mở admin qua HTTPS và không commit `ADMIN_PASSWORD`. Phiên
đăng nhập được giữ trong bộ nhớ nên admin cần đăng nhập lại sau khi server khởi động.

## 6. Health check

```text
GET /api/v1/health
```

Health check trả HTTP 200 cùng version API và timestamp.
