const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({path: './.env'});

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const Course = require('./src/models/Course');
    const FeeStructure = require('./src/models/FeeStructure');
    const Student = require('./src/models/Student');
    const StudentFee = require('./src/models/StudentFee');

    const student = await Student.findOne({ name: 'Aarav Sharma' });
    console.log('Student:', { name: student.name, course: student.course, branch: student.branch, sem: student.sem });

    // 1. Course Match
    const courseDoc = await Course.findOne({ 
        name: { $regex: new RegExp(`^${student.course}$`, 'i') } 
    });
    console.log('Course Match Found:', courseDoc ? courseDoc.name : 'NO');
    if (!courseDoc) return process.exit(0);

    // 2. Branch Match
    const branchDoc = courseDoc.branches.find(b => 
        new RegExp(`^${student.branch}$`, 'i').test(b.name)
    );
    console.log('Branch Match Found:', branchDoc ? branchDoc.name : 'NO');
    if (!branchDoc) return process.exit(0);

    // 3. Structure Match
    const semesterNum = parseInt(student.sem);
    console.log('Semester Num:', semesterNum);
    
    const structure = await FeeStructure.findOne({
        courseId: courseDoc._id,
        branchId: branchDoc._id,
        semester: semesterNum
    });
    console.log('Structure Match Found:', structure ? structure._id : 'NO');

    if (!structure) {
        // Find ANY structure for this course/branch to see what semesters exist
        const anyStruct = await FeeStructure.find({
            courseId: courseDoc._id,
            branchId: branchDoc._id
        });
        console.log('Available semesters for this course/branch:', anyStruct.map(s => s.semester));
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
