/**
 * Course & Entity Utility Functions
 * Location: src/utils/adminUtils/courseUtils.js
 * 
 * Shared utilities for Student, Faculty, and Course management
 */

/**
 * Generates a short acronym from a branch name
 * @param {string} name - Full branch name
 * @returns {string} Shortened branch name
 */
export const getShortBranch = (name) => {
  if (!name) return '';
  // If it's already short, return as is
  if (name.length <= 10) return name.toUpperCase();
  
  // Dynamic acronym generation
  const stopWords = ['of', 'and', '&', 'in', 'the', 'for'];
  return name
    .replace(/[\(\)]/g, '') // Remove parentheses
    .trim()
    .split(/[\s-]+/)
    .filter(word => !stopWords.includes(word.toLowerCase()) && word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

/**
 * Gets course options from courses data
 * @param {Array} coursesData - Array of course objects
 * @returns {Array} Array of course names
 */
export const getCourseOptions = (coursesData) => {
  return coursesData.map(c => c.name);
};

/**
 * Gets branch options for a specific course
 * @param {Array} coursesData - Array of course objects
 * @param {string} courseName - Selected course name
 * @returns {Array} Array of branch names
 */
export const getBranchOptions = (coursesData, courseName) => {
  const selectedCourse = coursesData.find(c => c.name === courseName);
  return selectedCourse ? selectedCourse.branches.map(b => b.name) : [];
};

/**
 * Gets semester options for a specific course
 * @param {Array} coursesData - Array of course objects
 * @param {string} courseName - Selected course name
 * @returns {Array} Array of semester numbers as strings
 */
export const getSemOptions = (coursesData, courseName) => {
  const selectedCourse = coursesData.find(c => c.name === courseName);
  if (!selectedCourse) return [];
  const totalSems = (selectedCourse.duration || 4) * 2;
  return Array.from({ length: totalSems }, (_, i) => (i + 1).toString());
};

/**
 * Gets subject options based on selected course, branch, and semesters
 * Works for both students and faculty
 * @param {Array} coursesData - Array of course objects
 * @param {string} course - Selected course name
 * @param {string} branch - Selected branch name
 * @param {Array} semesters - Selected semester(s)
 * @returns {Array} Array of subject names
 */
export const getSubjectOptions = (coursesData, course, branch, semesters) => {
  const selectedCourse = coursesData.find(c => c.name === course);
  if (!selectedCourse) return [];
  
  const selectedBranch = selectedCourse.branches.find(b => b.name === branch);
  if (!selectedBranch) return [];
  
  // If no semester selected, show nothing
  if (!semesters || semesters.length === 0) return [];

  const relevantSubjects = selectedBranch.subjects.filter(sub => 
    semesters.includes(sub.semester?.toString())
  );
  
  return relevantSubjects.map(s => s.name);
};

/**
 * Gets branch options for multiple selected courses (for filters)
 * @param {Array} coursesData - Array of course objects
 * @param {Array} selectedCourses - Array of selected course names
 * @returns {Array} Array of unique branch names
 */
export const getFilterBranchOptions = (coursesData, selectedCourses) => {
  if (selectedCourses.length === 0) return [];
  const courses = coursesData.filter(c => selectedCourses.includes(c.name));
  return Array.from(new Set(courses.flatMap(c => c.branches.map(b => b.name))));
};

/**
 * Gets semester options for multiple selected courses (for filters)
 * @param {Array} coursesData - Array of course objects
 * @param {Array} selectedCourses - Array of selected course names
 * @returns {Array} Array of semester numbers as strings
 */
export const getFilterSemOptions = (coursesData, selectedCourses) => {
  if (selectedCourses.length === 0) return [];
  const courses = coursesData.filter(c => selectedCourses.includes(c.name));
  const maxDuration = Math.max(...courses.map(c => c.duration || 4));
  const totalSems = maxDuration * 2;
  return Array.from({ length: totalSems }, (_, i) => (i + 1).toString());
};

/**
 * Get filter subject options based on selected courses, branches, and semesters
 * @param {Array} coursesData - Array of course objects
 * @param {Array} selectedCourses - Array of selected course names
 * @param {Array} selectedBranches - Array of selected branch names
 * @param {Array} selectedSems - Array of selected semesters
 * @returns {Array} Array of unique subject names
 */
export const getFilterSubjectOptions = (coursesData, selectedCourses, selectedBranches, selectedSems) => {
  if (selectedCourses.length === 0 || selectedBranches.length === 0 || selectedSems.length === 0) {
    return [];
  }
  
  const courses = coursesData.filter(c => selectedCourses.includes(c.name));
  const relevantBranches = courses.flatMap(c => c.branches).filter(b => selectedBranches.includes(b.name));
  const relevantSubjects = relevantBranches.flatMap(b => b.subjects).filter(sub => 
    selectedSems.includes(sub.semester?.toString())
  );
  
  return Array.from(new Set(relevantSubjects.map(s => s.name)));
};

/**
 * Validates file upload
 * @param {FileList} files - Files to validate
 * @param {number} maxFiles - Maximum number of files allowed
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateFileUpload = (files, maxFiles = 3) => {
  if (files.length > maxFiles) {
    return {
      isValid: false,
      error: `You can select only ${maxFiles} documents (ID, marksheet, TC)`
    };
  }
  return { isValid: true, error: null };
};

/**
 * Builds query parameters for API requests
 * Supports both student and faculty filters
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Filter object
 * @returns {Object} Query parameters object
 */
export const buildQueryParams = (searchTerm, filters) => {
  const params = { search: searchTerm };
  
  // Common filters
  if (filters.course?.length > 0) params.course = filters.course.join(',');
  if (filters.branch?.length > 0) params.branch = filters.branch.join(',');
  if (filters.sem?.length > 0) params.sem = filters.sem.join(',');
  
  // Student-specific filters
  if (filters.isActive !== undefined && filters.isActive !== '') {
    params.isActive = filters.isActive;
  }
  
  // Faculty-specific filters
  if (filters.designation?.length > 0) params.designation = filters.designation.join(',');
  if (filters.subject?.length > 0) params.subject = filters.subject.join(',');
  
  return params;
};

/**
 * Formats student data for form
 * @param {Object} student - Student object
 * @returns {Object} Formatted form data
 */
export const formatStudentForForm = (student) => {
  return {
    name: student.name,
    studentId: student.studentId,
    rollNum: student.rollNum,
    course: student.course,
    branch: student.branch || '',
    sem: student.sem,
    parentContact: student.parentContact,
    studentPhone: student.studentPhone || '',
    personalEmail: student.personalEmail || '',
    dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
    documents: null
  };
};

/**
 * Formats faculty data for form
 * @param {Object} faculty - Faculty object
 * @returns {Object} Formatted form data
 */
export const formatFacultyForForm = (faculty) => {
  return {
    name: faculty.name,
    facultyId: faculty.facultyId || '',
    personalEmail: faculty.personalEmail || '',
    phone: faculty.phone,
    dob: faculty.dob ? new Date(faculty.dob).toISOString().split('T')[0] : '',
    qualification: faculty.qualification,
    designation: faculty.designation,
    salary: faculty.salary || '',
    joiningDate: faculty.joiningDate ? new Date(faculty.joiningDate).toISOString().split('T')[0] : '',
    course: faculty.course,
    subject: faculty.subject || [],
    branch: faculty.branch || '',
    sem: faculty.sem || [],
    documents: null
  };
};

/**
 * Faculty designations list
 */
export const FACULTY_DESIGNATIONS = [
  "Adjunct Professor",
  "Assistant Professor",
  "Associate Professor",
  "Guest Faculty",
  "Lecturer",
  "Postdoctoral Fellow",
  "Professor",
  "Research Assistant",
  "Research Associate",
  "Research Professor",
  "Senior Assistant Professor",
  "Senior Lecturer",
  "Senior Professor",
  "Teaching Assistant",
  "Visiting Professor"
];