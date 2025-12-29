const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Contact = require("./models/Contact");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb+srv://admin:admin1234@vishwakarmaauto.53vsqjh.mongodb.net/?appName=Vishwakarmaauto")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.post("/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.json({ message: "Contact saved" });
  } catch (error) {
    res.status(500).json({ message: "Error saving contact" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend + Database connected");
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
