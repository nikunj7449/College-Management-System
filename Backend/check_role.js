const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({path: './.env'});

async function checkStudentRole() {
    await mongoose.connect(process.env.MONGO_URI);
    const Role = require('./src/models/Role');
    
    const studentRole = await Role.findOne({ name: 'STUDENT' });
    if (!studentRole) {
        console.log('STUDENT role not found');
    } else {
        console.log('STUDENT Role Sidebar Config:');
        console.log(JSON.stringify(studentRole.sidebarConfig, null, 2));
    }
    process.exit(0);
}

checkStudentRole().catch(err => {
    console.error(err);
    process.exit(1);
});
