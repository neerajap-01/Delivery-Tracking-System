const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const validate = require('../utils/validation');

const createOrder = async (req, res) => {
  try {
    let userId = req.params.userId;

    //checking if cart exists
    let findCart = await Cart.findOne({ userId: userId });
    if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this '${userId}' user-ID` })

    //checking for an empty cart
    if(findCart.items.length == 0) return res.status(400).send({ status: false, message: "Cart is already empty" });

    let data = req.body;

    //checking for a valid user input
    if(validate.isValid(data)) return res.status(400).send({ status: false, message: 'Data is required to place your order' });

    //checking for valid cartId
    if(validate.isValid(data.cartId)) return res.status(400).send({ status: false, message: "CartId is required" })
    if(!validate.isValidObjectId(data.cartId)) return res.status(400).send({ status: false, message: "Enter a valid cart-ID" })

    //checking if cartId is same or not
    if(findCart._id.toString() !== data.cartId) return res.status(400).send({ status: false, message: 'CartId not matched' });

    //checking cancellable value is present
    if(data?.cancellable || typeof data.cancellable == 'string') {
      if(!data.cancellable) return res.status(400).send({ status: false, message: "Enter a valid value for is cancellable" })
      if(validate.isValid(data.cancellable)) return res.status(400).send({ status: false, message: "Enter a valid value for is cancellable" })
      if(typeof data.cancellable == 'string'){
        //converting it to lowercase and removing white spaces
        data.cancellable = data.cancellable.toLowerCase().trim();;
        if(data.cancellable == 'true' || data.cancellable == 'false') {
          //convert from string to boolean
          data.cancellable = JSON.parse(data.cancellable);
        }else {
          return res.status(400).send({ status: false, message: "Enter a valid value for cancellable" })
        }
      }
      if(typeof data.cancellable !== 'boolean') return res.status(400).send({ status: false, message: "Cancellable should be in boolean value" })
    }

    //checking if status is present in request body
    if(data?.status) {
      if(validate.isValid(data.status)) return res.status(400).send({ status: false, message: "Enter a valid value for is order status" });

      //validating if status is in valid format
      if(!(['Pending','Completed','Cancelled'].includes(data.status))) return res.status(400).send({ status: false, message: "Order status should be one of this 'Pending','Completed' and 'Cancelled'" });
    }

    //getting the totalQuantity of items in the cart
    data.totalQuantity = 0
    findCart.items.map(x => {
      data.totalQuantity += x.quantity
    })

    data.userId = userId;
    data.items = findCart.items;
    data.totalPrice = findCart.totalPrice;
    data.totalItems = findCart.totalItems;

    let resData = await Order.create(data);
    await Cart.updateOne(
      {_id: findCart._id},
      {items: [], totalPrice: 0, totalItems: 0}
    )
    res.status(201).send({ status: false, message: "Order placed successfully", data: resData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const updateOrder = async (req, res) => {
  try {
    let data = req.body;

    //checking for a valid user input
    if(validate.isValid(data)) return res.status(400).send({ status: false, message: 'Data is required to cancel your order' });

    //checking for valid orderId
    if(validate.isValid(data.orderId)) return res.status(400).send({ status: false, message: 'OrderId is required and should not be an empty string' });
    if(!validate.isValidObjectId(data.orderId)) return res.status(400).send({ status: false, message: 'Enter a valid order-Id' });

    //checking if cart exists or not
    let findOrder = await Order.findOne({ _id: data.orderId, isDeleted: false });
    if(!findOrder) return res.status(404).send({ status: false, message: `No order found with this '${data.orderId}' order-ID` })

    //checking if the order is cancellable or not
    if(!findOrder.cancellable) return res.status(400).send({ status: false, message: "You cannot cancel this order" });

    await Order.updateOne(
      {_id: findOrder._id},
      {status: 'Cancelled'}
    )
    res.status(200).send({ status: true, message: `Your order with this '${findOrder._id}' ID has been cancelled` });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const getOrder = async(req, res) => {
  try {
    let userId = req.params.userId;

    if(!validate.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Enter a valid user Id" })

    const findOrder = await Order.findOne({userId: userId})
    if(!findOrder) return res.status(404).send({ status: false, message: "No order found with this user-id" })

    return res.status(200).send({ status: true, message: "User's Order", data: findOrder })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}
module.exports = { createOrder, updateOrder, getOrder }