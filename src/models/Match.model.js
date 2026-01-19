import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    // The room or type of Bingo (e.g., "Classic", "High Stakes", "Speed Bingo")
    roomName: {
      type: String,
      default: "Classic Hall",
    },

    // Array of all players who joined this specific match
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // The user who actually hit "BINGO" and was verified
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // How much it cost each player to enter
    entryFee: {
      type: Number,
      required: true,
      enum: [200, 500, 1000, 1500, 2000],
      default: 200,
    },

    // Total coins awarded to the winner
    prizePool: {
      type: Number,
      required: true,
    },

    // Useful for game history: "completed", "cancelled", or "in-progress"
    status: {
      type: String,
      enum: ["completed", "ongoing", "cancelled"],
      default: "completed",
    },
  },
  { timestamps: true } // Automatically creates 'createdAt' and 'updatedAt'
);

const Match = mongoose.model("Match", matchSchema);

export default Match;