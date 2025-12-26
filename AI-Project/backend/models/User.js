const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
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
    role: {
      type: String,
      enum: ["mother", "professional"],
      default: "mother",
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },
    isVerified: {
    type: Boolean,
    default: false 
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  }
  },
  { timestamps: true,
    collection: 'MamaMindSense'
   }
);

module.exports = mongoose.model("User", UserSchema);
