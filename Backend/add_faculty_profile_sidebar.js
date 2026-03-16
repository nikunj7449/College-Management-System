const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({path: './.env'});

async function addProfileToFaculty() {
    await mongoose.connect(process.env.MONGO_URI);
    const Role = require('./src/models/Role');
    
    const facultyRole = await Role.findOne({ name: 'FACULTY' });
    if (!facultyRole) {
        console.log('FACULTY role not found');
        process.exit(1);
    }

    // Check if PROFILE already exists
    const hasProfile = facultyRole.sidebarConfig.some(item => item.key === 'PROFILE');
    
    if (hasProfile) {
        console.log('PROFILE item already exists in Faculty sidebar');
    } else {
        facultyRole.sidebarConfig.push({
            key: 'PROFILE',
            label: 'My Profile',
            order: 90, // Near the bottom, usually dashboard is 10, etc.
            visible: true
        });
        await facultyRole.save();
        console.log('Successfully added PROFILE to Faculty sidebar');
    }
    
    process.exit(0);
}

addProfileToFaculty().catch(err => {
    console.error(err);
    process.exit(1);
});
