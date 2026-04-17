import express from "express";
import { createFolder, getFolders, deleteFolder } from "../controllers/folder.controllers.js";
import protect from "../middlewares/auth.js";

const folderRouter = express.Router();

folderRouter.use(protect); // Apply auth middleware to all folder routes
folderRouter.post("/create", createFolder);
folderRouter.get("/", getFolders);
folderRouter.delete("/:id", deleteFolder);

export default folderRouter;