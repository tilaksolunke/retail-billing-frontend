import axios from "axios";

export const createStripePaymentIntent = async (data) => {
    return await axios.post(`http://localhost:8080/api/v1.0/payments/create-payment-intent`, data, {
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
}

export const verifyPayment = async (paymentData) => {
    return await axios.post('http://localhost:8080/api/v1.0/payments/verify', paymentData, {
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    });
}
