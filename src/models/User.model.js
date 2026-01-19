import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        displayName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        avatar: { type: String },

        googleId: { type: String, sparse: true, unique: true }, 
        facebookId: { type: String, sparse: true, unique: true },

        // Current Friends (Both Facebook and Manual)
        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        // NEW: Handle incoming friend requests
        friendRequests: [{
            from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: { 
                type: String, 
                enum: ["pending", "accepted", "rejected"], 
                default: "pending" 
            },
            sentAt: { type: Date, default: Date.now }
        }],

        coins: { type: Number, default: 500 }, // Give them 500 to start!

        stats: {
            gamesPlayed: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 }, 
            winsStreak: { type: Number, default: 0 },
            level: {type: Number, default: 1}
        },

        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;