import express from "express";
import { createUser } from "../controllers/userController.js";
import protect from "../middlewares/auth.js";

const UserRouter = express.Router();


UserRouter.post("/create", protect, createUser);

export default UserRouter;
