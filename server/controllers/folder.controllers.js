import Folder from "../models/folder.model.js";

// Create a new folder
export const createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        const newFolder = await Folder.create({
            name,
            ownerId: req.userId,
            parentId: parentId || null
        });

        res.status(201).json({ message: "Folder created successfully", folder: newFolder });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all folders for a user
export const getFolders = async (req, res) => {
    try {
        const folders = await Folder.find({ ownerId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.id;

        // Delete the folder and all its subfolders and files
        await Folder.deleteMany({ $or: [{ _id: folderId }, { parentId: folderId }] });

        // Also delete files in this folder and subfolders
        const fileModels = (await import("../models/file.models.js")).default;
        await fileModels.deleteMany({ parentId: folderId });

        res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};