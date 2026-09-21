require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const workerRoutes = require('./routes/workerRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Model imports for initial seed
const Project = require('./models/Project');
const Worker = require('./models/Worker');
const Attendance = require('./models/Attendance');
const Advance = require('./models/Advance');
const PaymentTransaction = require('./models/PaymentTransaction');

const app = express();
const PORT = process.env.PORT || 5001;

// 2. Fix CORS: Permissive CORS configuration to accept requests from any frontend port/origin
app.use(cors({
  origin: true, // Reflect request origin or allow *
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payments', paymentRoutes);

// Database auto-seeder for demo convenience
const seedSampleDataIfEmpty = async () => {
  try {
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('Seeding initial construction projects and workers...');

      // 1. Projects
      const metroProject = await Project.create({
        name: 'Metro Line 4 - Phase 2',
        location: 'Sector 62, Noida, UP',
        startDate: new Date('2026-01-15'),
        status: 'Active',
        description: 'Elevated viaduct construction with 6 stations and maintenance depot.',
      });

      const residentialProject = await Project.create({
        name: 'Skyline Heights Tower A & B',
        location: 'Whitefield, Bengaluru, KA',
        startDate: new Date('2026-02-01'),
        status: 'Active',
        description: 'Luxury high-rise residential complex with 24 floors.',
      });

      const highwayProject = await Project.create({
        name: 'Expressway Bypass Flyover',
        location: 'Outer Ring Road, Hyderabad, TS',
        startDate: new Date('2025-11-10'),
        status: 'Completed',
        description: '6-lane flyover to decongest junction traffic.',
      });

      // 2. Workers
      const workers = await Worker.insertMany([
        {
          name: 'Ramesh Kumar',
          phone: '9344951989',
          dailyWageRate: 850,
          assignedProject: metroProject._id,
          role: 'Mason Specialist',
          status: 'Active',
        },
        {
          name: 'Suresh Patel',
          phone: '8220289579',
          dailyWageRate: 900,
          assignedProject: metroProject._id,
          role: 'Steel Fixer',
          status: 'Active',
        },
        {
          name: 'Rajesh Verma',
          phone: '7305304100',
          dailyWageRate: 750,
          assignedProject: residentialProject._id,
          role: 'Carpenter',
          status: 'Active',
        },
        {
          name: 'Dinesh Yadav',
          phone: '9443963668',
          dailyWageRate: 800,
          assignedProject: residentialProject._id,
          role: 'Concrete Finisher',
          status: 'Active',
        },
        {
          name: 'Amit Sharma',
          phone: '9876543205',
          dailyWageRate: 650,
          assignedProject: metroProject._id,
          role: 'General Helper',
          status: 'Active',
        },
      ]);

      // 3. Sample Attendance for past 3 days
      const today = new Date();
      const formatYMD = (d) => d.toISOString().split('T')[0];

      const d0 = formatYMD(today);
      const d1 = formatYMD(new Date(today.getTime() - 86400000));
      const d2 = formatYMD(new Date(today.getTime() - 86400000 * 2));
      const d3 = formatYMD(new Date(today.getTime() - 86400000 * 3));

      await Attendance.insertMany([
        // Ramesh: 3 present, 1 half-day
        { workerId: workers[0]._id, projectId: metroProject._id, date: d0, status: 'Present' },
        { workerId: workers[0]._id, projectId: metroProject._id, date: d1, status: 'Present' },
        { workerId: workers[0]._id, projectId: metroProject._id, date: d2, status: 'Present' },
        { workerId: workers[0]._id, projectId: metroProject._id, date: d3, status: 'Half-day' },

        // Suresh: 2 present, 1 half-day, 1 absent
        { workerId: workers[1]._id, projectId: metroProject._id, date: d0, status: 'Present' },
        { workerId: workers[1]._id, projectId: metroProject._id, date: d1, status: 'Half-day' },
        { workerId: workers[1]._id, projectId: metroProject._id, date: d2, status: 'Absent' },
        { workerId: workers[1]._id, projectId: metroProject._id, date: d3, status: 'Present' },

        // Rajesh: 3 present
        { workerId: workers[2]._id, projectId: residentialProject._id, date: d0, status: 'Present' },
        { workerId: workers[2]._id, projectId: residentialProject._id, date: d1, status: 'Present' },
        { workerId: workers[2]._id, projectId: residentialProject._id, date: d2, status: 'Present' },

        // Dinesh: 2 present, 1 half-day
        { workerId: workers[3]._id, projectId: residentialProject._id, date: d0, status: 'Present' },
        { workerId: workers[3]._id, projectId: residentialProject._id, date: d1, status: 'Half-day' },
        { workerId: workers[3]._id, projectId: residentialProject._id, date: d2, status: 'Present' },

        // Amit: 1 present, 1 absent
        { workerId: workers[4]._id, projectId: metroProject._id, date: d0, status: 'Present' },
        { workerId: workers[4]._id, projectId: metroProject._id, date: d1, status: 'Absent' },
      ]);

      // 4. Sample Advance
      await Advance.create({
        workerId: workers[0]._id,
        amount: 500,
        paymentMode: 'Cash',
        reason: 'Emergency medicine expense',
        date: new Date(today.getTime() - 86400000),
      });

      // 5. Sample Payment Transaction
      await PaymentTransaction.create({
        workerId: workers[2]._id,
        amount: 1500,
        paymentMethod: 'PhonePe',
        status: 'Success',
        transactionReference: `TXN-PP-${Date.now()}-9901`,
        details: {
          phoneNumber: workers[2].phone,
          notes: 'Advance weekly wage clearance',
        },
        date: new Date(),
      });

      console.log('Sample data seeded successfully.');
    }
  } catch (err) {
    console.error('Error during auto-seeding:', err.message);
  }
};

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start Server
const startServer = async () => {
  await connectDB();

  // Auto-seeding disabled by default so database remains clean for fresh start.
  // Set SEED_DEMO_DATA=true in .env if you wish to seed initial sample records.
  if (process.env.SEED_DEMO_DATA === 'true') {
    await seedSampleDataIfEmpty();
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
