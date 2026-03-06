const mongoose = require('mongoose');

// Define a schema for granular CRUD permissions per module
const permissionSchema = new mongoose.Schema({
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
}, { _id: false });

const sidebarChildSchema = new mongoose.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    visible: { type: Boolean, default: true }
}, { _id: false });

const sidebarLinkSchema = new mongoose.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    children: [sidebarChildSchema]
}, { _id: false });

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isSystem: {
        type: Boolean,
        default: false, // System roles (SUPERADMIN) cannot be deleted
    },
    // Map of permissions by module. E.g., permissions.get('STUDENT').create = true
    permissions: {
        type: Map,
        of: permissionSchema,
        default: () => new Map()
    },
    sidebarConfig: [sidebarLinkSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
