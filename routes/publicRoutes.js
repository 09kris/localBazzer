const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const authController = require('../controllers/authController');

// Auth
router.post('/auth/seller/register', authController.registerSeller);
router.post('/auth/seller/login', authController.loginSeller);
router.post('/auth/admin/login', authController.loginAdmin);

// Data
router.get('/cities', publicController.getCities);
router.get('/categories', publicController.getCategories);

// Shops
router.get('/shops', publicController.getShops);
router.get('/shops/:id', publicController.getShopDetails);
router.get('/shops/:id/products', publicController.getShopProducts);

// Products
router.get('/products/:id', publicController.getProductDetails);

// Orders
router.post('/orders', publicController.createOrder);
router.get('/orders/track/:orderCode', publicController.trackOrder);

module.exports = router;
