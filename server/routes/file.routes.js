import express from "express";
import { uploadfile } from "../controllers/upload.controllers.js";
import { deleteFileByID } from "../controllers/delete.controllers.js";
import { deleteFolder } from "../controllers/folder.controllers.js";
import upload from "../middlewares/multer.js";
import protect from "../middlewares/auth.js";

const fileRouter = express.Router();

fileRouter.use(protect); // Apply auth middleware to all file routes
fileRouter.post("/upload", upload.single("file"), uploadfile);
fileRouter.delete("/delete/:id", deleteFileByID);
fileRouter.delete("/folder/:id", deleteFolder);

export default fileRouter;