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
            createdAt: file.createdAt,
            starred: file.starred || false,
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
            createdAt: folder.createdAt,
            starred: folder.starred || false,
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

const getSharedItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await fileModels.findById(id);
        if (file) {
            return res.status(200).json({
                item: {
                    id: file._id,
                    name: file.name,
                    type: 'file',
                    size: file.size,
                    date: new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    starred: file.starred || false,
                    parentId: file.parentId,
                    url: file.dropzonefile
                },
                items: []
            });
        }

        const folder = await Folder.findById(id);
        if (!folder) {
            return res.status(404).json({ message: "Shared item not found" });
        }

        const files = await fileModels.find({ ownerId: folder.ownerId }).sort({ createdAt: -1 });
        const folders = await Folder.find({ ownerId: folder.ownerId }).sort({ createdAt: -1 });

        const formattedFiles = files.map(fileItem => ({
            id: fileItem._id,
            name: fileItem.name,
            type: 'file',
            size: fileItem.size,
            date: new Date(fileItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            starred: fileItem.starred || false,
            parentId: fileItem.parentId,
            url: fileItem.dropzonefile
        }));

        const formattedFolders = folders.map(folderItem => ({
            id: folderItem._id,
            name: folderItem.name,
            type: 'folder',
            size: '--',
            date: new Date(folderItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            starred: folderItem.starred || false,
            parentId: folderItem.parentId
        }));

        return res.status(200).json({
            item: {
                id: folder._id,
                name: folder.name,
                type: 'folder',
                size: '--',
                date: new Date(folder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                starred: folder.starred || false,
                parentId: folder.parentId
            },
            items: [...formattedFolders, ...formattedFiles]
        });
    } catch (error) {
        res.status(500).json({ message: "cannot get shared item", error: error.message });
    }
};

export default { getAllFiles, getFileByID, getSharedItemById };