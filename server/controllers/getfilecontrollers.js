import fileModels from "../models/file.models.js";
import Folder from "../models/folder.model.js";

const getAllFiles = async (req, res) => {
    try{
        const files = await fileModels.find({ ownerId: req.userId }).sort({ createdAt: -1 });
        const folders = await Folder.find({ ownerId: req.userId }).sort({ createdAt: -1 });

        // Format files
        const formattedFiles = files.map(file => ({
            id: file._id,
            name: file.name,
            type: 'file',
            size: file.size,
            date: new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            parentId: file.parentId,
            url: file.dropzonefile
        }));

        // Format folders
        const formattedFolders = folders.map(folder => ({
            id: folder._id,
            name: folder.name,
            type: 'folder',
            size: '--',
            date: new Date(folder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            parentId: folder.parentId
        }));

        const allItems = [...formattedFolders, ...formattedFiles];
        res.status(200).json(allItems);
    } catch (error) {
        res.status(500).json({ message: "cannot get the files", error: error.message });
    }
};

const getFileByID = async (req, res) => {
    try {
        const file = await fileModels.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: "cannot get the files", error: error.message });

    }
};

export default { getAllFiles, getFileByID };