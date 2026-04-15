import express from "express";
import getfile from "../controllers/getfile.controllers.js";
const getfileRouter = express.Router();
getfileRouter.get("/files", getfile.getAllFiles);
getfileRouter.get("/files/:id", getfile.getFileByID);
export default getfileRouter;
