import uploadOnCloudinary from "../config/cloudinary.js";

export const uploadfile = async (req, res) => {
  try {
    let dropzonefile =  null;

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

    return res.status(200).json({ message: "uploaded successfully"});
  } catch (error) {
    console.error("updatefile error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
};