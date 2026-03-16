import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import feeService from '../../../../services/feeService';

const StripePaymentForm = ({ amount, feeRecord, onSuccess, onProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        try {
            setIsProcessing(true);
            onProcessing(true);

            // 1. Create Payment Intent on backend
            const response = await feeService.createPaymentIntent({ amount });
            console.log('[Stripe Debug] Backend Intent Response:', response.data);
            const clientSecret = response.data.clientSecret;

            // 2. Confirm payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: feeRecord.student?.name || 'Student',
                        address: {
                            line1: 'College Campus',
                            postal_code: '110001',
                            country: 'IN',
                        }
                    },
                }
            });

            console.log('[Stripe Debug] Confirmation Result:', result);

            if (result.error) {
                console.error('[Stripe Error] Message:', result.error.message);
                console.error('[Stripe Error] Code:', result.error.code);
                toast.error(`Stripe Error: ${result.error.message}`);
                onProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Record success in our DB
                    await feeService.payMyFees({
                        studentFeeId: feeRecord._id,
                        amount: amount,
                        paymentMode: 'Card',
                        transactionId: result.paymentIntent.id
                    });
                    
                    onSuccess();
                }
            }
        } catch (error) {
            console.error('[Stripe] Payment Error:', error);
            toast.error('Payment failed. Please try again.');
            onProcessing(false);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Card Details (Secure)</span>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <CardElement 
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#1e293b',
                                    '::placeholder': { color: '#94a3b8' },
                                    fontFamily: 'Inter, sans-serif',
                                },
                                invalid: { color: '#ef4444' },
                            },
                        }} 
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 px-2 text-[10px] text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-emerald-500" />
                Payments are secured by Stripe with AES-256 encryption.
            </div>

            <button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-4 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Securely...
                    </>
                ) : (
                    `Pay ₹${amount.toLocaleString()}`
                )}
            </button>
        </form>
    );
};

export default StripePaymentForm;
