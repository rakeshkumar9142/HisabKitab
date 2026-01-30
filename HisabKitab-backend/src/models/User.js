
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: 
    { 
    type: String, 
    required: true 
  },
    phone: 
    { type: String,
      required: true, 
      unique: true 
    },
    password: 
    { 
      type: String, 
      required: true 
    },
    subscription: {
      plan: {
        type: String,
        default: "FREE"
      },
      expiresAt: {
        type: Date
      }
    }
    
  },
  { 
    timestamps: true 
  }

  

);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.matchPassword = function (entered) {

  return bcrypt.compare(entered, this.password);

};


module.exports = mongoose.model("User", userSchema);
