const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany()]);

    await User.create({
      name: 'Admin Fashion Shop',
      email: 'admin@fashion.com',
      password: '123456',
      phone: '0900000000',
      address: 'Quận 1, TP.HCM',
      role: 'admin'
    });

    const categories = await Category.insertMany([
      { name: 'Áo thun' },
      { name: 'Áo sơ mi' },
      { name: 'Quần jeans' },
      { name: 'Áo khoác' },
      { name: 'Váy' },
      { name: 'Phụ kiện' }
    ]);

    await Product.insertMany([
      {
        name: 'Áo thun Basic Trắng Premium',
        price: 219000,
        description: 'Chất cotton 100%, thoáng mát, dễ mặc đi học và đi chơi.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Trắng', 'Đen', 'Xám'],
        stock: 80,
        categoryId: categories[0]._id
      },
      {
        name: 'Áo thun Oversize Graphic',
        price: 269000,
        description: 'Form rộng trẻ trung, in graphic nổi bật, hợp style street.',
        image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Trắng kem'],
        stock: 55,
        categoryId: categories[0]._id
      },
      {
        name: 'Áo sơ mi Oxford Xanh Nhạt',
        price: 349000,
        description: 'Form regular lịch sự, hợp đi làm và thuyết trình.',
        image: 'https://images.unsplash.com/photo-1602810319428-019690571b5b?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh nhạt', 'Trắng'],
        stock: 45,
        categoryId: categories[1]._id
      },
      {
        name: 'Áo sơ mi Linen Ngắn tay',
        price: 389000,
        description: 'Vải linen nhẹ, mặc mát mùa hè, dễ phối quần short.',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Be', 'Xanh navy'],
        stock: 38,
        categoryId: categories[1]._id
      },
      {
        name: 'Quần jeans Slim-fit Xanh Đậm',
        price: 429000,
        description: 'Co giãn nhẹ, đứng form đẹp, dễ phối đồ hàng ngày.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80',
        sizes: ['29', '30', '31', '32', '33'],
        colors: ['Xanh đậm'],
        stock: 60,
        categoryId: categories[2]._id
      },
      {
        name: 'Áo khoác Bomber Đen',
        price: 559000,
        description: 'Vải dày vừa, giữ ấm tốt, kiểu dáng trẻ trung.',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh rêu'],
        stock: 35,
        categoryId: categories[3]._id
      },
      {
        name: 'Váy Midi Họa tiết nhẹ',
        price: 499000,
        description: 'Dáng midi nữ tính, vải mềm nhẹ, hợp đi học và đi chơi.',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80',
        sizes: ['S', 'M', 'L'],
        colors: ['Hồng nhạt', 'Kem'],
        stock: 28,
        categoryId: categories[4]._id
      },
      {
        name: 'Mũ lưỡi trai Basic',
        price: 159000,
        description: 'Phụ kiện dễ phối đồ, gọn nhẹ và dễ sử dụng mỗi ngày.',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80',
        sizes: ['Free size'],
        colors: ['Đen', 'Xám', 'Be'],
        stock: 90,
        categoryId: categories[5]._id
      }
    ]);

    console.log('Seed successful');
    console.log('Admin account: admin@fashion.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
