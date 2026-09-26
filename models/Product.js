const mongoose = require("mongoose");

const productSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      brand: {
        type: String,
        default: "",
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      oldPrice: {
        type: Number,
        default: 0,
        min: 0,
      },

      category: {
        type: String,
        required: true,
        enum: [
          "grocery",
          "skincare",
          "health",
          "fashion",
        ],
      },

      subcategory: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },

      emoji: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      stock: {
        type: Number,
        default: 0,
        min: 0,
      },

      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      reviewCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      featured: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

const Product =
  mongoose.model(
    "Product",
    productSchema
  );

module.exports = Product;