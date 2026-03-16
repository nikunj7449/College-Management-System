import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, PieChart, TrendingUp, Users, AlertCircle } from 'lucide-react';
import feeService from '../../../services/feeService';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CustomDropdown from '../../custom/CustomDropdown';
import Pagination from '../../common/core/Pagination';

const FeeReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({ 
        semester: '', 
        status: '', 
        course: '', 
        branch: '', 
        year: '',
        search: ''
    });

    // Local Search State for Debouncing
    const [localSearch, setLocalSearch] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    useEffect(() => {   
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchReports();
        setCurrentPage(1); // Reset to first page on filter change
    }, [filters]);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: localSearch }));
        }, 500);
        return () => clearTimeout(handler);
    }, [localSearch]);

    const fetchInitialData = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await feeService.getFeeReports(filters);
            setReports(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalCollection: reports.reduce((sum, r) => sum + r.paidAmount, 0),
        totalOutstanding: reports.reduce((sum, r) => sum + r.pendingAmount, 0),
        partialCount: reports.filter(r => r.status === 'PARTIAL').length,
        unpaidCount: reports.filter(r => r.status === 'UNPAID').length
    };

    // Calculate current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reports.length / itemsPerPage);

    const handleExport = () => {
        if (reports.length === 0) return toast.info('No data to export');

        const headers = ["Student Name", "Roll Number", "Course", "Semester", "Total Fee", "Paid Amount", "Pending Amount", "Status"];
        const csvContent = [
            headers.join(","),
            ...reports.map(r => [
                `"${r.student?.name || 'N/A'}"`,
                `"${r.student?.rollNum || 'N/A'}"`,
                `"${r.student?.course || 'N/A'}"`,
                r.semester,
                r.totalFee,
                r.paidAmount,
                r.pendingAmount,
                r.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Fee_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report exported successfully');
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Fee Analytics & Reports</h1>
                    <p className="text-slate-500 mt-1">Generate lists and analyze collection trends</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-medium whitespace-nowrap"
                >
                    <Download size={20} />
                    Export to Excel
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-500 ${loading ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Collection</p>
                        <h3 className={`text-2xl font-black text-slate-900 font-mono italic ${loading ? 'animate-pulse' : ''}`}>₹{stats.totalCollection.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding Fees</p>
                        <h3 className={`text-2xl font-black text-rose-600 font-mono italic font-bold ${loading ? 'animate-pulse' : ''}`}>₹{stats.totalOutstanding.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Partial Defaulters</p>
                        <h3 className={`text-2xl font-black text-slate-900 font-black ${loading ? 'animate-pulse' : ''}`}>{stats.partialCount} Students</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Records</p>
                        <h3 className={`text-2xl font-black text-slate-900 font-black ${loading ? 'animate-pulse' : ''}`}>{reports.length} Enrolled</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by student name or roll number..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                        <CustomDropdown
                            placeholder="All Statuses"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            options={[
                                { label: 'All Statuses', value: '' },
                                { label: 'Paid', value: 'PAID' },
                                { label: 'Partial', value: 'PARTIAL' },
                                { label: 'Unpaid', value: 'UNPAID' }
                            ]}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Course Filter */}
                    <div>
                        <CustomDropdown
                            placeholder="All Courses"
                            value={filters.course}
                            onChange={(e) => setFilters({...filters, course: e.target.value, branch: ''})}
                            options={[
                                { label: 'All Courses', value: '' },
                                ...courses.map(c => ({ label: c.name, value: c.name }))
                            ]}
                            searchable={true}
                        />
                    </div>
                    {/* Branch Filter */}
                    <div>
                        <CustomDropdown
                            placeholder="All Branches"
                            value={filters.branch}
                            onChange={(e) => setFilters({...filters, branch: e.target.value})}
                            options={[
                                { label: 'All Branches', value: '' },
                                ...(courses.find(c => c.name === filters.course)?.branches.map(b => ({ label: b.name, value: b.name })) || [])
                            ]}
                            disabled={!filters.course}
                            searchable={true}
                        />
                    </div>
                    {/* Semester Filter */}
                    <div>
                        <CustomDropdown
                            placeholder="All Semesters"
                            value={filters.semester}
                            onChange={(e) => setFilters({...filters, semester: e.target.value})}
                            options={[
                                { label: 'All Semesters', value: '' },
                                ...[1,2,3,4,5,6,7,8].map(s => ({ label: `Semester ${s}`, value: s }))
                            ]}
                        />
                    </div>
                    {/* Year Filter */}
                    <div>
                        <CustomDropdown
                            placeholder="All Years"
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: e.target.value})}
                            options={[
                                { label: 'All Years', value: '' },
                                ...[2024, 2025, 2026, 2027].map(y => ({ label: String(y), value: y }))
                            ]}
                        />
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-50 pt-4">
                    <button 
                        onClick={() => {
                            setFilters({semester: '', status: '', course: '', branch: '', year: '', search: ''});
                            setLocalSearch('');
                        }} 
                        className="flex items-center gap-2 px-5 py-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-all focus:outline-none border border-transparent hover:border-indigo-100 hover:bg-indigo-50 rounded-xl"
                    >
                        <Filter size={16} />
                        Reset All Filters
                    </button>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Course & Sem</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Obligation</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount Paid</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount Pending</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">Loading analytics...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">No records found for the selected filters.</td></tr>
                            ) : currentReports.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{record.student?.name}</div>
                                        <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase mt-0.5">{record.student?.rollNum}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                            {record.student?.course} • S{record.semester}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-600 italic underline decoration-slate-200 decoration-2 underline-offset-4">
                                        ₹{record.totalFee.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-black text-emerald-600">
                                        ₹{record.paidAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-black text-rose-600">
                                        ₹{record.pendingAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${
                                                record.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                record.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && reports.length > 0 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={reports.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default FeeReports;
