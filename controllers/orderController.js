const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod,
    } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        message:
          "Delivery address is required",
      });
    }

    const allowedPaymentMethods = [
      "cash_on_delivery",
      "mobile_banking",
    ];

    if (
      paymentMethod &&
      !allowedPaymentMethods.includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment method",
      });
    }

    const productIds = items.map(
      (item) => item.product
    );

    const invalidId =
      productIds.find(
        (id) =>
          !mongoose.Types.ObjectId.isValid(
            id
          )
      );

    if (invalidId) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const products =
      await Product.find({
        _id: {
          $in: productIds,
        },
      });

    if (
      products.length !==
      productIds.length
    ) {
      return res.status(400).json({
        message:
          "One or more products were not found",
      });
    }

    const safeItems = [];

    let productsSubtotal = 0;

    for (const item of items) {
      const product =
        products.find(
          (productItem) =>
            productItem._id.toString() ===
            item.product
        );

      if (!product) {
        return res.status(400).json({
          message:
            "Product not found",
        });
      }

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message:
            "Invalid product quantity",
        });
      }

      if (
        product.stock <
        quantity
      ) {
        return res.status(400).json({
          message: `${product.name} does not have enough stock`,
        });
      }

      safeItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });

      productsSubtotal +=
        product.price *
        quantity;
    }

    const deliveryFee = 60;

    const totalAmount =
      productsSubtotal +
      deliveryFee;

    const order =
      await Order.create({
        user: req.user._id,

        items: safeItems,

        totalAmount,

        deliveryAddress,

        paymentMethod:
          paymentMethod ||
          "cash_on_delivery",

        status: "pending",
      });

    for (const item of safeItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock:
              -item.quantity,
          },
        }
      );
    }

    return res.status(201).json({
      message:
        "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log(
      "Create order error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message:
        "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getOrderById = async (
  req,
  res
) => {
  try {
    const orderId =
      req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findById(
        orderId
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !==
      req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this order",
      });
    }

    return res.status(200).json({
      message:
        "Order fetched successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "user",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "All orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(
      "Get all orders error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { status } =
      req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    const updatedOrder =
      await Order.findById(id)
        .populate(
          "user",
          "name email phone"
        );

    return res.status(200).json({
      message:
        "Order status updated successfully",
      order:
        updatedOrder,
    });
  } catch (error) {
    console.log(
      "Update order status error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};