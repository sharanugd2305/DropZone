import express from "express";
import getfileControllers from "../controllers/getfilecontrollers.js";
import protect from "../middlewares/auth.js";

const getfileRouter = express.Router();

getfileRouter.get("/share/:id", getfileControllers.getSharedItemById);

getfileRouter.use(protect); // Apply auth middleware to all get routes
getfileRouter.get("/files", getfileControllers.getAllFiles);
getfileRouter.get("/files/:id", getfileControllers.getFileByID);

export default getfileRouter;
