const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const resetPassword = async () => {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log(
        "Usage: node resetPassword.js your-email@gmail.com NEW_PASSWORD"
      );

      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log(
        "Password must be at least 6 characters."
      );

      process.exit(1);
    }

    await connectDB();

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      console.log("User not found ❌");

      await mongoose.connection.close();
      process.exit(1);
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    console.log(
      "Password reset successfully ✅"
    );

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.log(
      "Reset password error:",
      error.message
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

resetPassword();