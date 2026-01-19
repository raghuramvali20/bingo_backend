import User from "../models/User.model.js";

// @desc    Get current logged-in user profile
// @route   GET /api/v1/user/profile
export const getUserProfile = async (req, res) => {
    try {
        // req.user is already populated by the 'protect' middleware
        const user = req.user;

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Search users by name or email (excluding self)
// @route   GET /api/v1/user/search
export const searchUsers = async (req, res) => {
    try {
        const name = req.query.name || "";

        const users = await User.find({
            displayName: { $regex: name, $options: "i" }, // Case-insensitive search
            _id: { $ne: req.user._id } // Exclude current user from results
        }).select("displayName avatar coins stats.level");

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a friend request to another user
// @route   POST /api/v1/user/add-friend
export const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body; 
        const senderId = req.user._id;

        // Validation: Ensure receiverId exists in request
        if (!receiverId) {
            return res.status(400).json({ success: false, message: "Receiver ID is required" });
        }

        // Validation: Prevent adding self (comparing string to objectId)
        if (receiverId === senderId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot add yourself" });
        }

        // $addToSet prevents duplicate requests if clicked multiple times
        const updatedUser = await User.findByIdAndUpdate(
            receiverId,
            { $addToSet: { friendRequests: senderId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(201).json({ 
            success: true, 
            message: "Friend request sent successfully" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//@desc responding to friend request
//@route /respond-friend-request

export const respondFriendRequest = async (req, res) => {
    try{
        const {senderId, action} = req.body;

        const userId = req.user._id;

        if(action === "accept"){
            await User.findByIdAndUpdate(userId, {
                $pull: {friendRequests: senderId},
                $addToSet: {friends: senderId}
            })
        }

        await User.findByIdAndUpdate(senderId, {
            $addToSet: {friends: userId}
        })

        return res.status(200).json({success: true, message: "Friend request rejected"});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};