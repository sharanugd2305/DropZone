import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/user.model.js";

export const createUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    console.log("userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findById(userId);

    if (user) {
      return res.status(200).json(user); // ✅ fix
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    user = await User.create({
      _id: userId,
      name: (clerkUser.firstName || "") + " " + (clerkUser.lastName || ""),
      email: clerkUser.emailAddresses[0].emailAddress,
      image: clerkUser.imageUrl,
    });
     
    
    res.status(201).json(user);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};