import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary configuration (run once)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBufferToCloudinary = async (buffer) => {
  if (!buffer) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null; // Return null if no file provided

    if (Buffer.isBuffer(file)) {
      return await uploadBufferToCloudinary(file);
    }

    const uploadResult = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    return uploadResult;
  } catch (error) {
    throw error;
  }
};

export default uploadOnCloudinary;