import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  coverImage: {
    type: String, // cloudinary url
  },
  password: {
    type: String,
    required: [true, "Passwrod is required"]
  },
  refreshToken: {
    type: String
  },
}, {
  timestamps: true
})


export const User = mongoose.model("User", userSchema)