import React, { useState } from 'react';
import { Search, Filter, Plus, LayoutGrid, List } from 'lucide-react';
import { useStudentOperations, MODAL_TYPE } from '../../../hooks/admin/useStudentOperations ';
import {
  getCourseOptions,
  getBranchOptions,
  getSemOptions,
  getFilterBranchOptions,
  getFilterSemOptions,
} from '../../../utils/adminUtils/courseUtils';

// Import Components
import StudentCard from '../../common/StudentCard';
import StudentTableRow from '../../common/StudentTableRow';
import StudentFormModal from '../../modals/StudentFormModal';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import StatusToggleModal from '../../modals/StatusToggleModal';
import FilterPanel from './sub-components/FilterPanel';
import Pagination from '../../common/Pagination';
import StudentCardSkeleton from '../../common/StudentCardSkeleton';
import StudentTableSkeleton from '../../common/StudentTableSkeleton';

const StudentList = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('grid');

  const {
    students,coursesData,loading,submitLoading,searchTerm,filters,currentPage,
    formData,modal,setSearchTerm,setFilters,setCurrentPage,handleChange,handleSubmit,
    handleEdit,handleView,handleDelete,handleToggleStatus,confirmDelete,confirmToggleStatus,
    openAddModal,closeModal,
  } = useStudentOperations();

  const userRole = JSON.parse(localStorage.getItem('user')).role;

  // Pagination
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Dropdown Options
  const courseOptions = getCourseOptions(coursesData);
  const branchOptions = getBranchOptions(coursesData, formData.course);
  const semOptions = getSemOptions(coursesData, formData.course);
  const filterBranchOptions = getFilterBranchOptions(coursesData, filters.course);
  const filterSemOptions = getFilterSemOptions(coursesData, filters.course);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all registered students</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'grid' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'table' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List size={20} />
            </button>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center px-4 py-2.5 border rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={20} />
            </button>
            
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                courseOptions={courseOptions}
                branchOptions={filterBranchOptions}
                semOptions={filterSemOptions}
              />
            )}
          </div>

          {/* Add Student Button */}
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Student</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <StudentTableSkeleton />
        )
      )}

      {/* Grid View */}
      {!loading && viewType === 'grid' && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewType === 'table' && students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID & Roll
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Course Info
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((student) => (
                  <StudentTableRow
                    key={student._id}
                    student={student}
                    role={userRole}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {!loading && students.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={students.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
      
      {/* Empty State */}
     {!loading && students.length === 0 && 
        <div className="text-center py-12">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-800">No students found</h3>
            <p className="text-slate-500">Try adjusting your search terms or add a new student.</p>
        </div>
      }

      {/* Form Modal - Single check instead of separate booleans */}
      {[MODAL_TYPE.ADD, MODAL_TYPE.EDIT, MODAL_TYPE.VIEW].includes(modal.type) && (
        <StudentFormModal
          isOpen={true}
          onClose={closeModal}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isEditMode={modal.type === MODAL_TYPE.EDIT}
          isViewMode={modal.type === MODAL_TYPE.VIEW}
          submitLoading={submitLoading}
          courseOptions={courseOptions}
          branchOptions={branchOptions}
          semOptions={semOptions}
        />
      )}

      {/* Delete Modal */}
      {modal.type === MODAL_TYPE.DELETE && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={confirmDelete}
          deleteRole={"Student"}
        />
      )}

      {/* Status Toggle Modal */}
      {modal.type === MODAL_TYPE.STATUS && (
        <StatusToggleModal
          isOpen={true}
          student={modal.student}
          onClose={closeModal}
          onConfirm={confirmToggleStatus}
        />
      )}
    </div>
  );
};

export default StudentList;