import fileModels from "../models.js/file.models";

const getAllFiles = async (req, res) => {
    try{
        const getfiles = await fileModels.find({ ownerId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: "cannot get the files", error: error.message });
    }

}

const getFileByID = async (req, res) => {
    try {
        const getfile = await fileModels.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: "cannot get the files", error: error.message });
        
    }
}