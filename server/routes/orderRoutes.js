const express = require('express');
const {
	createOrder,
	getMyOrders,
	getAllOrders,
	updateOrderStatus,
	updatePaymentStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/payment-status', protect, adminOnly, updatePaymentStatus);

module.exports = router;
