const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();
// Use bcryptjs which is listed in package.json and is compatible with bcrypt hashes
const bcrypt = require('bcryptjs');

const admins = [
  {
    name: 'Café Admin',
    department: 'Café',
    email: 'cafe@university.edu',
    password: 'admin123'
  },
  {
    name: 'IT Admin',
    department: 'IT',
    email: 'it@university.edu',
    password: 'admin123'
  },
  {
    name: 'Library Admin',
    department: 'Library',
    email: 'library@university.edu',
    password: 'admin123'
  },
  {
    name: 'Dorm Admin',
    department: 'Dorm',
    email: 'dorm@university.edu',
    password: 'admin123'
  },
  {
    name: 'Registrar Admin',
    department: 'Registrar',
    email: 'registrar@university.edu',
    password: 'admin123'
  }
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/complaint_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing admins (optional - remove if you want to keep existing)
    await Admin.deleteMany({});
    console.log('Cleared existing admins');


        // Hash passwords for all admins
    for (let admin of admins) {
      admin.password = await bcrypt.hash(admin.password, 10); // 10 = salt rounds
    }

    // Insert new admins
    const createdAdmins = await Admin.insertMany(admins);
    console.log(`Created ${createdAdmins.length} admin users:`);
    createdAdmins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - Department: ${admin.department}`);
    });

    console.log('\nDefault password for all admins: admin123');
    console.log('Please change passwords in production!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admins:', error);
    process.exit(1);
  }
};

seedAdmins();

