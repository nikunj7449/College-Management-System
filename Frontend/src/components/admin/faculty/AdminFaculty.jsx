import React, { useState } from 'react';
import { Search, Filter, Plus, LayoutGrid, List } from 'lucide-react';
import { useFacultyOperations, MODAL_TYPE } from '../../../hooks/admin/useFacultyOperations';
import {
  FACULTY_DESIGNATIONS,
  getCourseOptions,
  getBranchOptions,
  getSemOptions,
  getSubjectOptions,
  getFilterBranchOptions,
  getFilterSemOptions,
  getFilterSubjectOptions,
} from '../../../utils/adminUtils/courseUtils';

// Components
import FacultyCard from '../../common/FacultyCard';
import FacultyTableRow from '../../common/FacultyTableRow';
import FacultyCardSkeleton from '../../common/StudentCardSkeleton';
import FacultyEmptyState from '../../common/FacultyEmptyState';
import Pagination from '../../common/Pagination';
import FacultyFormModal from '../../modals/FacultyFormModal';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import FacultyFilterPanel from './sub-components/FacultyFilterPanel';

const AdminFaculty = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('grid');

  const {
    facultyList,
    coursesData,
    loading,
    submitLoading,
    searchTerm,
    filters,
    currentPage,
    formData,
    modal,
    setSearchTerm,
    setFilters,
    setCurrentPage,
    handleChange,
    handleSubmit,
    handleEdit,
    handleView,
    handleDelete,
    confirmDelete,
    openAddModal,
    closeModal,
  } = useFacultyOperations();

  // Pagination
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = facultyList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(facultyList.length / itemsPerPage);

  // Dropdown Options for Form
  const courseOptions = getCourseOptions(coursesData);
  const branchOptions = getBranchOptions(coursesData, formData.course);
  const semOptions = getSemOptions(coursesData, formData.course);
  const subjectOptions = getSubjectOptions(coursesData, formData.course, formData.branch, formData.sem);

  // Filter Options
  const filterBranchOptions = getFilterBranchOptions(coursesData, filters.course);
  const filterSemOptions = getFilterSemOptions(coursesData, filters.course);
  const filterSubjectOptions = getFilterSubjectOptions(
    coursesData,
    filters.course,
    filters.branch,
    filters.sem
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage teaching staff and details</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search faculty..." 
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
              <FacultyFilterPanel
                filters={filters}
                onFilterChange={setFilters}
                designationOptions={FACULTY_DESIGNATIONS}
                courseOptions={courseOptions}
                branchOptions={filterBranchOptions}
                semOptions={filterSemOptions}
                subjectOptions={filterSubjectOptions}
              />
            )}
          </div>

          {/* Add Faculty Button */}
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <FacultyCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )
      )}

      {/* Grid View */}
      {!loading && viewType === 'grid' && facultyList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((faculty) => (
            <FacultyCard
              key={faculty._id}
              faculty={faculty}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewType === 'table' && facultyList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID & Designation
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((faculty) => (
                  <FacultyTableRow
                    key={faculty._id}
                    faculty={faculty}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {!loading && facultyList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={facultyList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Empty State */}
      {!loading && facultyList.length === 0 && <FacultyEmptyState />}

      {/* Form Modal */}
      {[MODAL_TYPE.ADD, MODAL_TYPE.EDIT, MODAL_TYPE.VIEW].includes(modal.type) && (
        <FacultyFormModal
          isOpen={true}
          onClose={closeModal}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isEditMode={modal.type === MODAL_TYPE.EDIT}
          isViewMode={modal.type === MODAL_TYPE.VIEW}
          submitLoading={submitLoading}
          designationOptions={FACULTY_DESIGNATIONS}
          courseOptions={courseOptions}
          branchOptions={branchOptions}
          semOptions={semOptions}
          subjectOptions={subjectOptions}
        />
      )}

      {/* Delete Modal */}
      {modal.type === MODAL_TYPE.DELETE && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default AdminFaculty;