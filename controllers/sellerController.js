const { Seller, Product, Order, OrderItem } = require('../models');

// GET /api/seller/profile
const getProfile = async (req, res, next) => {
  try {
    const seller = await Seller.findByPk(req.user.id, { attributes: { exclude: ['passwordHash'] } });
    if (!seller) throw new Error('Seller not found');
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error);
  }
};

// PUT /api/seller/profile
const updateProfile = async (req, res, next) => {
  try {
    const { description, logoUrl, bannerUrl, email, phone } = req.body;
    const seller = await Seller.findByPk(req.user.id);
    if (!seller) throw new Error('Seller not found');
    
    seller.description = description || seller.description;
    seller.logoUrl = logoUrl || seller.logoUrl;
    seller.bannerUrl = bannerUrl || seller.bannerUrl;
    seller.email = email || seller.email;
    seller.phone = phone || seller.phone;

    await seller.save();
    res.status(200).json({ success: true, data: seller, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
};

// GET /api/seller/products
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({ where: { sellerId: req.user.id } });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// POST /api/seller/products
const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, subCategory, isAvailable } = req.body;
    let imageUrls = [];
    if (req.files) {
      imageUrls = req.files.map(f => `/uploads/${f.filename}`);
    }

    const product = await Product.create({
      sellerId: req.user.id,
      name,
      description,
      price,
      stock,
      subCategory,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      imageUrls: JSON.stringify(imageUrls)
    });

    res.status(201).json({ success: true, data: product, message: 'Product added' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/seller/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, subCategory, isAvailable } = req.body;
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!product) {
      res.status(404);
      throw new Error('Product not found or not yours');
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.subCategory = subCategory || product.subCategory;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/${f.filename}`);
      let existingImages = product.imageUrls ? JSON.parse(product.imageUrls) : [];
      product.imageUrls = JSON.stringify([...existingImages, ...newImages]);
    }

    await product.save();
    res.status(200).json({ success: true, data: product, message: 'Product updated' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/seller/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    await product.destroy();
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// GET /api/seller/orders
const getOrders = async (req, res, next) => {
  try {
    const orderItems = await OrderItem.findAll({
      where: { sellerId: req.user.id },
      include: [{ model: Order }]
    });

    // Grouping by Order
    const ordersMap = {};
    orderItems.forEach(item => {
      const order = item.Order;
      if (!ordersMap[order.id]) {
        ordersMap[order.id] = {
          id: order.id,
          orderCode: order.orderCode,
          customerName: order.customerName,
          deliveryAddress: order.deliveryAddress,
          city: order.city,
          note: order.note,
          status: order.status,
          createdAt: order.createdAt,
          items: [],
          totalForSeller: 0
        };
      }
      ordersMap[order.id].items.push({
        id: item.id,
        productName: item.productName,
        priceAtOrder: item.priceAtOrder,
        quantity: item.quantity
      });
      ordersMap[order.id].totalForSeller += (item.priceAtOrder * item.quantity);
    });

    res.status(200).json({ success: true, data: Object.values(ordersMap) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/seller/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    
    // In a real multi-seller app, status might be per-orderItem, but for simplicity we update the main Order status
    // provided the seller is part of this order.
    const sellerItem = await OrderItem.findOne({ where: { orderId: order.id, sellerId: req.user.id } });
    if (!sellerItem) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }

    order.status = status;
    await order.save();
    
    res.status(200).json({ success: true, data: order, message: 'Order status updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile, updateProfile, getProducts, addProduct, updateProduct, deleteProduct, getOrders, updateOrderStatus
};
