import React, { useState, useEffect } from 'react';
import { CreditCard, History, CheckCircle, Clock, AlertCircle, FileText, Download, Circle } from 'lucide-react';
import feeService from '../../../services/feeService';
import { toast } from 'react-toastify';
import StudentPaymentModal from './sub-components/StudentPaymentModal';
import FeeStructureDetailModal from './sub-components/FeeStructureDetailModal';

const StudentMyFees = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
    const [tempReceiptData, setTempReceiptData] = useState(null);

    useEffect(() => {
        fetchFees();
    }, []);

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (isReceiptModalOpen || isPaymentModalOpen || isStructureModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isReceiptModalOpen, isPaymentModalOpen, isStructureModalOpen]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await feeService.getMyFees();
            setFees(response.data.data);
            if (response.data.data.length > 0) {
                handleSelectFee(response.data.data[0]);
            }
        } catch (error) {
            toast.error('Failed to load fee information');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFee = async (fee) => {
        setSelectedStructure(fee);
        try {
            setHistoryLoading(true);
            const response = await feeService.getPaymentHistory(fee._id);
            setHistory(response.data.data);
        } catch (error) {
            toast.error('Failed to load payment history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (!history || history.length === 0) {
            toast.info('No payment records found to generate receipt');
            return;
        }
        setTempReceiptData({
            structure: selectedStructure,
            payments: history
        });
        setIsReceiptModalOpen(true);
    };

    const handleActualPrint = () => {
        if (!tempReceiptData) return;
        const { structure, payments } = tempReceiptData;

        // Calculate the latest payment for details
        const latestPayment = payments[0] || {}; // History is sorted by date desc
        const installmentNum = payments.length;

        const printWindow = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Fee Receipt - ${structure.student?.name || 'N/A'}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #1e293b; background: white; line-height: 1.4; font-size: 12px; }
                    
                    .receipt-wrapper { padding: 40px; width: 100%; max-width: 850px; margin: 0 auto; border: 1px solid #e2e8f0; }
                    
                    /* HEADER */
                    .header { display: flex; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
                    .logo-box { width: 70px; height: 70px; background: #0f172a; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; margin-right: 20px; font-weight: 900; font-size: 20px; flex-shrink: 0; }
                    .college-info { flex-grow: 1; }
                    .college-info h1 { margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
                    .college-info p { margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600; }
                    .receipt-meta { text-align: right; flex-shrink: 0; }
                    .receipt-meta h2 { margin: 0; font-size: 16px; font-weight: 800; color: #6366f1; text-transform: uppercase; margin-bottom: 5px; }
                    .meta-row { font-size: 10px; color: #475569; font-weight: 700; }

                    /* STUDENT DETAILS */
                    .section-title { font-size: 11px; font-weight: 800; color: #6366f1; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 0.05em; }
                    .details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .detail-item p { margin: 0; font-weight: 500; color: #64748b; font-size: 10px; text-transform: uppercase; }
                    .detail-item h4 { margin: 3px 0 0 0; font-size: 13px; font-weight: 700; color: #1e293b; }

                    /* TABLES */
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #f8fafc; text-align: left; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; padding: 10px 15px; border-bottom: 2px solid #0f172a; }
                    td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                    .desc-cell { font-weight: 600; color: #1e293b; }
                    .amt-cell { text-align: right; font-weight: 800; font-family: monospace; font-size: 13px; }
                    
                    .total-row td { background: #fdf2f2; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; color: #991b1b; }
                    .total-label { font-size: 11px; font-weight: 900; }
                    .total-amt { font-size: 18px; font-weight: 900; }

                    /* PAYMENT DETAILS */
                    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
                    .summary-card p { margin: 0; font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
                    .summary-card h5 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; font-family: monospace; }
                    .highlight-green { background: #f0fdf4; border-color: #dcfce7; }
                    .highlight-green h5 { color: #166534; }
                    .highlight-red { background: #fff1f2; border-color: #ffe4e6; }
                    .highlight-red h5 { color: #991b1b; }

                    .payment-info-box { background: #fafafa; border: 1px dashed #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

                    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 40px; }
                    .disclaimer { font-size: 9px; color: #94a3b8; max-width: 350px; line-height: 1.5; font-weight: 500; }
                    .sig-area { text-align: center; }
                    .sig-line { border-top: 1px solid #0f172a; width: 170px; padding-top: 8px; font-weight: 800; font-size: 11px; color: #0f172a; }

                    @media print { 
                        body { padding: 0; margin: 0; }
                        .receipt-wrapper { border: none; padding: 0; max-width: 100%; height: 100vh; display: flex; flex-direction: column; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-wrapper">
                    <div class="header">
                        <div class="logo-box">S</div>
                        <div class="college-info">
                            <h1>SMART CMS UNIVERSITY</h1>
                            <p>Global Academic Excellence • Affiliated to State University • Accredited A+</p>
                            <p style="text-transform: none; margin-top: 4px;">Academic Block 4, Knowledge City, Sector 12B</p>
                        </div>
                        <div class="receipt-meta">
                            <h2>Student Fee Receipt</h2>
                            <div class="meta-row">RCT No: #RCPT-${Math.random().toString(36).substr(2, 7).toUpperCase()}</div>
                            <div class="meta-row">Date: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div class="section-title">Student Academic Profile</div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <p>Student Name</p>
                            <h4>${structure.student?.name || 'N/A'}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Enrollment Number</p>
                            <h4>${structure.student?.studentId || 'N/A'}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Roll Number</p>
                            <h4>${structure.student?.rollNum || 'N/A'}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Course / Branch</p>
                            <h4>${structure.student?.course || 'N/A'} - ${structure.student?.branch || 'N/A'}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Semester</p>
                            <h4>Semester ${structure.semester}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Academic Year</p>
                            <h4>2024 - 2025</h4>
                        </div>
                    </div>

                    <div class="section-title">Fee Breakdown Table</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description / Fee Head</th>
                                <th style="text-align: right;">Amount (INR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(structure.feeStructure?.fees || []).map(f => `
                                <tr>
                                    <td class="desc-cell">${f.categoryId?.name || 'General Fee Item'}</td>
                                    <td class="amt-cell">₹${f.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            ${(structure.extraFees || []).map(f => `
                                <tr>
                                    <td class="desc-cell">${f.remark} (Extra)</td>
                                    <td class="amt-cell">₹${f.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td class="total-label" style="text-align: right; padding-right: 20px;">Total Owed Amount (Net)</td>
                                <td class="amt-cell total-amt">₹${(structure.totalFee + (structure.extraFees?.reduce((s, f) => s + f.amount, 0) || 0)).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="section-title">Payment Settlement Details</div>
                    <div class="summary-grid">
                        <div class="summary-card highlight-green">
                            <p>Total Paid</p>
                            <h5>₹${structure.paidAmount.toLocaleString()}</h5>
                        </div>
                        <div class="summary-card highlight-red">
                            <p>Pending Bal.</p>
                            <h5>₹${structure.pendingAmount.toLocaleString()}</h5>
                        </div>
                        <div class="summary-card">
                            <p>Last Payment Date</p>
                            <h5 style="font-size: 11px;">${latestPayment.paymentDate ? new Date(latestPayment.paymentDate).toLocaleDateString() : 'N/A'}</h5>
                        </div>
                        <div class="summary-card">
                            <p>Installment No.</p>
                            <h5>#${installmentNum}</h5>
                        </div>
                    </div>

                    <div class="payment-info-box">
                        <div class="detail-item">
                            <p>Payment Mode</p>
                            <h4 style="font-size: 11px;">${latestPayment.paymentMode || '---'}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Transaction ID</p>
                            <h4 style="font-size: 11px; font-family: monospace;">${latestPayment.transactionId || '---'}</h4>
                        </div>
                        <div class="detail-item">
                            <p>Payment Status</p>
                            <h4 style="font-size: 11px; color: ${structure.status === 'PAID' ? '#059669' : '#d97706'}">${structure.status}</h4>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="disclaimer">
                            <strong>Note:</strong> This is a computer-generated receipt issued by SMART  ERP System. No physical seal is required. Please keep this document for future academic reference. Any discrepancies should be reported to the accounts department within 7 working days.
                        </div>
                        <div class="sig-area">
                            <div class="sig-line">Authorized Registrar</div>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 300);
                    }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PAID': return { label: 'Fully Paid', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle size={14} /> };
            case 'PARTIAL': return { label: 'Partially Paid', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14} /> };
            default: return { label: 'Unpaid', color: 'text-rose-600', bg: 'bg-rose-50', icon: <AlertCircle size={14} /> };
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Fees & Payments</h1>
                    <p className="text-slate-500 mt-1">View your semester-wise fee breakdown and payment receipts</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-medium">Loading your fee records...</div>
                ) : fees.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-200">
                        <CreditCard size={64} className="mx-auto text-slate-200 mb-6" />
                        <h2 className="text-xl font-bold text-slate-800">No Fees Assigned</h2>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">You don't have any fees assigned to your account yet. Please contact the administrator for details.</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Sidebar: Semester List */}
                        <div className="lg:col-span-4 space-y-4">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Assigned Semesters</h2>
                            {fees.map((fee) => (
                                <button
                                    key={fee._id}
                                    onClick={() => handleSelectFee(fee)}
                                    className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 ${selectedStructure?._id === fee._id
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.02]'
                                            : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${selectedStructure?._id === fee._id ? 'bg-white/20' : 'bg-slate-100'
                                            }`}>
                                            Sem {fee.semester}
                                        </span>
                                        {selectedStructure?._id === fee._id && <div className="p-1.5 bg-white/20 rounded-full"><FileText size={14} /></div>}
                                    </div>
                                    <h3 className="text-lg font-bold mb-1 truncate">{fee.feeStructure?.course}</h3>
                                    <p className={`text-sm mb-4 font-medium ${selectedStructure?._id === fee._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        Pending: ₹{fee.pendingAmount.toLocaleString()}
                                    </p>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedStructure?._id === fee._id
                                            ? 'bg-white/20 text-white'
                                            : getStatusInfo(fee.status).bg + ' ' + getStatusInfo(fee.status).color
                                        }`}>
                                        {getStatusInfo(fee.status).icon}
                                        {getStatusInfo(fee.status).label}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Detail Area */}
                        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {selectedStructure && (
                                <>
                                    {/* Main Summary Card */}
                                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-8 md:p-10">
                                            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
                                                <div>
                                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">Semester {selectedStructure.semester} Summary</h2>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{selectedStructure.feeStructure?.courseId?.name || selectedStructure.feeStructure?.course}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                                                    <button
                                                        onClick={handleDownloadReceipt}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-2xl transition-all shadow-lg font-bold text-sm group"
                                                    >
                                                        <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                                                        Download Receipt
                                                    </button>
                                                    {selectedStructure.pendingAmount > 0 && (
                                                        <button
                                                            onClick={() => setIsPaymentModalOpen(true)}
                                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-2xl transition-all shadow-lg font-bold text-sm shadow-indigo-100 group"
                                                        >
                                                            <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
                                                            Pay Fee Online
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setIsStructureModalOpen(true)}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-700 px-5 py-3.5 rounded-2xl transition-all shadow-sm font-bold text-sm group"
                                                    >
                                                        <FileText size={18} className="text-indigo-500 group-hover:rotate-6 transition-transform" />
                                                        Structure Details
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4 group hover:bg-white transition-all shadow-xs hover:shadow-md">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shadow-sm">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Total Fee</p>
                                                        <h4 className="text-2xl font-black text-slate-900 font-mono italic leading-none">₹{selectedStructure.totalFee.toLocaleString()}</h4>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center gap-4 group hover:bg-emerald-100/50 transition-all shadow-xs hover:shadow-md">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-sm">
                                                        <CheckCircle size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-0.5">Total Paid</p>
                                                        <h4 className="text-2xl font-black text-emerald-700 font-mono italic leading-none">₹{selectedStructure.paidAmount.toLocaleString()}</h4>
                                                    </div>
                                                </div>
                                                <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 flex items-center gap-4 group hover:bg-rose-100/50 transition-all shadow-xs hover:shadow-md">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shadow-sm">
                                                        <Clock size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-0.5">Remaining</p>
                                                        <h4 className="text-2xl font-black text-rose-700 font-mono italic leading-none">₹{selectedStructure.pendingAmount.toLocaleString()}</h4>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Extra Fees Alert */}
                                            {selectedStructure.extraFees?.length > 0 && (
                                                <div className="mb-10 space-y-3">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Additional Fines / Adjustments</h4>
                                                    {selectedStructure.extraFees.map((extra, i) => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white rounded-lg text-amber-600"><AlertCircle size={16} /></div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">{extra.remark}</p>
                                                                    <p className="text-xs text-slate-500">{new Date(extra.date).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-mono font-bold text-amber-700">₹{extra.amount.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* History Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                    <History size={14} />
                                                    Transaction History
                                                </h4>
                                                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                                                    {historyLoading ? (
                                                        <div className="p-10 text-center text-slate-400 text-sm">Loading history...</div>
                                                    ) : history.length === 0 ? (
                                                        <div className="p-10 text-center text-slate-400 text-sm italic">No transactions recorded yet.</div>
                                                    ) : history.map((pay) => (
                                                        <div key={pay._id} className="p-5 flex items-center justify-between hover:bg-white transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                                                                    <CreditCard size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 font-mono">₹{pay.amount.toLocaleString()}</p>
                                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                        <span>{pay.paymentMode}</span>
                                                                        <span>•</span>
                                                                        <span>{new Date(pay.paymentDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-indigo-500 font-black tracking-widest uppercase mb-1">{pay.transactionId ? 'Confirmed' : 'Recorded'}</p>
                                                                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">{pay.transactionId || '---'}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {isReceiptModalOpen && tempReceiptData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm receipt-modal-overlay">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] receipt-modal-container">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 print-hide">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Payment Receipt</h3>
                                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Transaction Verification Document</p>
                            </div>
                            <button onClick={() => setIsReceiptModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div id="receipt-content" className="p-10 overflow-y-auto bg-white flex-1 custom-scrollbar">
                            <div className="border-[3px] border-slate-900 p-8 relative">
                                {/* Watermark or Logo background effect could go here */}
                                <div className="absolute top-4 right-4 text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] rotate-12 pointer-events-none">Official Digital Copy</div>

                                <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter">SMART CMS</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Institution Receipt</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">Date: {new Date().toLocaleDateString()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Receipt ID: #RCPT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-10">
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Student Details</h4>
                                        <p className="text-sm font-bold text-slate-800">{tempReceiptData.structure.student?.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{tempReceiptData.structure.student?.rollNum}</p>
                                        <p className="text-xs text-slate-500 font-medium">{tempReceiptData.structure.feeStructure?.course}</p>
                                    </div>
                                    <div className="text-right space-y-3">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Billing Instance</h4>
                                        <p className="text-sm font-bold text-slate-800">Semester {tempReceiptData.structure.semester}</p>
                                        <p className="text-xs text-slate-500 font-medium font-mono">₹{tempReceiptData.structure.totalFee.toLocaleString()}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-10 border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900">
                                            <th className="py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                            <th className="py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic">
                                        {tempReceiptData.structure.feeStructure?.fees?.map((f, idx) => (
                                            <tr key={idx}>
                                                <td className="py-4 text-sm font-bold text-slate-700">{f.categoryId?.name || 'Academic Fee'}</td>
                                                <td className="py-4 text-right font-mono font-bold text-slate-600">₹{f.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {tempReceiptData.structure.extraFees?.map((e, idx) => (
                                            <tr key={idx}>
                                                <td className="py-4 text-sm font-bold text-slate-700">{e.remark} (Extra)</td>
                                                <td className="py-4 text-right font-mono font-bold text-slate-600">₹{e.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-slate-900">
                                            <td className="py-6 text-sm font-black uppercase tracking-widest text-slate-900">Total Net Amount</td>
                                            <td className="py-6 text-right font-mono text-xl font-black text-slate-900">₹{(tempReceiptData.structure.totalFee + (tempReceiptData.structure.extraFees?.reduce((s, e) => s + e.amount, 0) || 0)).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className="space-y-4 mb-10">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Credits Received</h4>
                                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-tighter">Verified Payments</p>
                                            <p className="text-2xl font-black text-emerald-700 font-mono">₹{tempReceiptData.structure.paidAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg ring-1 ring-emerald-200">
                                                {tempReceiptData.structure.status === 'PAID' ? 'FULLY SETTLED' : 'PARTIAL CREDIT'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-8 mt-10 grid grid-cols-2 gap-10">
                                    <div className="space-y-4 opacity-30">
                                        {/* Simplified QR Placeholder */}
                                        <div className="w-16 h-16 border-4 border-slate-900 flex items-center justify-center font-black text-[8px] leading-[8px] text-center p-1">QR AUTH PENDING</div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase leading-[10px]">Verify digital authenticity via institution portal</p>
                                    </div>
                                    <div className="text-right flex flex-col justify-end">
                                        <div className="h-px bg-slate-900 w-32 ml-auto mb-2"></div>
                                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Authorized Signature</p>
                                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-1 tracking-tighter italic">Computer Generated Document - No Seal Needed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4 print-hide">
                            <button
                                onClick={() => setIsReceiptModalOpen(false)}
                                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-white transition-all shadow-sm"
                            >
                                Back to Portal
                            </button>
                            <button
                                onClick={handleActualPrint}
                                className="flex-1 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                            >
                                <FileText size={20} />
                                Print Official Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Online Payment Modal */}
            {isPaymentModalOpen && selectedStructure && (
                <StudentPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    feeRecord={selectedStructure}
                    onSuccess={() => {
                        fetchFees();
                        if (selectedStructure) handleSelectFee(selectedStructure);
                    }}
                />
            )}

            {/* Fee Structure Detail Modal */}
            {isStructureModalOpen && selectedStructure && (
                <FeeStructureDetailModal
                    isOpen={isStructureModalOpen}
                    onClose={() => setIsStructureModalOpen(false)}
                    feeRecord={selectedStructure}
                />
            )}
        </div>
    );
};

// Add some basic modal styles
const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;
document.head.appendChild(style);

const XCircle = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
);

export default StudentMyFees;
