const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testRBAC() {
    const baseURL = 'http://localhost:5000/api/v1';
    try {
        console.log('--- Testing RBAC Implementation ---');

        // 1. Login as SuperAdmin
        console.log('\n[1] Generating SuperAdmin Token directly...');
        const superAdminToken = jwt.sign(
            { id: '123456789012345678901234', role: 'SUPERADMIN' },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_for_development',
            { expiresIn: '1d' }
        );
        console.log('Token generated!');

        // 2. Fetch Roles
        console.log('\n[2] Fetching Roles...');
        const rolesRes = await axios.get(`${baseURL}/roles`, {
            headers: { Authorization: `Bearer ${superAdminToken}` }
        });

        const roles = rolesRes.data.data;
        console.log(`Found ${roles.length} roles:`, roles.map(r => r.name).join(', '));

        // 3. Create a Test Role
        console.log('\n[3] Creating Test Role (GUEST)...');
        const createRoleRes = await axios.post(`${baseURL}/roles`, {
            name: 'GUEST_TEST',
            description: 'Test role for verification',
            permissions: {
                STUDENT: { read: true, create: false, update: false, delete: false }
            }
        }, {
            headers: { Authorization: `Bearer ${superAdminToken}` }
        });

        const newRole = createRoleRes.data.data;
        console.log('Created Role successfully. ID:', newRole._id);

        // 4. Update the Test Role
        console.log('\n[4] Updating Test Role Permissions...');
        const updateRoleRes = await axios.put(`${baseURL}/roles/${newRole._id}`, {
            description: 'Updated Test Role',
            permissions: {
                STUDENT: { read: true, create: true, update: false, delete: false }
            }
        }, {
            headers: { Authorization: `Bearer ${superAdminToken}` }
        });

        console.log('Update successful! New description:', updateRoleRes.data.data.description);

        // 5. Delete the Test Role
        console.log('\n[5] Deleting Test Role...');
        await axios.delete(`${baseURL}/roles/${newRole._id}`, {
            headers: { Authorization: `Bearer ${superAdminToken}` }
        });
        console.log('Deletion successful!');

        console.log('\n--- RBAC VERIFICATION COMPLETE ---');
    } catch (err) {
        console.error('\nERROR during RBAC Testing:');
        if (err.response) {
            console.error(err.response.status, err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

// Give server time to start up before running
setTimeout(testRBAC, 2000);
