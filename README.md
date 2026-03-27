# Fashion Shop Project (Full-stack)

Project gồm 3 phần trong cùng repo:
- `server/`: Node.js + Express + MongoDB REST API
- `mobile/`: React Native (Expo) cho khách hàng
- `admin/`: React web cho quản trị

## 1) Cấu trúc thư mục

```
fashion-shop-project/
  server/
    config models controllers routes middleware utils scripts
  mobile/
    screens components services navigation context constants
  admin/
    src/pages src/components src/services src/routes src/context
```

## 2) Yêu cầu môi trường

- Node.js 18+
- MongoDB local hoặc MongoDB Atlas
- Expo Go (nếu chạy mobile trên điện thoại)

## 3) Chạy backend (`/server`)

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend chạy mặc định ở `http://localhost:5000`.

### Deploy backend lên Render

Repo đã có sẵn blueprint [render.yaml](render.yaml) để deploy backend Express trong monorepo này.

1. Push repo lên GitHub.
2. Tạo MongoDB public, khuyến nghị MongoDB Atlas.
3. Vào Render Dashboard -> `New +` -> `Blueprint` -> chọn repo này.
4. Render sẽ đọc [render.yaml](render.yaml) và tạo web service `fashion-shop-api` từ thư mục `server`.
5. Khi được hỏi biến môi trường, nhập:

```bash
MONGO_URI=<mongodb-atlas-connection-string>
```

`JWT_SECRET` sẽ được Render tự sinh, còn `JWT_EXPIRES_IN` mặc định là `7d`.

Sau khi deploy xong, backend sẽ có URL dạng:

```bash
https://fashion-shop-api.onrender.com
```

Health check:

```bash
https://fashion-shop-api.onrender.com/api/health
```

Để mobile dùng backend production, đặt:

```bash
EXPO_PUBLIC_API_BASE_URL=https://fashion-shop-api.onrender.com/api
```

Lưu ý:
- Render không cung cấp MongoDB cho app Node/Mongoose này, nên `MONGO_URI` phải là MongoDB Atlas hoặc MongoDB public khác.
- Nếu cần dữ liệu mẫu sau deploy, mở Render Shell hoặc chạy local với cùng `MONGO_URI` rồi thực hiện `npm run seed` trong thư mục `server`.

### Tài khoản admin seed sẵn
- Email: `admin@fashion.com`
- Password: `123456`

## 4) Chạy mobile app (`/mobile`)

```bash
cd mobile
npm install
npm start
```

> Sửa `mobile/constants/config.js` để trỏ về backend đúng môi trường:
- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`
- Điện thoại thật: `http://<LAN_IP_MAY_TINH>:5000/api`

### Build APK / AAB cho Android

Mobile đang dùng Expo, vì vậy nên build bằng EAS.

1. Deploy backend ra URL public, ví dụ `https://fashion-shop-api.onrender.com/api`
2. Vào `mobile/.env` và đặt:

```bash
EXPO_PUBLIC_API_BASE_URL=https://fashion-shop-api.onrender.com/api
```

3. Cập nhật `mobile/app.json`:
  - `expo.android.package`: package id Android duy nhất của bạn
  - `expo.extra.eas.projectId`: project id sau khi chạy `eas init`
4. Đăng nhập Expo và khởi tạo EAS:

```bash
cd mobile
npm install
npx eas login
npx eas init
```

5. Build APK để nộp hoặc upload APKPure:

```bash
npm run build:android:apk
```

6. Build AAB để đưa lên Google Play:

```bash
npm run build:android:aab
```

Lưu ý:
- App build thật không dùng được `localhost` hoặc `10.0.2.2`, bắt buộc backend phải có URL public.
- File `mobile/eas.json` đã có sẵn 2 profile: `preview` tạo APK và `production` tạo AAB.
- Nếu Render cấp URL khác với `https://fashion-shop-api.onrender.com`, cập nhật lại `EXPO_PUBLIC_API_BASE_URL` trong `mobile/eas.json` và `mobile/.env`.

## 5) Chạy admin web (`/admin`)

```bash
cd admin
npm install
npm run dev
```

Admin web chạy mặc định ở `http://localhost:5173`.

Tùy chọn cấu hình API URL cho admin:

```bash
# admin/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 6) API chính

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Categories:
  - `GET /api/categories`
  - `POST /api/categories` (admin)
  - `PUT /api/categories/:id` (admin)
  - `DELETE /api/categories/:id` (admin)
- Products:
  - `GET /api/products?search=&categoryId=`
  - `GET /api/products/:id`
  - `POST /api/products` (admin)
  - `PUT /api/products/:id` (admin)
  - `DELETE /api/products/:id` (admin)
- Orders:
  - `POST /api/orders` (user)
  - `GET /api/orders/my-orders` (user)
  - `GET /api/orders` (admin)
  - `PUT /api/orders/:id/status` (admin)

## 7) Đồng bộ dữ liệu giữa 3 phần

- JWT token: backend trả về ở login/register, mobile lưu AsyncStorage, admin lưu localStorage
- Role: `user` và `admin`, route admin được bảo vệ
- Product field thống nhất: `name, price, description, image, sizes, colors, stock, categoryId`
- Order item field thống nhất: `productId, name, image, price, quantity, size, color`
- Response format: `{ success, message?, data? }`

## 8) Checklist chạy end-to-end nhanh

1. Chạy backend + seed data (`server`).
2. Đăng nhập admin ở web admin bằng tài khoản seed để quản lý category/product/order.
3. Đăng ký user mới từ mobile.
4. Từ mobile: xem sản phẩm -> thêm giỏ -> checkout -> xem lịch sử đơn.
5. Quay lại admin: vào trang Orders để cập nhật trạng thái đơn.

## 9) Những lỗi hay gặp & cách xử lý

- **Mobile không gọi được API:** đổi `mobile/constants/config.js` sang đúng LAN IP/emulator URL.
- **Admin login lỗi 401/403:** kiểm tra đã `npm run seed`, dùng đúng account admin seed.
- **MongoDB connection failed:** kiểm tra `MONGO_URI` trong `server/.env`.

## 10) Mức độ hoàn thiện

- Đã có auth JWT, phân quyền admin/user, CRUD sản phẩm/danh mục, tạo đơn/lịch sử đơn, quản lý đơn trên admin.
- UI giữ đơn giản, ưu tiên dễ chạy, dễ demo, dễ sửa.
