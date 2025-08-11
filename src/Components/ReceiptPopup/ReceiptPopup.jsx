import './ReceiptPopup.css';
import './Print.css';

const ReceiptPopup = ({orderDetails, onClose, onPrint}) => {
    const formatDateTime = () => {
        return new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getPaymentStatusIcon = () => {
        if (orderDetails.paymentMethod === "UPI") {
            return "💳";
        }
        return "💵";
    };

    const getStatusBadge = () => {
        return orderDetails.paymentMethod === "UPI" ? "paid" : "received";
    };

    return (
        <div className="receipt-popup-overlay">
            <div className="receipt-popup">
                {/* Success Header */}
                <div className="receipt-header">
                    <div className="success-icon">
                        <div className="checkmark">✓</div>
                    </div>
                    <h2 className="receipt-title">Payment Successful!</h2>
                    <p className="receipt-subtitle">Your order has been processed successfully</p>
                </div>

                {/* Order Summary Card */}
                <div className="order-summary-card">
                    <div className="order-header">
                        <h3>📧 Order Receipt</h3>
                        <span className={`status-badge status-${getStatusBadge()}`}>
                            {getPaymentStatusIcon()} {getStatusBadge().toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="order-details">
                        <div className="detail-row">
                            <span className="detail-label">Order ID</span>
                            <span className="detail-value">{orderDetails.orderId}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Date & Time</span>
                            <span className="detail-value">{formatDateTime()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Customer</span>
                            <span className="detail-value">{orderDetails.customerName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Phone</span>
                            <span className="detail-value">{orderDetails.phoneNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Items Card */}
                <div className="items-card">
                    <h4 className="items-title">🛒 Items Ordered</h4>
                    <div className="items-list">
                        {orderDetails.items.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-quantity">×{item.quantity}</span>
                                </div>
                                <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="payment-summary-card">
                    <h4 className="summary-title">💰 Payment Summary</h4>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{orderDetails.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (1%)</span>
                            <span>₹{orderDetails.tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total-row">
                            <span>Total Paid</span>
                            <span>₹{orderDetails.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="payment-method">
                        <div className="payment-info">
                            <span className="payment-label">Payment Method</span>
                            <span className="payment-value">{orderDetails.paymentMethod}</span>
                        </div>
                        
                        {orderDetails.paymentMethod === "UPI" && (
                            <div className="payment-details">
                                {orderDetails.stripePaymentIntentId && (
                                    <div className="payment-detail">
                                        <span className="payment-detail-label">Payment ID</span>
                                        <span className="payment-detail-value">
                                            {orderDetails.stripePaymentIntentId.substring(0, 20)}...
                                        </span>
                                    </div>
                                )}
                                {orderDetails.razorpayOrderId && (
                                    <>
                                        <div className="payment-detail">
                                            <span className="payment-detail-label">Razorpay Order ID</span>
                                            <span className="payment-detail-value">
                                                {orderDetails.razorpayOrderId.substring(0, 20)}...
                                            </span>
                                        </div>
                                        <div className="payment-detail">
                                            <span className="payment-detail-label">Razorpay Payment ID</span>
                                            <span className="payment-detail-value">
                                                {orderDetails.razorpayPaymentId.substring(0, 20)}...
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="receipt-actions">
                    <button className="btn btn-print" onClick={onPrint}>
                        🖨️ Print Receipt
                    </button>
                    <button className="btn btn-close" onClick={onClose}>
                        ✕ Close
                    </button>
                </div>

                {/* Footer */}
                <div className="receipt-footer">
                    <p>Thank you for your business! 🙏</p>
                    <p className="footer-note">Keep this receipt for your records</p>
                </div>
            </div>
        </div>
    )
}

export default ReceiptPopup;