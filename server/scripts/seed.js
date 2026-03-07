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

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@fashion.com',
      password: '123456',
      phone: '0900000000',
      address: 'HCM City',
      role: 'admin'
    });

    const categories = await Category.insertMany([{ name: 'Áo thun' }, { name: 'Quần jeans' }, { name: 'Áo khoác' }]);

    await Product.insertMany([
      {
        name: 'Áo thun basic trắng',
        price: 199000,
        description: 'Áo cotton mềm mịn',
        image: 'https://picsum.photos/300/300?1',
        sizes: ['S', 'M', 'L'],
        colors: ['Trắng', 'Đen'],
        stock: 50,
        categoryId: categories[0]._id
      },
      {
        name: 'Quần jeans xanh slim-fit',
        price: 399000,
        description: 'Form ôm trẻ trung',
        image: 'https://picsum.photos/300/300?2',
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh'],
        stock: 25,
        categoryId: categories[1]._id
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
