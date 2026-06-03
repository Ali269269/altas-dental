const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: 'admin@altasdental.com',
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await Admin.create({
      email: 'admin@altasdental.com',
      password: 'AdminPassword123', // Change this to a secure password
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${admin.email}`);
    console.log('Password: AdminPassword123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
