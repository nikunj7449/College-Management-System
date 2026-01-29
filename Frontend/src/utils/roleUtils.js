export const isAdmin = (user) => user?.role?.toUpperCase() === 'ADMIN';
export const isTeacher = (user) => user?.role?.toUpperCase() === 'TEACHER' || user?.role?.toUpperCase() === 'FACULTY';
export const isStudent = (user) => user?.role?.toUpperCase() === 'STUDENT';