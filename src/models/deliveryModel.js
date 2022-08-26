const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: ObjectId,
    ref: 'Order',
    required: true
  },
  trackId: {
    type: ObjectId,
    required: true
  },
  deliveryStatus: [{
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Dispatched', 'On the way', 'Delivered'],
      required: true,
      trim: true
    },
    place: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true
    },
    toBeDeliveredTime: {
      type: String,
      required: true
    },
    _id: false
  }]
},{timestamps: true});

module.exports = mongoose.model('DeliveryStatus',deliverySchema)