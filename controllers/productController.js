const Product = require("../models/Product");


// =======================================
// GET ALL PRODUCTS
// =======================================
const getProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find({
        isActive: true,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      products,
    });
  } catch (error) {
    console.log(
      "Get products error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load products",
    });
  }
};


// =======================================
// GET SINGLE PRODUCT
// =======================================
const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.log(
      "Get product error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not load product",
    });
  }
};


// =======================================
// CREATE PRODUCT
// ADMIN ONLY
// =======================================
const createProduct = async (
  req,
  res
) => {
  try {
    const {
      name,
      brand,
      price,
      oldPrice,
      category,
      subcategory,
      image,
      emoji,
      description,
      stock,
      rating,
      reviewCount,
      featured,
      isActive,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Name, price and category are required",
      });
    }

    const allowedCategories = [
      "grocery",
      "skincare",
      "health",
      "fashion",
    ];

    if (
      !allowedCategories.includes(
        category
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid category",
      });
    }

    const product =
      await Product.create({
        name: name.trim(),

        brand:
          brand?.trim() || "",

        price:
          Number(price),

        oldPrice:
          oldPrice
            ? Number(oldPrice)
            : 0,

        category,

        subcategory:
          subcategory?.trim() || "",

        image:
          image?.trim() || "",

        emoji:
          emoji || "",

        description:
          description?.trim() || "",

        stock:
          stock !== undefined
            ? Number(stock)
            : 0,

        rating:
          rating !== undefined
            ? Number(rating)
            : 0,

        reviewCount:
          reviewCount !== undefined
            ? Number(reviewCount)
            : 0,

        featured:
          Boolean(featured),

        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      });

    return res.status(201).json({
      message:
        "Product created successfully",
      product,
    });
  } catch (error) {
    console.log(
      "Create product error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not create product",
    });
  }
};


// =======================================
// UPDATE PRODUCT
// ADMIN ONLY
// =======================================
const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const {
      name,
      brand,
      price,
      oldPrice,
      category,
      subcategory,
      image,
      emoji,
      description,
      stock,
      rating,
      reviewCount,
      featured,
      isActive,
    } = req.body;

    if (
      category &&
      ![
        "grocery",
        "skincare",
        "health",
        "fashion",
      ].includes(category)
    ) {
      return res.status(400).json({
        message:
          "Invalid category",
      });
    }

    if (name !== undefined) {
      product.name =
        name.trim();
    }

    if (brand !== undefined) {
      product.brand =
        brand.trim();
    }

    if (price !== undefined) {
      product.price =
        Number(price);
    }

    if (
      oldPrice !== undefined
    ) {
      product.oldPrice =
        Number(oldPrice);
    }

    if (
      category !== undefined
    ) {
      product.category =
        category;
    }

    if (
      subcategory !== undefined
    ) {
      product.subcategory =
        subcategory.trim();
    }

    if (image !== undefined) {
      product.image =
        image.trim();
    }

    if (emoji !== undefined) {
      product.emoji =
        emoji;
    }

    if (
      description !== undefined
    ) {
      product.description =
        description.trim();
    }

    if (stock !== undefined) {
      product.stock =
        Number(stock);
    }

    if (rating !== undefined) {
      product.rating =
        Number(rating);
    }

    if (
      reviewCount !== undefined
    ) {
      product.reviewCount =
        Number(reviewCount);
    }

    if (
      featured !== undefined
    ) {
      product.featured =
        Boolean(featured);
    }

    if (
      isActive !== undefined
    ) {
      product.isActive =
        Boolean(isActive);
    }

    await product.save();

    return res.status(200).json({
      message:
        "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log(
      "Update product error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not update product",
    });
  }
};


// =======================================
// DELETE PRODUCT
// ADMIN ONLY
// =======================================
const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.log(
      "Delete product error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Could not delete product",
    });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};