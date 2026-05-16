const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { jwtAuth, adminOnly } = require('../middleware/authMiddleware');

router.use(jwtAuth);
router.use(adminOnly);

// Sellers
router.get('/sellers', adminController.getSellers);
router.put('/sellers/:id/approve', (req, res, next) => {
  req.body.status = 'active';
  adminController.updateSellerStatus(req, res, next);
});
router.put('/sellers/:id/reject', (req, res, next) => {
  req.body.status = 'inactive';
  adminController.updateSellerStatus(req, res, next);
});

// Cities
router.route('/cities')
  .post(adminController.addCity);
router.route('/cities/:id')
  .put(adminController.updateCity)
  .delete(adminController.deleteCity);

// Categories
router.route('/categories')
  .post(adminController.addCategory);
router.route('/categories/:id')
  .put(adminController.updateCategory)
  .delete(adminController.deleteCategory);

// Orders
router.get('/orders', adminController.getOrders);

module.exports = router;
