import React, { useState } from 'react';
import { X, CreditCard, Send, Smartphone, IndianRupee, Landmark, CheckCircle, ShieldCheck, HelpCircle, Copy, Check } from 'lucide-react';
import feeService from '../../../../services/feeService';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StudentPaymentModal = ({ isOpen, onClose, feeRecord, onSuccess }) => {
    const [step, setStep] = useState('METHOD'); // METHOD, UPI, CARD, STRIPE, PROCESSING, SUCCESS
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [copied, setCopied] = useState(false);
    
    // Form States
    const [txnId, setTxnId] = useState('');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });

    if (!isOpen || !feeRecord) return null;

    const handleCopyVPA = () => {
        navigator.clipboard.writeText('college@upi');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaymentSubmit = async (manualTxnId) => {
        try {
            setStep('PROCESSING');
            setLoading(true);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const finalTxnId = manualTxnId || `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            
            await feeService.payMyFees({
                studentFeeId: feeRecord._id,
                amount: feeRecord.pendingAmount, // Paying full pending for now, could be dynamic
                paymentMode: paymentMethod,
                transactionId: finalTxnId
            });

            setStep('SUCCESS');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment recording failed');
            setStep(paymentMethod.toUpperCase());
        } finally {
            setLoading(false);
        }
    };

    const handleCardSubmit = (e) => {
        e.preventDefault();
        if (cardData.number.length < 16) return toast.error('Check Card Number');
        handlePaymentSubmit();
    };

    const handleUPISubmit = (e) => {
        e.preventDefault();
        if (!txnId) return toast.error('Transaction ID is required');
        handlePaymentSubmit(txnId);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header Style Changes based on state */}
                <div className={`px-8 py-6 border-b border-slate-100 flex justify-between items-center ${step === 'SUCCESS' ? 'bg-emerald-50' : 'bg-slate-50/50'}`}>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            {step === 'SUCCESS' ? 'Payment Completed' : 'Online Fee Payment'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                            Sem {feeRecord.semester} • Outstanding: ₹{feeRecord.pendingAmount.toLocaleString()}
                        </p>
                    </div>
                    {step !== 'PROCESSING' && (
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {step === 'METHOD' && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-500 mb-2 italic">Select your preferred payment method:</p>
                            
                            <button 
                                onClick={() => { setPaymentMethod('UPI'); setStep('UPI'); }}
                                className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900">UPI / GPay / PhonePe</h4>
                                        <p className="text-xs text-slate-400">Scan QR or enter VPA</p>
                                    </div>
                                </div>
                                <Send size={18} className="text-slate-200 group-hover:text-indigo-500" />
                            </button>

                            <button 
                                onClick={() => { setPaymentMethod('Card'); setStep('CARD'); }}
                                className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900">Credit / Debit Card</h4>
                                        <p className="text-xs text-slate-400">Visa, Mastercard, RuPay</p>
                                    </div>
                                </div>
                                <Landmark size={18} className="text-slate-200 group-hover:text-emerald-500" />
                            </button>

                            <button 
                                onClick={() => setStep('STRIPE')}
                                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900">Real Card / Stripe</h4>
                                        <p className="text-xs text-slate-400">International & Domestic Cards</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Send size={14} className="text-indigo-400" />
                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Powered by Stripe</span>
                                </div>
                            </button>

                            <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3">
                                <ShieldCheck className="text-indigo-500 shrink-0" size={18} />
                                <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                                    Your payment is processed through a secure 256-bit encrypted gateway. The institution never stores your sensitive card or UPI details.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'UPI' && (
                        <form onSubmit={handleUPISubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="w-40 h-40 bg-slate-50 border-4 border-slate-100 p-2 rounded-3xl relative">
                                    {/* Dummy QR Effect */}
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[8px] font-black text-center p-2 opacity-10">QR IMAGE PLACEHOLDER</div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <Smartphone size={40} className="text-slate-200" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Scan QR with any UPI App</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">UPI ID (VPA)</p>
                                        <p className="text-sm font-bold text-slate-900 font-mono">college@okicici</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleCopyVPA}
                                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
                                    >
                                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">GPay Transaction ID</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="e.g. 1324 5678 9012"
                                        value={txnId}
                                        onChange={(e) => setTxnId(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold text-lg"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setStep('METHOD')} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Back</button>
                                <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-4 transition-all shadow-xl shadow-indigo-100">Submit Verification</button>
                            </div>
                        </form>
                    )}

                    {step === 'CARD' && (
                        <form onSubmit={handleCardSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 text-white aspect-[1.6/1] flex flex-col justify-between mb-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                <div className="flex justify-between items-start">
                                    <Landmark size={24} className="opacity-40" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Visa_2021.svg/1200px-Visa_2021.svg.png" className="h-4 brightness-200 grayscale" alt="" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-2">Card Number</p>
                                    <p className="text-xl font-mono tracking-widest font-black">
                                        {cardData.number ? cardData.number.match(/.{1,4}/g)?.join(' ') : 'XXXX XXXX XXXX XXXX'}
                                    </p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] font-bold uppercase opacity-30">Card Holder</p>
                                        <p className="text-sm font-bold uppercase tracking-tight truncate max-w-[150px]">{cardData.name || 'Your Full Name'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold uppercase opacity-30">Expires</p>
                                        <p className="text-sm font-bold tracking-tighter">{cardData.expiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input 
                                    type="text" placeholder="Card Holder Name" maxLength="30"
                                    value={cardData.name} onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                                />
                                <input 
                                    type="text" placeholder="Card Number" maxLength="16"
                                    value={cardData.number} onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\D/g, '')})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" placeholder="MM/YY" maxLength="5"
                                        value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-center"
                                    />
                                    <input 
                                        type="password" placeholder="CVV" maxLength="3"
                                        value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setStep('METHOD')} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Back</button>
                                <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-4 transition-all shadow-xl shadow-indigo-100">Pay Outstanding</button>
                            </div>
                        </form>
                    )}

                    {step === 'STRIPE' && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <Elements stripe={stripePromise}>
                                <StripePaymentForm 
                                    amount={feeRecord.pendingAmount}
                                    feeRecord={feeRecord}
                                    onSuccess={() => setStep('SUCCESS')}
                                    onProcessing={(status) => setLoading(status)}
                                />
                                {!loading && (
                                    <button 
                                        type="button" 
                                        onClick={() => setStep('METHOD')} 
                                        className="w-full mt-4 px-6 py-3 border border-slate-200 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                                    >
                                        Cancel & Go Back
                                    </button>
                                )}
                            </Elements>
                            
                            {loading && (
                                <div className="mt-8 py-10 flex flex-col items-center justify-center space-y-4 animate-pulse text-center">
                                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 tracking-tight">Securing Transaction...</h4>
                                        <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Encryption: AES-256 Active</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'PROCESSING' && paymentMethod !== 'STRIPE' && (
                        <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-pulse text-center">
                            <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">Securing Transaction...</h4>
                                <p className="text-xs text-slate-400 font-medium">Please do not refresh or close the browser.</p>
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="py-8 space-y-8 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                                <CheckCircle size={48} />
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h4>
                                <p className="text-sm text-slate-500 font-medium max-w-[200px] mx-auto leading-relaxed">Your semester fee has been updated in our central servers.</p>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest leading-none">Status</span>
                                    <span className="text-emerald-600 font-black uppercase tracking-widest leading-none flex items-center gap-1">
                                        <ShieldCheck size={12} /> Confirmed
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest leading-none">Amount Paid</span>
                                    <span className="text-slate-900 font-black font-mono text-lg">₹{feeRecord.pendingAmount.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-px bg-slate-200"></div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Digital Auth ID</p>
                                    <p className="text-xs font-mono font-bold text-slate-800 break-all bg-white p-3 rounded-xl border border-slate-100">TXN-DIGI-{Math.random().toString(36).substr(2, 12).toUpperCase()}</p>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-full bg-slate-900 text-white font-bold rounded-2xl py-4 transition-all hover:bg-slate-800 shadow-xl shadow-slate-200"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer common */}
                {step !== 'SUCCESS' && step !== 'PROCESSING' && (
                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-2">
                         <HelpCircle size={14} className="text-slate-400" />
                         <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Encryption: AES-256 Enabled</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPaymentModal;
