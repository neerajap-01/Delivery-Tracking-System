const Cart = require("../models/cartModel");
const Product = require('../models/productModel');
const validate = require('../utils/validation');

const addCart = async (req, res) => {
  try {
    let userId = req.params.userId;
    let data = req.body;

    //checking for a valid user input
    if(validate.isValid(data)) return res.status(400).send({ status: false, message: "Details is required to add products in your cart" });

    if(data?.totalPrice || data?.totalItems) return res.status(400).send({ status: false, message: "Cannot change or update total price or total items value" })

    data.userId = userId;

    //checking if userId exist or not
    let checkCart = await Cart.findOne({ userId: userId });
    if(!checkCart) {

      //checking for items in data
      if(data.items.length == 0) return res.status(400).send({ status: false, message: "Product's quantity should be at least 1" });

      //validating items in data
      for(let i = 0; i < data.items.length; i++){
        if(!validate.isValidObjectId(data.items[i].productId)) return res.status(400).send({ status: false, message: `Product-Id for ${i+1} product is invalid` });

        //checking if product exist and not been deleted
        let checkProduct = await Product.findOne({_id: data.items[i].productId, isDeleted: false});
        if(!checkProduct) return res.status(404).send({ status: false, message: `Product-Id for ${i+1} product doesn't exist` });
        
        //validating the quantity of product
        if(validate.isValid(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Enter a valid value for quantity" });
        if(!validate.isValidNum(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Quantity of product should be in numbers" })
        
        if(data.totalPrice == undefined) {
          data.totalPrice = 0;
        }
        data.totalPrice += checkProduct.price * Number(data.items[i].quantity);
      }
      data.totalItems = data.items.length;
      await Cart.create(data);
      let resData = await Cart.findOne({ userId }).populate('items.productId')
      return res.status(201).send({ status: true, message: "Products added to the cart", data: resData })
    }

    if(!validate.isValidObjectId(data.cartId)) return res.status(400).send({ status: false, message: "Cart-Id is required and should be valid" })

    if(checkCart._id.toString() !== data.cartId) return res.status(400).send({ status: false, message: "CartId not matched" });

    //checking for items in data
    if(data.items.length == 0) return res.status(400).send({ status: false, message: "Product's quantity should be at least 1" });
    let tempCart = checkCart;
    //validating items in data
    for(let i = 0; i < data.items.length; i++){
      if(!validate.isValidObjectId(data.items[i].productId)) return res.status(400).send({ status: false, message: `Product-Id for ${i+1} product is invalid` });

      //checking if product exist and not been deleted
      let checkProduct = await Product.findOne({_id: data.items[i].productId, isDeleted: false});
      if(!checkProduct) return res.status(404).send({ status: false, message: `Product-Id for ${i+1} product doesn't exist` });

      //validating the quantity of product
      if(validate.isValid(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Enter a valid value for quantity" });
      if(!validate.isValidNum(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Quantity of product should be in numbers" });

      //check if productId already exist in database or not
      tempCart.items.map(x => {
        if(x.productId.toString() == data.items[i].productId) {
          x.quantity += Number(data.items[i].quantity);
          tempCart.totalPrice += checkProduct.price * Number(data.items[i].quantity)
        }
      })    
      
      //check for the product that doesn't exist in the items
      let checkProductId = await Cart.findOne({_id: data.cartId, 'items.productId': {$in: [data.items[i].productId]}})
      if(!checkProductId) {
        tempCart.items.push(data.items[i]);
        tempCart.totalPrice += checkProduct.price * Number(data.items[i].quantity)
      }
    }
    tempCart.totalPrice = tempCart.totalPrice.toFixed(2);
    tempCart.totalItems = tempCart.items.length

    let updateCart = await Cart.findByIdAndUpdate(
      {_id: data.cartId},
      tempCart,
      {new: true}
    ).populate('items.productId')
    res.status(200).send({ status: true, message: "Products added to the cart", data: updateCart })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const updateCart = async (req, res) => {
  try {
    let userId = req.params.userId;

    //checking for a valid user input
    let findCart = await Cart.findOne({ userId: userId });
    if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this '${userId}' userId` });

    //checking is cart is empty or not
    if(findCart.items.length == 0) return res.status(400).send({ status: false, message: "Cart is already empty" });

    let data = req.body;

    //checking for a valid user input
    if(validate.isValid(data)) return res.status(400).send({ status: false, message: "Details is required to remove products from your cart" });

    //restrict user from updating totalPrice or totalItems
    if(data?.totalPrice || data?.totalItems) return res.status(400).send({ status: false, message: "Cannot change or update total price or total items value" });
    
    //checking if cartId is valid or not
    if(validate.isValid(data.cartId)) return res.status(400).send({ status: false, message: "CartId is required" });
    if(!validate.isValidObjectId(data.cartId)) return res.status(400).send({ status: false, message: "CartId should be valid" });
    if(findCart._id.toString() !== data.cartId) return res.status(400).send({ status: false, message: "CartId not matched" });

     //checking if productId is valid or not
    if(validate.isValid(data.productId)) return res.status(400).send({ status: false, message: "ProductId is required" });
    if(!validate.isValidObjectId(data.productId)) return res.status(400).send({ status: false, message: "ProductId should be valid" });
    
    //checking if productId exist or not in Product Collection
    let checkProduct = await Product.findById({ _id: data.productId });
    if(!checkProduct) return res.status(404).send({ status: false, message: `No product found with this '${data.productId}' productId` }); 

    //checking if productId exist or not in Cart Collection
    let checkProductId = await Cart.findOne({ _id: data.cartId, 'items.productId': {$in: [data.productId]} });
    if(!checkProductId) return res.status(404).send({ status: false, message: `No product found in the cart with this '${data.productId}' productId` }); 

    //checking for valid removeProduct value
    if(data.removeProduct == undefined) return res.status(400).send({ status: false, message: "removeProduct is required" });
    
    if(!(/0|1/.test(data.removeProduct))) return res.status(400).send({ status: false, message: "removeProduct should be 0 or 1 in numbers" });

    //copy the cart from database
    let tempCart = findCart;

    //removing product from cart
    tempCart.items.map(x => {
      let getIndex = tempCart.items.indexOf(x);
      if(x.productId.toString() == data.productId) {
        if(data.removeProduct == 0) {
          
          tempCart.items.splice(getIndex, 1);
          tempCart.totalPrice = 0
        }else if(data.removeProduct == 1) {
          x.quantity -= 1
          tempCart.totalPrice = 0
        }
      }

      if(x.quantity == 0) {
        tempCart.items.splice(getIndex, 1);
        tempCart.totalPrice = 0
      }      
    })

    //updating totalPrice and totalItems
    if(tempCart.items.length !== 0){
      for(let i = 0; i < tempCart.items.length; i++){
        let getProductPrice = await Product.findById({ _id: tempCart.items[i].productId })
        tempCart.totalPrice += getProductPrice.price * tempCart.items[i].quantity;
      }
      tempCart.totalPrice = tempCart.totalPrice.toFixed(2);
      tempCart.totalItems = tempCart.items.length;
    }else if(tempCart.items.length == 0) {
      tempCart.items = [];
      tempCart.totalItems = 0;
      tempCart.totalPrice = 0;
    }
  
    let getUpdatedCart = await Cart.findByIdAndUpdate(
      {_id: data.cartId},
      tempCart,
      {new: true}
    )

    res.status(200).send({ status: true, message: "Cart Updated Successfully", data: getUpdatedCart });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

const getCart = async (req, res) =>{
  try {
    let userId = req.params.userId;

    //checking if the cart exist with this userId or not
    let findCart = await Cart.findOne({ userId: userId }).populate('items.productId');
    if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

    res.status(200).send({ status: true, message: "Cart Details", data: findCart })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const deleteCart = async (req, res) =>{
  try {
    let userId = req.params.userId;

    //checking if the cart exist with this userId or not
    let findCart = await Cart.findOne({ userId: userId });
    if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

    //checking for an empty cart
    if(findCart.items.length == 0) return res.status(400).send({ status: false, message: "Cart is already empty" });

    let delCart = await Cart.findByIdAndUpdate(
      {_id: findCart._id},
      {items: [], totalPrice: 0, totalItems: 0},
      {new: true}
    )

    res.status(200).send({ status: true, message: "Products removed successfully", data: delCart })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

module.exports = { addCart, updateCart, getCart, deleteCart }