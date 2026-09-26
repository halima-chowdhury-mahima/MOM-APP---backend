const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require(
  "../controllers/authController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const User =
  require("../models/User");

const router =
  express.Router();


// Register
router.post(
  "/register",
  registerUser
);


// Login
router.post(
  "/login",
  loginUser
);


// Forgot password
router.post(
  "/forgot-password",
  forgotPassword
);


// Verify OTP
router.post(
  "/verify-reset-otp",
  verifyResetOtp
);


// Reset password
router.post(
  "/reset-password",
  resetPassword
);


// Profile
router.get(
  "/profile",
  protect,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user._id
        ).select(
          "-password -resetOtp"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      return res.status(200).json({
        user,
      });
    } catch (error) {
      console.log(
        "Profile error:",
        error.message
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;