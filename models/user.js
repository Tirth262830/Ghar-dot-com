const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
   email: {
      type: String,
      required: true,
      unique: true // Ensure email is unique in the database
   },
   // You can add more fields here if necessary, like `firstName`, `lastName`, etc.
});

// Adding passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, {
   usernameField: "email" // Use email as the username for login
});

module.exports = mongoose.model("User", userSchema);
