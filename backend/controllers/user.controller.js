import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

//models:
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  //fetch the user-name:
  const { username } = req.params;

  try {
    //find the username:
    const user = await User.findOne({ username }).select("-password");
    //not found:
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    //user exist and found:
    return res.status(200).json(user);
  } catch (error) {
    console.log("error with getuserprofile handler function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    //fetch the current userId:
    const userId = req.user._id;
    //fetch all followings:
    const usersFollowedByMe = await User.findById(userId).select("following");
    //fetch some random users:
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, //avoid the same user in his suggestions:
        },
      },
      { $sample: { size: 10 } },
    ]);

    // 1,2,3,4,5,6,
    //not part of his current followings:
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    //hide their actual password:
    suggestedUsers.forEach((user) => (user.password = null));
    //send response:

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("error with suggestedusers handler function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  //fetch new details or updated details:
  const { username, fullname, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  //fetch the current user by his id:
  const userId = req.user._id;

  try {
    //check user exist or not:
    let user = await User.findById(userId);
    //user not exist:
    if (!user) return res.status(404).json({ error: "user not exist..." });

    //one password has given and other has not:
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword))
      return res
        .status(400)
        .json({ error: "please provide both of the passwords..." });

    //if both passwords provided: updation is related to passwords:
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      //wrong password provided:
      if (!isMatch)
        return res
          .status(400)
          .json({ error: "provided password didn't match:" });
      //new password is invalid:
      if (newPassword.length < 6)
        return res
          .status(400)
          .json({ error: "new password must be of atleast 6 charecters:" });

      //update to new password:
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    //update the profile image:
    if (profileImg) {
      //first delete or remove the existing profile pic from cloudinary:
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    //update the cover image:
    if (coverImg) {
      //first delete or remove the existing profile pic from cloudinary:
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    //update all the other fields:
    user.username = username || user.username;
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.coverImg = coverImg || user.coverImg;
    user.profileImg = profileImg || user.profileImg;
    user.link = link || user.link;
    user.bio = bio || user.bio;

    //save the updated values:
    await user.save();
    //hide the password:
    user.password = null;

    //send the response:
    return res.status(200).json(user);
  } catch (error) {
    console.log("error with updateProfile handler function:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
