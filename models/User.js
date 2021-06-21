const mongoose = require("mongoose");
const PointSchema =  new mongoose.Schema({ //sub-document
  type:{type:String,default:'Point'},
  coordinates:{type:[Number],index:'2dsphere'}
})
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date:{
      type: Date,
      default: Date.now
  },
  geometry:PointSchema
  //isAdmin: Boolean

});

module.exports = User = mongoose.model('user',UserSchema);

