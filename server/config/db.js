import mongoose from "mongoose";
// Function to connect to MongoDB
const connectDB = async() =>{
       try{
        await mongoose.connect(process.env.MONGODB_URL) // Connect to MongoDB using URL from environment variables
        console.log("MongoDB connected successfully"); // Log success message
       }catch(error){
        console.log("MongoDB connection failed", error);
       }
}

export default connectDB;