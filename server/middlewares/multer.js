import multer from "multer";
// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'./public'); // Set destination folder for uploads
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname); // Use original file name
    }
});

const upload = multer({storage}); // Create multer instance with defined storage

export default upload;