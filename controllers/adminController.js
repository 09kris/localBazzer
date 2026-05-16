const { City, Category, Seller, Order } = require('../models');

// Sellers
const getSellers = async (req, res, next) => {
  try {
    const sellers = await Seller.findAll({ attributes: { exclude: ['passwordHash'] } });
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    next(error);
  }
};

const updateSellerStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active', 'inactive', 'pending'
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) throw new Error('Seller not found');
    
    seller.status = status;
    await seller.save();
    res.status(200).json({ success: true, data: seller, message: `Seller status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

// Cities
const addCity = async (req, res, next) => {
  try {
    const city = await City.create({ name: req.body.name });
    res.status(201).json({ success: true, data: city, message: 'City added' });
  } catch (error) {
    next(error);
  }
};

const updateCity = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) throw new Error('City not found');
    city.name = req.body.name;
    await city.save();
    res.status(200).json({ success: true, data: city, message: 'City updated' });
  } catch (error) {
    next(error);
  }
};

const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) throw new Error('City not found');
    await city.destroy();
    res.status(200).json({ success: true, message: 'City deleted' });
  } catch (error) {
    next(error);
  }
};

// Categories
const addCategory = async (req, res, next) => {
  try {
    const category = await Category.create({ name: req.body.name, icon: req.body.icon });
    res.status(201).json({ success: true, data: category, message: 'Category added' });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new Error('Category not found');
    category.name = req.body.name || category.name;
    category.icon = req.body.icon || category.icon;
    await category.save();
    res.status(200).json({ success: true, data: category, message: 'Category updated' });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new Error('Category not found');
    await category.destroy();
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

// Orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSellers, updateSellerStatus,
  addCity, updateCity, deleteCity,
  addCategory, updateCategory, deleteCategory,
  getOrders
};
