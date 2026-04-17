import fileModels from "../models/file.models.js";
export const deleteFileByID = async (req,res) =>{
  try {
    const deletedfile = await fileModels.findByIdAndDelete(req.params.id);
    if(!deletedfile){
      return res.status(404).json({message: "file not found"});
    }
    res.status(200).json({message: "file deleted successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}