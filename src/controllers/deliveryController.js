const Delivery = require('../models/deliveryModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel')
const validate = require('../utils/validation');

let timeFormate = new Date()
const month = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
let currentTime = `${timeFormate.getDate()} ${month[timeFormate.getMonth()]}, ${timeFormate.getFullYear()} ${formatAMPM(new Date)}`

const createDeliveryStatus = async (req,res) => {
  try {
    let orderId = req.params.orderId;

    //checking if user exists
    if(!validate.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Enter a valid order Id" })

    let checkOrderId = await Order.findById(orderId);
    if(!checkOrderId) return res.status(404).send({ status: false, message: `Enter a valid order-ID` });

    let data = req.body;
    data.orderId = orderId

    if(!validate.isValidObjectId(data.trackId)) return res.status(400).send({ status: false, message: 'Enter a valid ordered item Id'})

    let findItemId = await Order.findOne({_id: orderId, "items._id": data.trackId})

    if(!findItemId) return res.status(404).send({ status: false, message: "Ordered items id doesn't exist" })

    // if(typeof(data.deliveryStatus) == 'object'){
    //   if(validate.isValid(data.deliveryStatus.status)) return res.send({ status: false, message: "Delivery status of the product is required" })
    //   let checkStatus = ['Pending', 'Dispatched', 'On the way', 'Delivered']
    //   if(!checkStatus.includes(data.deliveryStatus.status)) return res.send({ status: false, message: "Status can only be pending, dispatched, on the way or delivered" })

    //   if(validate.isValid(data.deliveryStatus.place)) return res.send({ status: false, message: "Place is required were the is currently" })

    //   if(validate.isValid(data.deliveryStatus.toBeDeliveredTime)) return res.send({ status: false, message: "Time remaining to delivered the product field is required" })
    // }

    if(data.deliveryStatus.length > 0){
      if(validate.isValid(data.deliveryStatus[0].status)) return res.send({ status: false, message: "Delivery status of the product is required" })
      let checkStatus = ['Pending', 'Dispatched', 'On the way', 'Delivered']
      if(!checkStatus.includes(data.deliveryStatus[0].status)) return res.send({ status: false, message: "Status can only be pending, dispatched, on the way or delivered" })

      if(validate.isValid(data.deliveryStatus[0].place)) return res.send({ status: false, message: "Place is required were the is currently" })

      if(validate.isValid(data.deliveryStatus[0].toBeDeliveredTime)) return res.send({ status: false, message: "Time remaining to delivered the product field is required" })
    }
    
    data.deliveryStatus[0].time = currentTime;

    let createdProdDelivery = await Delivery.create(data)
    await Order.updateOne(
      {_id: orderId},
      {status: data.deliveryStatus[0].status},
      {new: true}
    )
    res.status(201).send({ status: true, message: 'Product delivery status have been created', data: createdProdDelivery })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const updateProductStatus = async (req, res) => {
  try {
    let orderId = req.params.orderId;

    //checking if user exists
    if(!validate.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Enter a valid order Id" })

    let checkOrderId = await Order.findById(orderId);
    if(!checkOrderId) return res.status(404).send({ status: false, message: `Enter a valid order-ID` });

    let data = req.body;
    data.orderId = orderId

    if(!validate.isValidObjectId(data.trackId)) return res.status(400).send({ status: false, message: 'Enter a valid ordered item Id'})

    let findItemId = await Order.findOne({_id: orderId, "items._id": data.trackId})
    if(!findItemId) return res.status(404).send({ status: false, message: "Ordered items id doesn't exist" })

    let checkDeliveryStatus = await Delivery.findOne({ trackId: data.trackId });
    if(checkDeliveryStatus.deliveryStatus[checkDeliveryStatus.deliveryStatus.length-1].status == 'Delivered') return res.status(400).send({ status: false, message: "Product has been delivered" })

    if(data.deliveryStatus.length > 0){
      if(validate.isValid(data.deliveryStatus[0].status)) return res.send({ status: false, message: "Delivery status of the product is required" })
      let checkStatus = ['Pending', 'Dispatched', 'On the way', 'Delivered']
      if(!checkStatus.includes(data.deliveryStatus[0].status)) return res.send({ status: false, message: "Status can only be pending, dispatched, on the way or delivered" })

      if(validate.isValid(data.deliveryStatus[0].place)) return res.send({ status: false, message: "Place is required were the is currently" })

      if(validate.isValid(data.deliveryStatus[0].toBeDeliveredTime)) return res.send({ status: false, message: "Time remaining to delivered the product field is required" })
    }
    
    data.deliveryStatus[0].time = currentTime;

    let updatedStatus = await Delivery.findOneAndUpdate(
      {orderId: orderId, trackId: data.trackId},
      {$push: {deliveryStatus: data.deliveryStatus}},
      {new: true}
    )
    await Order.updateOne(
      {_id: orderId},
      {status: data.deliveryStatus[0].status},
      {new: true}
    )
    res.status(200).send({ status: true, message: "Product delivery status has been updated", data: updatedStatus })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

const getDeliveryStatus = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;
    if(!validate.isValidObjectId(deliveryId)) return res.status(400).send({ status: false, message: "Enter a valid delivery Id" })

    const findProductStatus = await Delivery.findById(deliveryId)
    if(!findProductStatus) return res.status(404).send({ status: false, message: "No product delivery found with this delivery-id" })

    return res.status(200).send({ status: true, message: "Product's Delivery Status", data: findProductStatus })

  } catch (err) {
    return res.status(500).send({ status: false, error: err.message })
  }
}

module.exports = {createDeliveryStatus,updateProductStatus,getDeliveryStatus}