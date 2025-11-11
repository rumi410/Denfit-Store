
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    orderItems: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String },
        country: { type: String },
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Confirmed'
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true 
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
