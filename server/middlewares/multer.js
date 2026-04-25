import multer from "multer";

// ✅ Use memory storage (IMPORTANT for Vercel)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;