import mongoose from "mongoose";
const fileSchema = new mongoose.Schema({
    dropzonefile: { type: String, required: true },
    ownerId: { type: String, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    name: { type: String, required: true },
    size: { type: String },
    starred: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("File", fileSchema); 