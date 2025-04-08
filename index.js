const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();
const router = express.Router();

// Route Imports
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ DB Connection Successful"))
.catch((err) => console.error("❌ DB Connection Error:", err.message));

// ✅ Avatar Route

router.get("/avatar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://api.multiavatar.com/${id}`, {
      responseType: "text",
    });

    const svg = response.data;
    const base64Avatar = Buffer.from(svg).toString("base64");

    res.json({ avatar: base64Avatar });
  } catch (error) {
    console.error("❌ Error fetching avatar:", error.message);
    res.status(500).send("Error fetching avatar");
  }
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Default Route (Optional)
app.get("/", (req, res) => {
  res.send("✨ Welcome to the Chat App Backend!");
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
