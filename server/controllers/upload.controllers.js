import uploadOnCloudinary from "../config/cloudinary.js";
import fileModels from "../models/file.models.js";
import fs from "fs/promises";

export const uploadfile = async (req, res) => {
  try {
    let dropzonefile = null;
    const { parentId } = req.body; // Get folder ID from request body
    const normalizedParentId = parentId || null;

    if (req.file) {
      const existingFile = await fileModels.findOne({
        ownerId: req.userId,
        parentId: normalizedParentId,
        name: req.file.originalname,
      });

      if (existingFile) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(409).json({ error: "A file with the same name already exists in this folder" });
      }
    }

    // If a file is uploaded, upload it to Cloudinary and use the returned secure URL
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result || !result.secure_url) {
        throw new Error("Cloudinary upload failed");
      }
      dropzonefile = result.secure_url;
    }

    if (!dropzonefile) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Save file metadata to database
    const newFile = await fileModels.create({
      dropzonefile: dropzonefile,
      ownerId: req.userId,
      parentId: normalizedParentId,
      name: req.file.originalname,
      size: (req.file.size / (1024 * 1024)).toFixed(1) + ' MB'
    });

    return res.status(200).json({ message: "uploaded successfully", file: newFile });
  } catch (error) {
    console.error("updatefile error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
};