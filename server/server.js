import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookiesparser from "cookie-parser";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import UserRouter from "./routes/user.js";

dotenv.config();

connectDB(); // Connect to MongoDB
const app = express();
app.use(clerkMiddleware());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookiesparser());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/users", UserRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
