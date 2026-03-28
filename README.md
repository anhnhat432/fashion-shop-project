# Fashion Shop Project

Fashion Shop Project là một hệ thống bán hàng thời trang full-stack gồm 3 phần trong cùng một repo:

- `server/`: backend Node.js + Express + MongoDB REST API
- `mobile/`: ứng dụng React Native (Expo) cho khách hàng
- `admin/`: web React cho quản trị viên

## 1. Cấu trúc thư mục

```text
fashion-shop-project/
  server/
    config models controllers routes middleware utils scripts
  mobile/
    screens components services navigation context constants
  admin/
    src/pages src/components src/services src/routes src/context
```

## 2. Yêu cầu môi trường

- Node.js 18+
- MongoDB local hoặc MongoDB Atlas
- Tài khoản Expo nếu cần build APK/AAB

## 3. Chạy backend local

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend local mặc định chạy ở:

```text
http://localhost:5000
```

### Tài khoản admin seed sẵn

- Email: `admin@fashion.com`
- Password: `123456`

## 4. Deploy backend lên Render

Repo đã có sẵn cấu hình Render trong [render.yaml](render.yaml).

### Cách nhanh nhất

1. Push repo lên GitHub.
2. Tạo MongoDB Atlas và lấy `MONGO_URI`.
3. Vào Render Dashboard -> `New +` -> `Blueprint`.
4. Chọn repo này để Render đọc `render.yaml`.
5. Nhập các biến môi trường cần thiết:

```env
MONGO_URI=<mongodb-atlas-connection-string>
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
NODE_VERSION=20
```

### Cấu hình Render hiện tại

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

### URL production hiện tại

Backend production hiện đang chạy tại:

```text
https://fashion-shop-project-4pxx.onrender.com
```

Health check:

```text
https://fashion-shop-project-4pxx.onrender.com/api/health
```

Lưu ý:

- Render không cung cấp MongoDB cho ứng dụng này, nên `MONGO_URI` phải là MongoDB Atlas hoặc MongoDB public khác.
- Nếu MongoDB Atlas báo `Authentication failed`, hãy kiểm tra lại username/password của `Database Access`.
- Nếu cần dữ liệu mẫu sau khi deploy, chạy local với cùng `MONGO_URI` rồi dùng `npm run seed` trong thư mục `server`.

## 5. Chạy mobile app local

```bash
cd mobile
npm install
npm start
```

App sẽ tự suy luận API local theo môi trường chạy. Nếu cần ép API thủ công, có thể dùng:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## 6. Build APK / AAB cho Android

Mobile đang dùng Expo EAS.

### Cấu hình hiện tại

- Android package: `com.fpt.mma301.fashionshop`
- Expo owner: `anhnhat4321`
- Profile `preview`: build APK
- Profile `production`: build AAB
- API production đang trỏ tới:

```text
https://fashion-shop-project-4pxx.onrender.com/api
```

Thông tin này đang nằm trong:

- [mobile/app.json](mobile/app.json)
- [mobile/eas.json](mobile/eas.json)

### Đăng nhập và khởi tạo EAS

Nếu máy đã có `eas-cli` global:

```bash
cd mobile
eas login
eas init
```

Nếu PowerShell trên Windows chặn `eas.ps1`, dùng:

```powershell
cd mobile
eas.cmd login
eas.cmd init
```

Nếu chưa cài `eas-cli`:

```bash
npm install --global eas-cli
```

### Build APK để nộp hoặc upload APKPure

```bash
cd mobile
npm run build:android:apk
```

### Build AAB để đưa lên Google Play

```bash
cd mobile
npm run build:android:aab
```

Lưu ý:

- App build thật không dùng được `localhost` hoặc `10.0.2.2`.
- Trước khi build, backend production phải hoạt động bình thường.
- Nếu Render đổi URL, hãy cập nhật lại `EXPO_PUBLIC_API_BASE_URL` trong `mobile/eas.json`.

## 7. Chạy admin web local

```bash
cd admin
npm install
npm run dev
```

Admin web local mặc định chạy ở:

```text
http://localhost:5173
```

Nếu cần cấu hình API riêng:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 8. API chính

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

### Products

- `GET /api/products?search=&categoryId=`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Orders

- `POST /api/orders` (user)
- `GET /api/orders/my-orders` (user)
- `GET /api/orders` (admin)
- `PUT /api/orders/:id/status` (admin)

### Vouchers

- `GET /api/vouchers`
- `POST /api/vouchers` (admin)
- `PUT /api/vouchers/:id` (admin)
- `PATCH /api/vouchers/:id/toggle` (admin)

## 9. Checklist demo nhanh

1. Mở `https://fashion-shop-project-4pxx.onrender.com/api/health` để xác nhận backend live.
2. Mở Expo build page để xác nhận APK đã build thành công.
3. Mở GitHub Release của APK để xác nhận artifact đã được phát hành.
4. Demo mobile: đăng nhập -> xem sản phẩm -> thêm giỏ -> checkout -> xem lịch sử đơn.
5. Demo admin: đăng nhập -> vào Orders -> cập nhật trạng thái đơn hàng.

## 10. Một số lỗi thường gặp

- Mobile không gọi được API production:
  - kiểm tra `EXPO_PUBLIC_API_BASE_URL` trong `mobile/eas.json`
- Render deploy fail do không tìm thấy `package.json`:
  - kiểm tra Render đang dùng root directory `server`
- MongoDB Atlas báo `bad auth`:
  - kiểm tra lại `Database Access`, password, và `MONGO_URI`
- PowerShell báo chặn `eas.ps1`:
  - dùng `eas.cmd` thay cho `eas`

## 11. Tài liệu bổ sung

- [docs/manual-test-checklist.md](docs/manual-test-checklist.md)
- [docs/mobile-release-checklist.md](docs/mobile-release-checklist.md)
- [docs/project-review-tonight.md](docs/project-review-tonight.md)
