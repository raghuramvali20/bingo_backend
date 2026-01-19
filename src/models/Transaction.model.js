import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true }, // e.g., -50 for entry, +100 for win
    type: { 
        type: String, 
        enum: ["game_entry", "game_win", "daily_bonus", "purchase"], 
        required: true 
    },
    description: { type: String },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;