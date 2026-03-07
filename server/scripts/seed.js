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
      { name: 'Ao khoac' }
    ]);

    await Product.insertMany([
      {
        name: 'Ao thun Basic Trang Premium',
        price: 219000,
        description: 'Chat cotton 100%, mac mat, phu hop di hoc va di choi.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Trang', 'Den', 'Xam'],
        stock: 80,
        categoryId: categories[0]._id
      },
      {
        name: 'Ao so mi Oxford Xanh Nhat',
        price: 349000,
        description: 'Form regular, lich su, phu hop di lam va thuyet trinh.',
        image: 'https://images.unsplash.com/photo-1602810319428-019690571b5b?auto=format&fit=crop&w=700&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh nhat', 'Trang'],
        stock: 45,
        categoryId: categories[1]._id
      },
      {
        name: 'Quan jeans Slim-fit Xanh Dam',
        price: 429000,
        description: 'Co gian nhe, dung form dep, de phoi do.',
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
