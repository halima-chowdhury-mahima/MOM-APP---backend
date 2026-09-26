const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const Product = require("./models/Product");

dotenv.config();

const products = [
  // Grocery
  {
    name: "Premium Rice",
    price: 80,
    category: "grocery",
    emoji: "🍚",
    description: "Premium quality rice for everyday meals.",
    stock: 100,
  },
  {
    name: "Fresh Milk",
    price: 100,
    category: "grocery",
    emoji: "🥛",
    description: "Fresh and nutritious milk.",
    stock: 100,
  },
  {
    name: "Farm Eggs",
    price: 150,
    category: "grocery",
    emoji: "🥚",
    description: "Fresh farm eggs.",
    stock: 100,
  },
  {
    name: "Fresh Apples",
    price: 220,
    category: "grocery",
    emoji: "🍎",
    description: "Fresh and juicy apples.",
    stock: 100,
  },
  {
    name: "Potatoes",
    price: 60,
    category: "grocery",
    emoji: "🥔",
    description: "Fresh potatoes for daily cooking.",
    stock: 100,
  },
  {
    name: "Fresh Bread",
    price: 70,
    category: "grocery",
    emoji: "🍞",
    description: "Soft and fresh bread.",
    stock: 100,
  },

  // Skincare
  {
    name: "Gentle Cleanser",
    price: 450,
    category: "skincare",
    emoji: "🫧",
    description: "Gentle cleanser for daily skincare.",
    stock: 100,
  },
  {
    name: "Sunscreen SPF 50",
    price: 650,
    category: "skincare",
    emoji: "☀️",
    description: "SPF 50 sunscreen for daily protection.",
    stock: 100,
  },
  {
    name: "Vitamin C Serum",
    price: 850,
    category: "skincare",
    emoji: "💧",
    description: "Vitamin C serum for bright-looking skin.",
    stock: 100,
  },
  {
    name: "Moisturizer",
    price: 550,
    category: "skincare",
    emoji: "🧴",
    description: "Daily moisturizer for hydrated skin.",
    stock: 100,
  },
  {
    name: "Face Wash",
    price: 350,
    category: "skincare",
    emoji: "🧼",
    description: "Refreshing face wash for everyday use.",
    stock: 100,
  },
  {
    name: "Lip Balm",
    price: 220,
    category: "skincare",
    emoji: "💄",
    description: "Moisturizing lip balm.",
    stock: 100,
  },

  // Health
  {
    name: "Paracetamol",
    price: 25,
    category: "health",
    emoji: "💊",
    description: "General pain and fever relief medicine.",
    stock: 100,
  },
  {
    name: "First Aid Kit",
    price: 450,
    category: "health",
    emoji: "🩹",
    description: "Basic first aid essentials.",
    stock: 100,
  },
  {
    name: "Thermometer",
    price: 350,
    category: "health",
    emoji: "🌡️",
    description: "Digital thermometer for temperature checking.",
    stock: 100,
  },
  {
    name: "Hand Sanitizer",
    price: 120,
    category: "health",
    emoji: "🧴",
    description: "Hand sanitizer for everyday hygiene.",
    stock: 100,
  },
  {
    name: "Face Mask",
    price: 150,
    category: "health",
    emoji: "😷",
    description: "Protective face mask.",
    stock: 100,
  },
  {
    name: "Vitamin C",
    price: 300,
    category: "health",
    emoji: "🍊",
    description: "Vitamin C supplement.",
    stock: 100,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log("Products seeded successfully ✅");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log("Product seed error:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();