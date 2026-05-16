const { City, Category, Seller, Product, Order, OrderItem, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/cities
const getCities = async (req, res, next) => {
  try {
    const cities = await City.findAll();
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// GET /api/shops
const getShops = async (req, res, next) => {
  try {
    const { city, category, search } = req.query;
    let whereClause = { status: 'active' };

    if (city) {
      const cityRec = await City.findOne({ where: { name: city } });
      if (cityRec) whereClause.cityId = cityRec.id;
    }

    if (category) {
      const catRec = await Category.findOne({ where: { name: category } });
      if (catRec) whereClause.categoryId = catRec.id;
    }

    if (search) {
      whereClause.shopName = { [Op.like]: `%${search}%` };
    }

    const shops = await Seller.findAll({
      where: whereClause,
      include: [
        { model: City, attributes: ['name'] },
        { model: Category, attributes: ['name'] }
      ]
    });
    res.status(200).json({ success: true, data: shops });
  } catch (error) {
    next(error);
  }
};

// GET /api/shops/:id
const getShopDetails = async (req, res, next) => {
  try {
    const shop = await Seller.findOne({
      where: { id: req.params.id, status: 'active' },
      include: [
        { model: City, attributes: ['name'] },
        { model: Category, attributes: ['name'] }
      ]
    });
    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }
    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    next(error);
  }
};

// GET /api/shops/:id/products
const getShopProducts = async (req, res, next) => {
  try {
    const { subCategory } = req.query;
    let whereClause = { sellerId: req.params.id, isAvailable: true };
    if (subCategory) whereClause.subCategory = subCategory;

    const products = await Product.findAll({ where: whereClause });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { customerName, deliveryAddress, city, note, items } = req.body;
    
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items in order');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product || !product.isAvailable || product.stock < item.quantity) {
        throw new Error(`Product ${product ? product.name : item.productId} is unavailable or out of stock`);
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        sellerId: product.sellerId,
        productName: product.name,
        priceAtOrder: product.price,
        quantity: item.quantity
      });

      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    const orderCode = 'LB-' + Date.now();
    const order = await Order.create({
      orderCode,
      customerName,
      deliveryAddress,
      city,
      note,
      totalAmount,
      status: 'pending'
    }, { transaction: t });

    for (let oItem of orderItems) {
      oItem.orderId = order.id;
      await OrderItem.create(oItem, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, data: { orderCode, totalAmount }, message: 'Order created successfully' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// GET /api/orders/track/:orderCode
const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { orderCode: req.params.orderCode },
      include: [OrderItem]
    });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCities,
  getCategories,
  getShops,
  getShopDetails,
  getShopProducts,
  getProductDetails,
  createOrder,
  trackOrder
};
