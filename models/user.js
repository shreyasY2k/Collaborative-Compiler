//user schema
const mongoose = require("mongoose");
//createa a schema for user
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
//create a model for user
const User = mongoose.model("User", userSchema);
//export the model
module.exports = User;
