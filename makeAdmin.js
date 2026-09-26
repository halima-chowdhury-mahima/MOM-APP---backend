const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB =
  require("./config/db");

const User =
  require("./models/User");

dotenv.config();

const makeAdmin =
  async () => {
    try {
      const email =
        process.argv[2];

      if (!email) {
        console.log(
          "Please provide an email."
        );

        console.log(
          "Example: node makeAdmin.js test@example.com"
        );

        process.exit(1);
      }

      await connectDB();

      const user =
        await User.findOne({
          email:
            email
              .trim()
              .toLowerCase(),
        });

      if (!user) {
        console.log(
          "User not found ❌"
        );

        await mongoose.connection.close();

        process.exit(1);
      }

      user.role = "admin";

      await user.save();

      console.log(
        `${user.email} is now an admin ✅`
      );

      await mongoose.connection.close();

      process.exit(0);
    } catch (error) {
      console.log(
        "Make admin error:",
        error.message
      );

      await mongoose.connection.close();

      process.exit(1);
    }
  };

makeAdmin();