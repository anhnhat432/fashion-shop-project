# Fashion Shop Project - Bản Trình Bày Tối Nay

## 1. Mở đầu 30-45 giây

Em xin trình bày dự án `Fashion Shop Project`, là một hệ thống bán hàng thời trang full-stack gồm 3 phần:

- `server`: backend Node.js + Express + MongoDB
- `mobile`: ứng dụng React Native Expo cho khách hàng
- `admin`: web React cho quản trị viên

Mục tiêu của dự án là xây dựng một quy trình mua hàng hoàn chỉnh: quản lý sản phẩm, đăng ký đăng nhập, thêm vào giỏ, đặt hàng, theo dõi đơn hàng, và quản trị dữ liệu ở phía admin.

## 2. Kiến trúc dự án 45-60 giây

Hệ thống của em hoạt động theo mô hình client-server:

- Mobile app và admin web gọi REST API từ backend
- Backend xử lý xác thực JWT, phân quyền user/admin, và thao tác với MongoDB
- MongoDB lưu user, category, product, order, voucher và review

Dữ liệu được đồng bộ giữa 3 phần:

- user đăng nhập ở mobile
- admin quản lý sản phẩm và đơn hàng ở web
- backend là nơi xử lý logic nghiệp vụ và lưu trữ

## 3. Tính năng chính 60-90 giây

Phía khách hàng trên mobile:

- đăng ký, đăng nhập, đổi mật khẩu
- xem danh sách sản phẩm
- tìm kiếm và lọc theo danh mục
- xem chi tiết sản phẩm
- chọn size, màu, số lượng
- thêm vào giỏ hàng
- wishlist
- review sản phẩm
- áp dụng voucher khi thanh toán
- xem lịch sử đơn hàng

Phía admin web:

- đăng nhập admin
- CRUD category
- CRUD product
- xem và cập nhật trạng thái order
- quản lý voucher
- quản lý người dùng

Phía backend:

- JWT authentication
- role-based authorization
- quản lý tồn kho theo biến thể size/màu
- logic voucher
- API health check và deploy production

## 4. Luồng demo nên đi 3-5 phút

### Demo 1: Backend production

Mở:

- `https://fashion-shop-project-4pxx.onrender.com/api/health`

Nói:

"Đây là backend production đã deploy trên Render. Em đã tách backend ra và đưa lên môi trường public để mobile APK có thể gọi API thật."

### Demo 2: APK build thành công

Mở:

- `https://expo.dev/accounts/anhnhat4321/projects/fashion-shop-mobile/builds`

Chọn build Android mới nhất có:

- `Status: Finished`
- `Build artifact: APK`

Nói:

"Phần mobile được build bằng Expo EAS. Bản build Android đã hoàn tất và đã tạo ra file APK để phục vụ deploy."

### Demo 3: GitHub Release

Mở:

- `https://github.com/anhnhat432/fashion-shop-project/releases/tag/v1.0.0-apk`

Nói:

"Để có bằng chứng phát hành rõ ràng, em đã tạo GitHub Release và đính kèm file APK build từ Expo."

### Demo 4: APKPure

Mở trang APKPure Developer Console hoặc submission status của bạn.

Nói:

"Em đã submit APK lên APKPure. Hiện tại họ đang review thủ công nên trạng thái đang chờ phê duyệt. Tuy chưa có link public chính thức ngay, nhưng phần deploy APK và hồ sơ submit đã hoàn tất."

### Demo 5: Chạy chức năng

Nếu có điện thoại Android đã cài APK, ưu tiên demo trên điện thoại:

1. Mở app
2. Đăng nhập hoặc đăng ký user
3. Vào Home -> chọn sản phẩm
4. Chọn size/màu -> thêm vào giỏ
5. Vào Cart -> Checkout
6. Vào Order History để xem đơn

Nếu mở được admin web, demo thêm:

1. Đăng nhập admin
2. Vào Orders
3. Cập nhật trạng thái đơn hàng

## 5. Câu nói tổng kết 20-30 giây

"Tổng kết lại, dự án đã hoàn thành được một luồng bán hàng full-stack gồm mobile cho khách, admin web cho quản trị và backend production. Em đã build APK thành công, backend đã deploy public, và đã submit APK lên APKPure để đáp ứng yêu cầu deploy ứng dụng."

## 6. Nếu thầy hỏi "em đã deploy chưa?"

Trả lời ngắn:

"Dạ rồi ạ. Backend đã deploy trên Render, APK đã build thành công trên Expo EAS, GitHub Release đã tạo để phát hành file APK, và APKPure đã nhận hồ sơ nhưng đang review thủ công."

## 7. Nếu thầy hỏi "vì sao APKPure chưa có link public ngay?"

Trả lời ngắn:

"APKPure có bước review thủ công để xác minh ownership và nội dung an toàn. Em đã nộp APK và proof ownership, nên hiện đang ở trạng thái chờ phê duyệt."

## 8. Nếu thầy hỏi "project này có gì khó?"

Trả lời gợi ý:

- đồng bộ 3 phần mobile, backend, admin
- xác thực JWT và phân quyền admin/user
- quản lý tồn kho theo biến thể size và màu
- xử lý voucher và cập nhật tổng tiền khi checkout
- đưa mobile lên APK với backend production thay vì localhost

## 9. Nếu thầy hỏi "em test như thế nào?"

Trả lời gợi ý:

"Em test theo luồng người dùng và admin: wishlist, review, biến thể tồn kho, voucher, tạo đơn, lịch sử đơn hàng và cập nhật trạng thái đơn bên admin. Em đồng thời test đường deploy backend và build APK để đảm bảo bản production có thể chạy được."

## 10. 4 tab nên mở sẵn trước giờ review

Mở sẵn 4 tab này:

1. `https://fashion-shop-project-4pxx.onrender.com/api/health`
2. `https://expo.dev/accounts/anhnhat4321/projects/fashion-shop-mobile/builds`
3. `https://github.com/anhnhat432/fashion-shop-project/releases/tag/v1.0.0-apk`
4. APKPure Developer Console / trang pending review

## 11. Phương án dự phòng nếu mạng chậm

Chuẩn bị sẵn:

- ảnh chụp Render health check
- ảnh chụp Expo build Finished
- ảnh chụp GitHub Release có file APK
- ảnh chụp APKPure đang review
- file APK trong máy
- nếu được, 1 điện thoại Android đã cài sẵn app

## 12. Mẫu nói trong 2 phút

"Em xin trình bày dự án Fashion Shop Project. Đây là một hệ thống full-stack gồm backend Node.js + Express + MongoDB, mobile app React Native Expo cho khách hàng, và admin web React cho quản trị viên. Về chức năng, phía mobile hỗ trợ đăng ký, đăng nhập, xem sản phẩm, wishlist, review, thêm giỏ hàng, áp voucher, đặt hàng và xem lịch sử đơn. Phía admin hỗ trợ CRUD sản phẩm, danh mục, voucher, user và quản lý đơn hàng. Về production, em đã deploy backend lên Render, build APK thành công bằng Expo EAS, tạo GitHub Release có đính kèm file APK, và submit APK lên APKPure. Hiện APKPure đang review thủ công. Em xin demo nhanh luồng user trên mobile và phần admin cập nhật đơn hàng."

