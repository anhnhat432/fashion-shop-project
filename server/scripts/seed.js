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
      address: 'Quan 1, TP.HCM',
      role: 'admin'
    });

    const categories = await Category.insertMany([
      { name: 'Ao thun' },
      { name: 'Ao so mi' },
      { name: 'Quan jeans' },
      { name: 'Ao khoac' },
      { name: 'Vay' },
      { name: 'Phu kien' }
    ]);

    await Product.insertMany([
      {
        name: 'Ao thun Basic Trang Premium',
        price: 219000,
        description: 'Chat cotton 100%, thoang mat, de mac di hoc va di choi.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Trang', 'Den', 'Xam'],
        stock: 80,
        categoryId: categories[0]._id
      },
      {
        name: 'Ao thun Oversize Graphic',
        price: 269000,
        description: 'Form rong tre trung, in graphic noi bat, hop style street.',
        image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Den', 'Trang kem'],
        stock: 55,
        categoryId: categories[0]._id
      },
      {
        name: 'Ao so mi Oxford Xanh Nhat',
        price: 349000,
        description: 'Form regular lich su, hop di lam va thuyet trinh.',
        image: 'https://images.unsplash.com/photo-1602810319428-019690571b5b?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh nhat', 'Trang'],
        stock: 45,
        categoryId: categories[1]._id
      },
      {
        name: 'Ao so mi Linen Ngan tay',
        price: 389000,
        description: 'Vai linen nhe, mac mat mua he, de phoi quan short.',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Be', 'Xanh navy'],
        stock: 38,
        categoryId: categories[1]._id
      },
      {
        name: 'Quan jeans Slim-fit Xanh Dam',
        price: 429000,
        description: 'Co gian nhe, dung form dep, de phoi do hang ngay.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80',
        sizes: ['29', '30', '31', '32', '33'],
        colors: ['Xanh dam'],
        stock: 60,
        categoryId: categories[2]._id
      },
      {
        name: 'Ao khoac Bomber Den',
        price: 559000,
        description: 'Vai day vua, giu am tot, kieu dang tre trung.',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Den', 'Xanh reu'],
        stock: 35,
        categoryId: categories[3]._id
      },
      {
        name: 'Vay Midi Hoa tiet nhe',
        price: 499000,
        description: 'Dang midi nu tinh, vai mem nhe, hop di hoc va di choi.',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80',
        sizes: ['S', 'M', 'L'],
        colors: ['Hong nhat', 'Kem'],
        stock: 28,
        categoryId: categories[4]._id
      },
      {
        name: 'Mu luoi trai Basic',
        price: 159000,
        description: 'Phu kien de phoi do, gon nhe va de su dung moi ngay.',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80',
        sizes: ['Free size'],
        colors: ['Den', 'Xam', 'Be'],
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
