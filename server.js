const dotenv = require("dotenv");

// MUST be first
dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB =
  require("./config/db");

const authRoutes =
  require("./routes/authRoutes");

const productRoutes =
  require("./routes/productRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const app = express();

const PORT =
  process.env.PORT || 5000;


// Middleware
app.use(cors());

app.use(
  express.json()
);


// Auth
app.use(
  "/api/auth",
  authRoutes
);


// Products
app.use(
  "/api/products",
  productRoutes
);


// Orders
app.use(
  "/api/orders",
  orderRoutes
);


// Test
app.get(
  "/",
  (req, res) => {
    res.send(
      "MOM Backend is Running"
    );
  }
);


// Start
const startServer =
  async () => {
    try {
      await connectDB();

      app.listen(
        PORT,
        () => {
          console.log(
            `MOM Server running on port ${PORT}`
          );
        }
      );
    } catch (error) {
      console.log(
        "Server start error:",
        error.message
      );
    }
  };

startServer();