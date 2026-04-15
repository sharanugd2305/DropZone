import mongoose from "mongoose";
const fileSchema = new mongoose.Schema({
    dropzonefile: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
    createdAt: { type: Date, default: Date.now },

});
export default mongoose.model("File", fileSchema); 