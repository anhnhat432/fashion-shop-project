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

### Tài khoản admin seed sẵn
- Email: `admin@fashion.com`
- Password: `123456`

## 4) Chạy mobile app (`/mobile`)

```bash
cd mobile
npm install
npm start
```

> Lưu ý: sửa `mobile/constants/config.js` để trỏ về IP backend phù hợp:
- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`
- Điện thoại thật: `http://<LAN_IP_MAY_TINH>:5000/api`

## 5) Chạy admin web (`/admin`)

```bash
cd admin
npm install
npm run dev
```

Admin web chạy mặc định ở `http://localhost:5173`.

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
- Product field dùng thống nhất: `name, price, description, image, sizes, colors, stock, categoryId`
- Order item field dùng thống nhất: `productId, name, image, price, quantity, size, color`

## 8) Điểm cần cấu hình thủ công

1. `server/.env` (MONGO_URI, JWT_SECRET)
2. `mobile/constants/config.js` để đúng URL backend
3. CORS/back-end URL nếu deploy khác host

## 9) Mức độ hoàn thiện

- Đủ CRUD cơ bản, auth JWT, phân quyền admin/user, đặt hàng, lịch sử đơn hàng.
- UI đơn giản, dễ demo, dễ chỉnh sửa cho môn học.
