import React, { useState, useEffect } from 'react';
import { AppConstants } from "../../Util/constants.js";
import './StripePaymentModal.css'; // You'll need to create this CSS file

const StripePaymentModal = ({ 
    clientSecret, 
    customerName, 
    mobileNumber, 
    amount, 
    onPaymentSuccess, 
    onPaymentError, 
    onClose 
}) => {
    const [stripe, setStripe] = useState(null);
    const [elements, setElements] = useState(null);
    const [cardElement, setCardElement] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (window.Stripe) {
            const stripeInstance = window.Stripe(AppConstants.STRIPE_PUBLISHABLE_KEY);
            setStripe(stripeInstance);

            const elementsInstance = stripeInstance.elements({
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#667eea',
                        colorBackground: '#ffffff',
                        colorText: '#1e293b',
                        colorDanger: '#dc2626',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '12px',
                        fontSizeBase: '16px',
                        fontWeightNormal: '500',
                    },
                    rules: {
                        '.Input': {
                            boxShadow: 'none',
                            border: 'none',
                            padding: '0',
                        },
                        '.Input:focus': {
                            boxShadow: 'none',
                        },
                    }
                }
            });
            setElements(elementsInstance);

            // Create card element
            const cardElementInstance = elementsInstance.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#1e293b',
                        fontWeight: '500',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        '::placeholder': {
                            color: '#94a3b8',
                        },
                    },
                    invalid: {
                        color: '#dc2626',
                    },
                },
                hidePostalCode: true // For Indian cards
            });

            setCardElement(cardElementInstance);

            // Mount the card element
            setTimeout(() => {
                const cardContainer = document.getElementById('card-element');
                if (cardContainer && cardElementInstance) {
                    cardElementInstance.mount('#card-element');
                }
            }, 100);

            // Listen for real-time validation errors
            cardElementInstance.on('change', ({error}) => {
                setError(error ? error.message : null);
            });
        }

        // Cleanup function
        return () => {
            if (cardElement) {
                cardElement.unmount();
            }
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!stripe || !elements || !cardElement) {
            setError('Stripe has not loaded yet. Please try again.');
            setIsLoading(false);
            return;
        }

        try {
            // Confirm the payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: customerName,
                        phone: mobileNumber,
                    },
                }
            });

            if (error) {
                setError(error.message);
                onPaymentError(error);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Get the payment method details
                const paymentMethod = paymentIntent.payment_method;
                onPaymentSuccess(paymentIntent, paymentMethod);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('An unexpected error occurred. Please try again.');
            onPaymentError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stripe-modal-overlay">
            <div className="stripe-modal">
                <div className="stripe-modal-header">
                    <h4>💳 Complete Payment</h4>
                    <button 
                        type="button" 
                        className="stripe-modal-close" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>
                
                <div className="stripe-modal-body">
                    <div className="payment-summary">
                        <p><strong>Customer:</strong> {customerName}</p>
                        <p><strong>Mobile:</strong> {mobileNumber}</p>
                        <p><strong>Amount:</strong> ₹{amount.toFixed(2)}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="card-element">
                                💳 Credit or Debit Card
                            </label>
                            <div id="card-element" className="form-control">
                                {/* Stripe Elements will create form elements here */}
                            </div>
                        </div>

                        <div className="security-badge">
                            Your payment information is encrypted and secure
                        </div>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="stripe-modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading || !stripe}
                            >
                                {isLoading ? '' : `💸 Pay ₹${amount.toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StripePaymentModal;