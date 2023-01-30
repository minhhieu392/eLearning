import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const logSchema = new Schema({
  userId: {
    type: Number,
    required: true
  },
  message: {
    type: String
  },
  type: {
    type: Number
  },
  dataParam: {
    type: Object
  },
  dataQuery: {
    type: Object
  },
  dataBody: {
    type: Object
  },
  dataOutput: {
    type: Object
  },
  options: {
    type: Object
  },
  createDate: {
    type: Date,
    default: Date.now()
  }
})

const Log = mongoose.model('Log', logSchema, 'logs');

export default Log;
