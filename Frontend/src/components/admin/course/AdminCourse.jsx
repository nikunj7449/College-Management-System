import React, { useState, useEffect } from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { useCourseOperations, MODAL_TYPE, DELETE_TYPE } from '../../../hooks/admin/useCourseOperations';

// Components
import CourseCard from '../../common/CourseCard';
import CourseTableRow from '../../common/CourseTableRow';
import CourseEmptyState from '../../common/CourseEmptyState';
import CourseFormModal from '../../modals/CourseFormModal';
import CourseViewModal from '../../modals/CourseViewModal';
import BranchManageModal from '../../modals/BranchManageModal';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import CourseCardSkeleton from '../../common/CourseCardSkeleton';
import Pagination from '../../common/Pagination';

const CourseList = () => {
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    filteredCourses,
    loading,
    submitLoading,
    branchLoading,
    searchTerm,
    courseForm,
    subjectForm,
    newBranchName,
    expandedBranch,
    editingBranchId,
    editBranchName,
    deleteConfig,
    modal,
    setSearchTerm,
    setNewBranchName,
    setEditBranchName,
    handleCourseFormChange,
    addBranchToForm,
    removeBranchFromForm,
    updateBranchName,
    addSubjectToBranch,
    updateSubject,
    removeSubject,
    handleSubjectFormChange,
    openAddCourseModal,
    openEditCourseModal,
    openViewCourseModal,
    openManageBranchesModal,
    openAddSubjectModal,
    openEditSubjectModal,
    openDeleteModal,
    closeModal,
    closeSubjectModal,
    handleCourseSubmit,
    handleDelete,
    handleAddBranch,
    startEditingBranch,
    handleUpdateBranch,
    toggleBranch,
    handleSubjectSubmit,
  } = useCourseOperations();

  // Pagination
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage courses, branches, and subjects
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search courses..."
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

          {/* Add Course Button */}
          <button
            onClick={openAddCourseModal}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Course</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )
      )}

      {/* Grid View */}
      {!loading && viewType === 'grid' && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={openEditCourseModal}
              onDelete={(course) => openDeleteModal(DELETE_TYPE.COURSE, course._id, course.name)}
              onView={openViewCourseModal}
              onManage={openManageBranchesModal}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewType === 'table' && filteredCourses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Branches
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Subjects
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((course) => (
                  <CourseTableRow
                    key={course._id}
                    course={course}
                    onEdit={openEditCourseModal}
                    onDelete={(course) =>
                      openDeleteModal(DELETE_TYPE.COURSE, course._id, course.name)
                    }
                    onView={openViewCourseModal}
                    onManage={openManageBranchesModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCourses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCourses.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && <CourseEmptyState />}

      {/* Course Form Modal (Add/Edit) */}
      {(modal.type === MODAL_TYPE.ADD_COURSE || modal.type === MODAL_TYPE.EDIT_COURSE) && (
        <CourseFormModal
          isOpen={true}
          onClose={closeModal}
          courseForm={courseForm}
          onChange={handleCourseFormChange}
          onSubmit={handleCourseSubmit}
          isEditMode={modal.type === MODAL_TYPE.EDIT_COURSE}
          submitLoading={submitLoading}
          onAddBranch={addBranchToForm}
          onRemoveBranch={removeBranchFromForm}
          onUpdateBranchName={updateBranchName}
          onAddSubjectToBranch={addSubjectToBranch}
          onUpdateSubject={updateSubject}
          onRemoveSubject={removeSubject}
        />
      )}

      {/* Course View Modal */}
      {modal.type === MODAL_TYPE.VIEW_COURSE && (
        <CourseViewModal isOpen={true} onClose={closeModal} courseForm={courseForm} />
      )}

      {/* Branch Management Modal */}
      {modal.type === MODAL_TYPE.MANAGE_BRANCHES && (
        <BranchManageModal
          isOpen={true}
          onClose={closeModal}
          course={modal.course}
          newBranchName={newBranchName}
          setNewBranchName={setNewBranchName}
          onAddBranch={handleAddBranch}
          branchLoading={branchLoading}
          expandedBranch={expandedBranch}
          onToggleBranch={toggleBranch}
          editingBranchId={editingBranchId}
          editBranchName={editBranchName}
          setEditBranchName={setEditBranchName}
          onStartEditingBranch={startEditingBranch}
          onUpdateBranch={handleUpdateBranch}
          onCancelEditBranch={() => setEditBranchName('')}
          onDeleteBranch={(branch) =>
            openDeleteModal(DELETE_TYPE.BRANCH, branch._id, branch.name, modal.course._id)
          }
          onAddSubject={openAddSubjectModal}
          onEditSubject={openEditSubjectModal}
          onDeleteSubject={(subject, branchId) =>
            openDeleteModal(DELETE_TYPE.SUBJECT, subject._id, subject.name, branchId)
          }
          showSubjectModal={
            modal.type === MODAL_TYPE.ADD_SUBJECT || modal.type === MODAL_TYPE.EDIT_SUBJECT
          }
          subjectForm={subjectForm}
          onSubjectFormChange={handleSubjectFormChange}
          onSubjectSubmit={handleSubjectSubmit}
          onCloseSubjectModal={closeSubjectModal}
          submitLoading={submitLoading}
          isEditingSubject={modal.type === MODAL_TYPE.EDIT_SUBJECT}
        />
      )}

      {/* Delete Confirmation Modal */}
      {modal.type === MODAL_TYPE.DELETE && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleDelete}
          deleteRole={"Course"}
        />
      )}
    </div>
  );
};

export default CourseList;