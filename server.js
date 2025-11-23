import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import unitRoutes from "./routes/unitRoute.js"
import barangRoutes from "./routes/barangRoute.js"
import menuRoutes from "./routes/menuRoute.js"
import distribusiRoutes from "./routes/distribusiRoute.js"
import stokOpnameRoutes from "./routes/stokOpnameRoute.js"
import purchaseRoutes from "./routes/purchaseRoute.js"

const envFile = process.env.NODE_ENV === 'development' ? '.env.dev' : '.env';
dotenv.config({ path: envFile, override: true });

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL], // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you use cookies or auth headers
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/unit", unitRoutes);
app.use("/api/barang", barangRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/distribusi", distribusiRoutes);
app.use("/api/inventory", stokOpnameRoutes);
app.use("/api/purchase", purchaseRoutes);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
