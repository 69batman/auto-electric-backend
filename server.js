require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Contact = require("./models/Contact");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL, {
    dbName: "autoElectric",
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Backend + Database connected");
});

// ✅ CONTACT (booking)
app.post("/contact", async (req, res) => {
  console.log("📩 CONTACT BODY:", req.body);

  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json({ message: "Contact saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving contact" });
  }
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  console.log("🟢 REGISTER BODY:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ✅ LOGIN (ONLY ONCE)
app.post("/login", async (req, res) => {
  console.log("🔵 LOGIN BODY:", req.body);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ PORT (Render-safe)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
