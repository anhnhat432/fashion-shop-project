const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Voucher.deleteMany(),
    ]);

    const adminUser = await User.create({
      name: "Admin Fashion Shop",
      email: "admin@fashion.com",
      password: "123456",
      phone: "0900000000",
      address: "Quận 1, TP.HCM",
      role: "admin",
    });

    const categories = await Category.insertMany([
      { name: "Áo thun" },
      { name: "Áo sơ mi" },
      { name: "Quần jeans" },
      { name: "Áo khoác" },
      { name: "Váy" },
      { name: "Phụ kiện" },
    ]);

    await Product.insertMany([
      {
        name: "Áo thun Basic Trắng Premium",
        price: 219000,
        salePrice: 189000,
        description: "Chất cotton 100%, thoáng mát, dễ mặc đi học và đi chơi.",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Trắng", "Đen", "Xám"],
        stock: 80,
        variants: [
          { size: "S", color: "Trắng", stock: 12 },
          { size: "M", color: "Trắng", stock: 10 },
          { size: "L", color: "Trắng", stock: 8 },
          { size: "XL", color: "Trắng", stock: 6 },
          { size: "S", color: "Đen", stock: 11 },
          { size: "M", color: "Đen", stock: 10 },
          { size: "L", color: "Đen", stock: 8 },
          { size: "XL", color: "Đen", stock: 5 },
          { size: "S", color: "Xám", stock: 4 },
          { size: "M", color: "Xám", stock: 3 },
          { size: "L", color: "Xám", stock: 2 },
          { size: "XL", color: "Xám", stock: 1 },
        ],
        reviews: [
          {
            userId: adminUser._id,
            name: "Admin Fashion Shop",
            rating: 5,
            comment: "Form đẹp và chất vải ổn.",
          },
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Áo thun Oversize Graphic",
        price: 269000,
        description:
          "Form rộng trẻ trung, in graphic nổi bật, hợp style street.",
        image:
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80",
        sizes: ["M", "L", "XL"],
        colors: ["Đen", "Trắng kem"],
        stock: 55,
        variants: [
          { size: "M", color: "Đen", stock: 15 },
          { size: "L", color: "Đen", stock: 12 },
          { size: "XL", color: "Đen", stock: 8 },
          { size: "M", color: "Trắng kem", stock: 10 },
          { size: "L", color: "Trắng kem", stock: 6 },
          { size: "XL", color: "Trắng kem", stock: 4 },
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Áo sơ mi Oxford Xanh Nhạt",
        price: 349000,
        description: "Form regular lịch sự, hợp đi làm và thuyết trình.",
        image:
          "https://images.unsplash.com/photo-1602810319428-019690571b5b?auto=format&fit=crop&w=700&q=80",
        sizes: ["M", "L", "XL"],
        colors: ["Xanh nhạt", "Trắng"],
        stock: 45,
        categoryId: categories[1]._id,
      },
      {
        name: "Áo sơ mi Linen Ngắn tay",
        price: 389000,
        description: "Vải linen nhẹ, mặc mát mùa hè, dễ phối quần short.",
        image:
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80",
        sizes: ["M", "L", "XL"],
        colors: ["Be", "Xanh navy"],
        stock: 38,
        categoryId: categories[1]._id,
      },
      {
        name: "Quần jeans Slim-fit Xanh Đậm",
        price: 429000,
        description: "Co giãn nhẹ, đứng form đẹp, dễ phối đồ hàng ngày.",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80",
        sizes: ["29", "30", "31", "32", "33"],
        colors: ["Xanh đậm"],
        stock: 60,
        variants: [
          { size: "29", color: "Xanh đậm", stock: 8 },
          { size: "30", color: "Xanh đậm", stock: 12 },
          { size: "31", color: "Xanh đậm", stock: 15 },
          { size: "32", color: "Xanh đậm", stock: 14 },
          { size: "33", color: "Xanh đậm", stock: 11 },
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Áo khoác Bomber Đen",
        price: 559000,
        description: "Vải dày vừa, giữ ấm tốt, kiểu dáng trẻ trung.",
        image:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
        sizes: ["M", "L", "XL"],
        colors: ["Đen", "Xanh rêu"],
        stock: 35,
        salePrice: 499000,
        variants: [
          { size: "M", color: "Đen", stock: 8 },
          { size: "L", color: "Đen", stock: 7 },
          { size: "XL", color: "Đen", stock: 4 },
          { size: "M", color: "Xanh rêu", stock: 6 },
          { size: "L", color: "Xanh rêu", stock: 5 },
          { size: "XL", color: "Xanh rêu", stock: 5 },
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Váy Midi Họa tiết nhẹ",
        price: 499000,
        description: "Dáng midi nữ tính, vải mềm nhẹ, hợp đi học và đi chơi.",
        image:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
        sizes: ["S", "M", "L"],
        colors: ["Hồng nhạt", "Kem"],
        stock: 28,
        categoryId: categories[4]._id,
      },
      {
        name: "Mũ lưỡi trai Basic",
        price: 159000,
        description: "Phụ kiện dễ phối đồ, gọn nhẹ và dễ sử dụng mỗi ngày.",
        image:
          "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80",
        sizes: ["Free size"],
        colors: ["Đen", "Xám", "Be"],
        stock: 90,
        categoryId: categories[5]._id,
      },
    ]);

    await Voucher.insertMany([
      {
        code: "WELCOME10",
        type: "PERCENT",
        value: 10,
        minOrderValue: 300000,
        maxDiscount: 80000,
        isActive: true,
      },
      {
        code: "FREESHIP30",
        type: "FIXED",
        value: 30000,
        minOrderValue: 250000,
        isActive: true,
      },
    ]);

    console.log("Seed successful");
    console.log("Admin account: admin@fashion.com / 123456");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
