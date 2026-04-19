import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: String, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    starred: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Folder", folderSchema);