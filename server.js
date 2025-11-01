import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";

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

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
