import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema(
    {
        displayName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },


        // Current Friends (Both Facebook and Manual)
        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        // Handle incoming friend requests
        friendRequests: [{
            from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: { 
                type: String, 
                enum: ["pending", "accepted", "rejected"], 
                default: "pending" 
            },
            sentAt: { type: Date, default: Date.now }
        }],

        coins: { type: Number, default: 500 },

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

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;