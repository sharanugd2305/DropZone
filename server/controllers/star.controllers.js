import fileModels from "../models/file.models.js";
import Folder from "../models/folder.model.js";

export const toggleStarredItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { starred } = req.body;

    if (!["file", "folder"].includes(type)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    if (typeof starred !== "boolean") {
      return res.status(400).json({ message: "starred must be a boolean" });
    }

    const Model = type === "file" ? fileModels : Folder;
    const updatedItem = await Model.findOneAndUpdate(
      { _id: id, ownerId: req.userId },
      { starred },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Star updated successfully",
      item: {
        id: updatedItem._id,
        type,
        starred: updatedItem.starred,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
