const sequelize = require('../config/database');

const City = require('./City');
const Category = require('./Category');
const Seller = require('./Seller');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Associations
// City hasMany Seller | Seller belongsTo City
City.hasMany(Seller, { foreignKey: 'cityId' });
Seller.belongsTo(City, { foreignKey: 'cityId' });

// Category hasMany Seller | Seller belongsTo Category
Category.hasMany(Seller, { foreignKey: 'categoryId' });
Seller.belongsTo(Category, { foreignKey: 'categoryId' });

// Seller hasMany Product (onDelete CASCADE) | Product belongsTo Seller
Seller.hasMany(Product, { foreignKey: 'sellerId', onDelete: 'CASCADE' });
Product.belongsTo(Seller, { foreignKey: 'sellerId' });

// Order hasMany OrderItem (onDelete CASCADE) | OrderItem belongsTo Order
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// OrderItem belongsTo Product and Seller
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Seller.hasMany(OrderItem, { foreignKey: 'sellerId' });
OrderItem.belongsTo(Seller, { foreignKey: 'sellerId' });

module.exports = {
  sequelize,
  City,
  Category,
  Seller,
  Product,
  Order,
  OrderItem,
};
