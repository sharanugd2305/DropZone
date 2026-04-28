import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookiesparser from "cookie-parser";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import UserRouter from "./routes/user.js";
import fileRouter from "./routes/file.routes.js";
import getfileRouter from "./routes/getfile.js";
import folderRouter from "./routes/folder.routes.js";

dotenv.config();

await connectDB();

const app = express();

//  connect DB (safe for serverless)
//  IMPORTANT: CORS first
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

//  Handle preflight explicitly (VERY IMPORTANT)
app.options(/.*/, cors());

//  Middlewares
app.use(express.json());
app.use(cookiesparser());
app.use(clerkMiddleware());

//  Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/users", UserRouter);
app.use("/api/files", fileRouter);
app.use("/api", getfileRouter);
app.use("/api/folders", folderRouter);

//  REMOVE THIS (breaks Vercel)
// app.listen(PORT, () => {
//   console.log(`Server is running on port http://localhost:${PORT}`);
// });

//  EXPORT instead
export default app;