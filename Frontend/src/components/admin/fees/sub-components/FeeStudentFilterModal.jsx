import React, { useState, useEffect } from 'react';
import { X, Search, CheckSquare, Square, Filter, Users, ChevronRight } from 'lucide-react';
import CustomDropdown from '../../../custom/CustomDropdown';

const FeeStudentFilterModal = ({ 
    isOpen, 
    onClose, 
    pendingFees, 
    courses = [], 
    selectedIds, 
    setSelectedIds 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('ALL');
    const [branchFilter, setBranchFilter] = useState('ALL');
    const [semesterFilter, setSemesterFilter] = useState('ALL');

    useEffect(() => {
        setBranchFilter('ALL');
    }, [courseFilter]);

    if (!isOpen) return null;

    const filteredStudents = pendingFees.filter(f => {
        const matchesSearch = f.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            f.student?.rollNum.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = courseFilter === 'ALL' || f.student?.course === courseFilter;
        const matchesBranch = branchFilter === 'ALL' || f.student?.branch === branchFilter;
        const matchesSemester = semesterFilter === 'ALL' || f.semester.toString() === semesterFilter;

        return matchesSearch && matchesCourse && matchesBranch && matchesSemester;
    });

    const handleToggleStudent = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectVisible = () => {
        const filteredIds = filteredStudents.map(f => f._id);
        const allFilteredSelected = filteredIds.every(id => selectedIds.includes(id));

        if (allFilteredSelected) {
            setSelectedIds(selectedIds.filter(id => !filteredIds.includes(id)));
        } else {
            const newSelection = [...new Set([...selectedIds, ...filteredIds])];
            setSelectedIds(newSelection);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <Filter size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Filter Students</h3>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Select recipients for reminder</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Filters Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                            <CustomDropdown
                                options={['ALL', ...courses.map(c => c.name)]}
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                placeholder="Course"
                                className="!py-2 !text-xs !rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch</label>
                            <CustomDropdown
                                options={['ALL', ...(courses.find(c => c.name === courseFilter)?.branches.map(b => b.name) || [])]}
                                value={branchFilter}
                                disabled={courseFilter === 'ALL'}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                placeholder="Branch"
                                className="!py-2 !text-xs !rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sem</label>
                            <CustomDropdown
                                options={['ALL', '1', '2', '3', '4', '5', '6', '7', '8']}
                                value={semesterFilter}
                                onChange={(e) => setSemesterFilter(e.target.value)}
                                placeholder="Sem"
                                className="!py-2 !text-xs !rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Selection Controls */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">
                                {filteredStudents.length} Students found
                            </span>
                        </div>
                        <button 
                            onClick={handleSelectVisible}
                            className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold uppercase hover:bg-indigo-100 transition-all active:scale-95"
                        >
                            {filteredStudents.length > 0 && filteredStudents.every(f => selectedIds.includes(f._id)) ? 'Deselect Visible' : 'Select Visible'}
                        </button>
                    </div>

                    {/* Student List */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                            {filteredStudents.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                    <Users size={32} className="opacity-20 mb-2" />
                                    <p className="text-sm italic font-medium">No matching students found</p>
                                </div>
                            ) : (
                                filteredStudents.map((fee) => (
                                    <div 
                                        key={fee._id}
                                        onClick={() => handleToggleStudent(fee._id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
                                            selectedIds.includes(fee._id) 
                                            ? 'bg-white shadow-sm border border-indigo-100' 
                                            : 'hover:bg-slate-100 border border-transparent text-slate-500'
                                        }`}
                                    >
                                        <div className={`${selectedIds.includes(fee._id) ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                            {selectedIds.includes(fee._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-slate-900 truncate">{fee.student?.name}</div>
                                            <div className="text-[10px] flex items-center gap-1 opacity-70 font-medium">
                                                <span>{fee.student?.rollNum}</span>
                                                <span>•</span>
                                                <span className="font-bold text-rose-500 italic">₹{fee.pendingAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className={`transition-opacity ${selectedIds.includes(fee._id) ? 'opacity-100 text-indigo-200' : 'opacity-0'}`} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500">
                        Selected: <span className="text-indigo-600">{selectedIds.length}</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Apply Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeStudentFilterModal;
