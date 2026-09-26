const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail =
  require("../utils/sendEmail");


// ========================================
// CREATE JWT TOKEN
// ========================================
const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ========================================
// REGISTER
// ========================================
const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password:
          hashedPassword,
        phone:
          phone?.trim() || "",
      });

    const token =
      createToken(user);

    return res.status(201).json({
      message:
        "Registration successful",

      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(
      "Register error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ========================================
// LOGIN
// ========================================
const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    console.log(
      "Login email:",
      normalizedEmail
    );

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    console.log(
      "User found:",
      !!user
    );

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "Password match:",
      passwordMatch
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token =
      createToken(user);

    return res.status(200).json({
      message:
        "Login successful",

      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ========================================
// FORGOT PASSWORD
// SEND OTP
// ========================================
const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } =
      req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    // Do not reveal whether account exists
    if (!user) {
      return res.status(200).json({
        message:
          "If this email is registered, a reset code has been sent.",
      });
    }

    const otp =
      crypto
        .randomInt(
          100000,
          1000000
        )
        .toString();

    const hashedOtp =
      await bcrypt.hash(
        otp,
        10
      );

    user.resetOtp =
      hashedOtp;

    user.resetOtpExpire =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    user.resetOtpVerified =
      false;

    await user.save();

    try {
      console.log(
        "Sending reset email to:",
        user.email
      );

      await sendEmail({
        to: user.email,

        subject:
          "MOM Password Reset Code",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 500px;
              margin: auto;
              padding: 24px;
            "
          >
            <h2>
              MOM Password Reset
            </h2>

            <p>
              Your password reset code is:
            </p>

            <h1
              style="
                letter-spacing: 8px;
              "
            >
              ${otp}
            </h1>

            <p>
              This code will expire
              in 10 minutes.
            </p>

            <p>
              If you did not request
              this reset, ignore this
              email.
            </p>
          </div>
        `,
      });

      console.log(
        "Reset email sent successfully ✅"
      );

      return res.status(200).json({
        message:
          "Reset code sent successfully",
      });
    } catch (emailError) {
      console.log(
        "Email error:",
        emailError.message
      );

      console.log(
        "Email error code:",
        emailError.code
      );

      user.resetOtp = null;
      user.resetOtpExpire =
        null;
      user.resetOtpVerified =
        false;

      await user.save();

      return res.status(500).json({
        message:
          "Could not send reset email",
      });
    }
  } catch (error) {
    console.log(
      "Forgot password error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ========================================
// VERIFY OTP
// ========================================
const verifyResetOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (
      !email ||
      !otp
    ) {
      return res.status(400).json({
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (
      !user ||
      !user.resetOtp ||
      !user.resetOtpExpire
    ) {
      return res.status(400).json({
        message:
          "Invalid or expired OTP",
      });
    }

    if (
      Date.now() >
      new Date(
        user.resetOtpExpire
      ).getTime()
    ) {
      user.resetOtp = null;
      user.resetOtpExpire =
        null;
      user.resetOtpVerified =
        false;

      await user.save();

      return res.status(400).json({
        message:
          "OTP has expired",
      });
    }

    const otpMatch =
      await bcrypt.compare(
        otp.toString().trim(),
        user.resetOtp
      );

    if (!otpMatch) {
      return res.status(400).json({
        message:
          "Invalid OTP",
      });
    }

    user.resetOtpVerified =
      true;

    await user.save();

    console.log(
      "OTP verified ✅",
      user.email
    );

    return res.status(200).json({
      message:
        "OTP verified successfully",
    });
  } catch (error) {
    console.log(
      "Verify OTP error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ========================================
// RESET PASSWORD
// ========================================
const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required",
      });
    }

    if (
      newPassword.length <
      6
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid reset request",
      });
    }

    if (
      !user.resetOtp ||
      !user.resetOtpExpire ||
      !user.resetOtpVerified
    ) {
      return res.status(400).json({
        message:
          "Please verify OTP first",
      });
    }

    if (
      Date.now() >
      new Date(
        user.resetOtpExpire
      ).getTime()
    ) {
      user.resetOtp = null;
      user.resetOtpExpire =
        null;
      user.resetOtpVerified =
        false;

      await user.save();

      return res.status(400).json({
        message:
          "OTP has expired",
      });
    }

    const otpMatch =
      await bcrypt.compare(
        otp.toString().trim(),
        user.resetOtp
      );

    if (!otpMatch) {
      return res.status(400).json({
        message:
          "Invalid OTP",
      });
    }

    // Password hash ONLY ONCE
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    user.resetOtp = null;
    user.resetOtpExpire =
      null;
    user.resetOtpVerified =
      false;

    await user.save();

    console.log(
      "Password reset successfully ✅",
      user.email
    );

    // Verify saved hash
    const verifyNewPassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    console.log(
      "New password saved correctly:",
      verifyNewPassword
    );

    return res.status(200).json({
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.log(
      "Reset password error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};