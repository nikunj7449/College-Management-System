const dotenv = require('dotenv');

const path = require('path');

// 1. Load env vars BEFORE importing other files
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Handle Uncaught Exceptions (Sync Errors)
// Put this at the top to catch errors in imports
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(err.stack);
  console.log('Shutting down due to uncaught exception');
  process.exit(1);
});

const connectDB = require('./config/db');
const app = require('./app');
const { initCronJobs } = require('./utils/cronJobs');

// Connect to database
connectDB().then(async () => {
  // Seed default system modules
  const Module = require('./models/Module');
  const Role = require('./models/Role');

  const systemModulesList = [
    'STUDENT', 'FACULTY', 'ADMIN', 'COURSE',
    'ATTENDANCE', 'EVENT', 'PERFORMANCE',
    'REMARK', 'USER', 'ROLE', 'EXAM', 'FEE'
  ];

  try {
    const existingModules = await Module.find({ name: { $in: systemModulesList } });
    const existingModuleNames = existingModules.map(m => m.name);

    for (const modName of systemModulesList) {
      if (!existingModuleNames.includes(modName)) {
        await Module.create({ name: modName, isSystem: true });
        console.log(`[Seeder] Created core system module: ${modName}`);
      }
    }

    // Prepare default full permissions object dynamically based on modules
    const allModules = await Module.find({});
    const superAdminPerms = {};
    allModules.forEach(mod => {
      superAdminPerms[mod.name] = { create: true, read: true, update: true, delete: true };
    });

    const defaultSidebarConfig = [
      { key: 'DASHBOARD', label: 'Dashboard', visible: true, order: 1, children: [] },
      { key: 'STUDENT', label: 'Students', visible: true, order: 2, children: [] },
      { key: 'FACULTY', label: 'Faculty', visible: true, order: 3, children: [] },
      {
        key: 'USER_MANAGEMENT', label: 'User Management', visible: true, order: 4, children: [
          { key: 'USER_LIST', label: 'All Users', visible: true },
          { key: 'ROLES_PERMISSIONS', label: 'Roles & Permissions', visible: true },
          { key: 'SYSTEM_MODULES', label: 'System Modules', visible: true }
        ]
      },
      { key: 'COURSE', label: 'Courses', visible: true, order: 5, children: [] },
      { key: 'ATTENDANCE', label: 'Attendance', visible: true, order: 6, children: [] },
      { key: 'PERFORMANCE', label: 'Performance', visible: true, order: 7, children: [] },
      {
        key: 'EVENT', label: 'Events', visible: true, order: 8, children: [
          { key: 'EVENT_VIEW', label: 'View All Events', visible: true },
          { key: 'EVENT_CREATE', label: 'Add Event', visible: true },
          { key: 'EVENT_UPDATE', label: 'Edit Event', visible: true }
        ]
      },
      { key: 'EXAMS', label: 'Exams', visible: true, order: 9, children: [] },
      { key: 'REMARKS', label: 'Remarks', visible: true, order: 10, children: [] },
      {
        key: 'FEE_MANAGEMENT', label: 'Fees Management', visible: true, order: 11, children: [
          { key: 'FEE_CATEGORIES', label: 'Fee Categories', visible: true },
          { key: 'FEE_STRUCTURE', label: 'Fee Structure', visible: true },
          { key: 'STUDENT_FEES', label: 'Student Fees', visible: true },
          { key: 'ADD_EXTRA_FEE', label: 'Add Extra Fee', visible: true },
          { key: 'FEE_PAYMENT', label: 'Fee Payment', visible: true },
          { key: 'PAYMENT_HISTORY', label: 'Payment History', visible: true },
          { key: 'REPORTS', label: 'Reports', visible: true }
        ]
      }
    ];

    const studentSidebarConfig = [
      { key: 'DASHBOARD', label: 'Dashboard', visible: true, order: 1, children: [] },
      { key: 'COURSE', label: 'My Courses', visible: true, order: 2, children: [] },
      { key: 'ATTENDANCE', label: 'Attendance', visible: true, order: 3, children: [] },
      { key: 'PERFORMANCE', label: 'Performance', visible: true, order: 4, children: [] },
      { key: 'EXAMS', label: 'Exams', visible: true, order: 5, children: [] },
      { key: 'EVENT', label: 'Events', visible: true, order: 6, children: [] },
      { key: 'PROFILE', label: 'My Profile', visible: true, order: 7, children: [] },
      { key: 'MY_FEES', label: 'My Fees', visible: true, order: 8, children: [] }
    ];

    const systemRoles = ['SUPERADMIN', 'ADMIN', 'FACULTY', 'STUDENT'];
    const existingRoles = await Role.find({ name: { $in: systemRoles } });
    const existingRoleNames = existingRoles.map(r => r.name);

    for (const roleName of systemRoles) {
      const sidebarToUse = roleName === 'STUDENT' ? studentSidebarConfig : defaultSidebarConfig;
      
      if (!existingRoleNames.includes(roleName)) {
        await Role.create({
          name: roleName,
          description: `System defined ${roleName} role`,
          isSystem: true,
          permissions: roleName === 'SUPERADMIN' ? superAdminPerms : undefined,
          sidebarConfig: sidebarToUse
        });
        console.log(`[Seeder] Created core system role: ${roleName}`);
      } else {
        const currentRole = existingRoles.find(r => r.name === roleName);
        // Force update student sidebar config to ensure it has fee section
        if (roleName === 'STUDENT' || !currentRole.sidebarConfig || currentRole.sidebarConfig.length === 0) {
          currentRole.sidebarConfig = sidebarToUse;
          await currentRole.save();
          console.log(`[Seeder] Updated core system role sidebarConfig: ${roleName}`);
        }
      }
    }
  } catch (error) {
    console.error(`[Seeder] Failed to seed system roles: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  
  // Initialize Cron Jobs
  initCronJobs();
});

// 3. Handle Unhandled Promise Rejections (Async Errors like DB connection failure)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  console.log('Shutting down server due to unhandled promise rejection');
  server.close(() => process.exit(1));
});