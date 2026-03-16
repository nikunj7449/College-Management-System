const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({path: './.env'});

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const Course = require('./src/models/Course');
    const FeeStructure = require('./src/models/FeeStructure');
    const Student = require('./src/models/Student');

    const students = await Student.find({}, 'course branch sem');
    const studentCounts = {};
    students.forEach(s => {
        const key = `${s.course} | ${s.branch} | ${s.sem}`;
        studentCounts[key] = (studentCounts[key] || 0) + 1;
    });

    const structures = await FeeStructure.find({}).populate('courseId');
    const structureStrings = structures.map(s => {
        const branch = s.courseId.branches.id(s.branchId);
        return `${s.courseId.name} | ${branch ? branch.name : 'Unknown'} | ${s.semester}`;
    });

    console.log('--- STUDENT DISTRIBUTIONS ---');
    console.log(JSON.stringify(studentCounts, null, 2));
    console.log('--- AVAILABLE STRUCTURES ---');
    console.log(JSON.stringify(structureStrings, null, 2));

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
