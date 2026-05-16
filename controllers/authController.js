const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Seller } = require('../models');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Seller Register
const registerSeller = async (req, res, next) => {
  try {
    const { shopName, ownerName, cityId, categoryId, password, email, phone } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const seller = await Seller.create({
      shopName,
      ownerName,
      cityId,
      categoryId,
      passwordHash,
      email,
      phone,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: { id: seller.id, shopName: seller.shopName, status: seller.status },
      message: 'Registration successful. Pending admin approval.',
    });
  } catch (error) {
    next(error);
  }
};

// Seller Login
const loginSeller = async (req, res, next) => {
  try {
    const { shopName, password } = req.body;

    const seller = await Seller.findOne({ where: { shopName } });

    if (seller && (await bcrypt.compare(password, seller.passwordHash))) {
      if (seller.status !== 'active') {
        res.status(403);
        throw new Error(`Your account status is: ${seller.status}. Contact Admin.`);
      }

      res.status(200).json({
        success: true,
        data: {
          id: seller.id,
          shopName: seller.shopName,
          token: generateToken(seller.id, 'seller'),
        },
        message: 'Login successful',
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

// Admin Login
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      res.status(200).json({
        success: true,
        data: {
          username: 'admin',
          token: generateToken('admin', 'admin'),
        },
        message: 'Admin login successful',
      });
    } else {
      res.status(401);
      throw new Error('Invalid Admin Credentials');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerSeller, loginSeller, loginAdmin };
