const express = require('express');
const { createUser, loginUser,  getUser, updateUserProfile } = require('../controllers/userController');
const { addProduct, getFilteredProduct, getProductsById, updateProductById, deleteProductById } = require('../controllers/productController');
const { addCart, updateCart, getCart, deleteCart } = require('../controllers/cartController');
const { createOrder, updateOrder, getOrder } = require('../controllers/orderController')
const { createDeliveryStatus, updateProductStatus, getDeliveryStatus } = require('../controllers/deliveryController');
const { authentication, authorization } = require('../middleware/auth');

const router = express.Router();

//User's API
router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/user/:userId/profile', authentication, authorization, getUser);
router.put('/user/:userId/profile', authentication, authorization, updateUserProfile);

//Product's API
router.post('/products', addProduct);
router.get('/products', getFilteredProduct);
router.get('/products/:productId', getProductsById);
router.put('/products/:productId', updateProductById);
router.delete('/products/:productId', deleteProductById);

//Cart's API
router.post('/users/:userId/cart', authentication, authorization, addCart);
router.put('/users/:userId/cart', authentication, authorization, updateCart);
router.get('/users/:userId/cart', authentication, authorization, getCart);
router.delete('/users/:userId/cart', authentication, authorization, deleteCart);

//Order's API
router.post('/users/:userId/orders', authentication, authorization, createOrder);
router.put('/users/:userId/orders', authentication, authorization, updateOrder);
router.get('/users/:userId/orders', authentication, authorization, getOrder);

//Track Order API
router.post('/order/:orderId', createDeliveryStatus)
router.put('/order/:orderId', updateProductStatus)
router.get('/order/:deliveryId', getDeliveryStatus)

module.exports = router