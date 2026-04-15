import express from "express";
import { uploadfile } from "../controllers/upload.controllers.js";
import { deleteFileByID } from "../controllers/delete.controllers.js";
const fileRouter = express.Router();
fileRouter.post("/upload", uploadfile);
fileRouter.delete("/delete/:id", deleteFileByID);
export default fileRouter;