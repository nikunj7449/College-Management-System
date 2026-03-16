const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({path: './.env'});

async function addProfileToAdmins() {
    await mongoose.connect(process.env.MONGO_URI);
    const Role = require('./src/models/Role');
    
    const rolesToUpdate = ['ADMIN', 'SUPERADMIN'];

    for (const roleName of rolesToUpdate) {
        const role = await Role.findOne({ name: roleName });
        if (!role) {
            console.log(`${roleName} role not found`);
            continue;
        }

        // Check if PROFILE already exists
        const hasProfile = role.sidebarConfig.some(item => item.key === 'PROFILE');
        
        if (hasProfile) {
            console.log(`PROFILE item already exists in ${roleName} sidebar`);
        } else {
            role.sidebarConfig.push({
                key: 'PROFILE',
                label: 'My Profile',
                order: 95, // Near the bottom
                visible: true
            });
            await role.save();
            console.log(`Successfully added PROFILE to ${roleName} sidebar`);
        }
    }
    
    process.exit(0);
}

addProfileToAdmins().catch(err => {
    console.error(err);
    process.exit(1);
});
