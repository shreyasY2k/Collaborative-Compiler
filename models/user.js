const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);
module.exports = User;
