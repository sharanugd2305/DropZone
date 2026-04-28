import mongoose from "mongoose";
// Function to connect to MongoDB
let connectionPromise;

const connectDB = async () => {
       if (mongoose.connection.readyState === 1) {
              return mongoose.connection;
       }

       if (!process.env.MONGODB_URL) {
              throw new Error("MONGODB_URL is not set");
       }

       if (!connectionPromise) {
              connectionPromise = mongoose.connect(process.env.MONGODB_URL);
       }

       try {
              await connectionPromise;
              console.log("MongoDB connected successfully");
              return mongoose.connection;
       } catch (error) {
              connectionPromise = undefined;
              console.log("MongoDB connection failed", error);
              throw error;
       }
};

export default connectDB;