// import './CartSummary.css';
import {useContext, useState} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import ReceiptPopup from "../ReceiptPopup/ReceiptPopup.jsx";
import StripePaymentModal from "../StripePaymentModal/StripePaymentModal.jsx"; // New component
import {createOrder, deleteOrder} from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import {createStripePaymentIntent, verifyPayment} from "../../Service/PaymentService.js";
import {AppConstants} from "../../Util/constants.js";

const CartSummary = ({customerName, mobileNumber, setMobileNumber, setCustomerName}) => {
    const {cartItems, clearCart} = useContext(AppContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [stripeClientSecret, setStripeClientSecret] = useState(null);

    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = totalAmount * 0.01;
    const grandTotal = totalAmount + tax;

    const clearAll = () => {
        setCustomerName("");
        setMobileNumber("");
        clearCart();
    }

    const placeOrder = () => {
        setShowPopup(true);
        clearAll();
    }

    const handlePrintReceipt = () => {
        window.print();
    }

    const loadStripeScript = () => {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = "https://js.stripe.com/v3/";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    const deleteOrderOnFailure = async (orderId) => {
        try {
            await deleteOrder(orderId);
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    const completePayment = async (paymentMode) => {
        if (!customerName || !mobileNumber) {
            toast.error("Please enter customer details");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        
        const orderData = {
            customerName,
            phoneNumber: mobileNumber,
            cartItems,
            subtotal: totalAmount,
            tax,
            grandTotal,
            paymentMethod: paymentMode.toUpperCase()
        }
        
        setIsProcessing(true);
        try {
            const response = await createOrder(orderData);
            const savedData = response.data;
            
            if (response.status === 201 && paymentMode === "cash") {
                toast.success("Cash received");
                setOrderDetails(savedData);
            } else if (response.status === 201 && paymentMode === "upi") {
                const stripeLoaded = await loadStripeScript();
                if (!stripeLoaded) {
                    toast.error('Unable to load Stripe');
                    await deleteOrderOnFailure(savedData.orderId);
                    return;
                }

                // Create Stripe PaymentIntent
                const stripeResponse = await createStripePaymentIntent({
                    amount: grandTotal, 
                    currency: 'INR'
                });
                
                // Store order and client secret for the modal
                setCurrentOrder(savedData);
                setStripeClientSecret(stripeResponse.data.clientSecret);
                setShowStripeModal(true);
            }
        } catch(error) {
            console.error(error);
            toast.error("Payment processing failed");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleStripePaymentSuccess = async (paymentIntent, paymentMethod) => {
        try {
            // Verify payment with your backend
            await verifyPaymentHandler({
                stripePaymentIntentId: paymentIntent.id,
                stripePaymentMethodId: paymentMethod.id,
                clientSecret: stripeClientSecret
            }, currentOrder);
            
            setShowStripeModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Payment verification failed");
        }
    };

    const handleStripePaymentError = async (error) => {
        console.error(error);
        toast.error(`Payment failed: ${error.message}`);
        if (currentOrder) {
            await deleteOrderOnFailure(currentOrder.orderId);
        }
        setShowStripeModal(false);
    };

    const handleStripeModalClose = async () => {
        if (currentOrder) {
            await deleteOrderOnFailure(currentOrder.orderId);
            toast.error("Payment cancelled");
        }
        setShowStripeModal(false);
    };

    const verifyPaymentHandler = async (response, savedOrder) => {
        const paymentData = {
            stripePaymentIntentId: response.stripePaymentIntentId,
            stripePaymentMethodId: response.stripePaymentMethodId,
            clientSecret: response.clientSecret,
            orderId: savedOrder.orderId
        };
        
        try {
            const paymentResponse = await verifyPayment(paymentData);
            if (paymentResponse.status === 200) {
                toast.success("Payment successful");
                setOrderDetails({
                    ...savedOrder,
                    paymentDetails: {
                        stripePaymentIntentId: response.stripePaymentIntentId,
                        stripePaymentMethodId: response.stripePaymentMethodId,
                        clientSecret: response.clientSecret,
                        status: 'COMPLETED'
                    },
                });
            } else {
                toast.error("Payment processing failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Payment failed");
        }
    };

    return (
        <div className="mt-2">
            <div className="cart-summary-details">
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Item: </span>
                    <span className="text-light">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Tax (1%):</span>
                    <span className="text-light">₹{tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                    <span className="text-light">Total:</span>
                    <span className="text-light">₹{grandTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="d-flex gap-3">
                <button className="btn btn-success flex-grow-1"
                    onClick={() => completePayment("cash")}
                        disabled={isProcessing}
                >
                    {isProcessing ? "Processing...": "Cash"}
                </button>
                <button className="btn btn-primary flex-grow-1"
                        onClick={() => completePayment("upi")}
                        disabled={isProcessing}
                >
                    {isProcessing ? "Processing...": "UPI"}
                </button>
            </div>
            <div className="d-flex gap-3 mt-3">
                <button className="btn btn-warning flex-grow-1"
                    onClick={placeOrder}
                    disabled={isProcessing || !orderDetails}
                >
                    Place Order
                </button>
            </div>

            {showStripeModal && (
                <StripePaymentModal
                    clientSecret={stripeClientSecret}
                    customerName={customerName}
                    mobileNumber={mobileNumber}
                    amount={grandTotal}
                    onPaymentSuccess={handleStripePaymentSuccess}
                    onPaymentError={handleStripePaymentError}
                    onClose={handleStripeModalClose}
                />
            )}

            {showPopup && (
                <ReceiptPopup
                    orderDetails={{
                        ...orderDetails,
                        stripePaymentIntentId: orderDetails.paymentDetails?.stripePaymentIntentId,
                        stripePaymentMethodId: orderDetails.paymentDetails?.stripePaymentMethodId,
                        clientSecret: orderDetails.paymentDetails?.clientSecret,
                    }}
                    onClose={() => setShowPopup(false)}
                    onPrint={handlePrintReceipt}
                />
            )}
        </div>
    )
}

export default CartSummary;