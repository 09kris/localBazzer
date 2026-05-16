const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { jwtAuth, sellerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(jwtAuth);
router.use(sellerOnly);

// Profile
router.route('/profile')
  .get(sellerController.getProfile)
  .put(sellerController.updateProfile);

// Products
router.route('/products')
  .get(sellerController.getProducts)
  .post(upload.array('images', 5), sellerController.addProduct);

router.route('/products/:id')
  .put(upload.array('images', 5), sellerController.updateProduct)
  .delete(sellerController.deleteProduct);

// Orders
router.get('/orders', sellerController.getOrders);
router.put('/orders/:id/status', sellerController.updateOrderStatus);

module.exports = router;
