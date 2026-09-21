require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

// Import all Mongoose models
const Project = require('../src/models/Project');
const Worker = require('../src/models/Worker');
const Attendance = require('../src/models/Attendance');
const Advance = require('../src/models/Advance');
const PaymentTransaction = require('../src/models/PaymentTransaction');

const clearDatabase = async () => {
  try {
    console.log('--- INITIALIZING DATABASE WIPE ---');
    await connectDB();

    // 1. Clear Projects
    const projectRes = await Project.deleteMany({});
    console.log(`✓ Projects collection cleared (${projectRes.deletedCount} documents deleted)`);

    // 2. Clear Workers
    const workerRes = await Worker.deleteMany({});
    console.log(`✓ Workers collection cleared (${workerRes.deletedCount} documents deleted)`);

    // 3. Clear Attendance
    const attendanceRes = await Attendance.deleteMany({});
    console.log(`✓ Attendance collection cleared (${attendanceRes.deletedCount} documents deleted)`);

    // 4. Clear Advances
    const advanceRes = await Advance.deleteMany({});
    console.log(`✓ Advances collection cleared (${advanceRes.deletedCount} documents deleted)`);

    // 5. Clear Payment Transactions
    const paymentRes = await PaymentTransaction.deleteMany({});
    console.log(`✓ PaymentTransaction collection cleared (${paymentRes.deletedCount} documents deleted)`);

    console.log('------------------------------------');
    console.log('🎉 All test records successfully wiped. Database is clean and ready for a fresh start.');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error while clearing database:', error.message);
    process.exit(1);
  }
};

clearDatabase();
