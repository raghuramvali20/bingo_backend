import User from "../models/User.model.js"
import Match from "../models/Match.model.js";

export const getLeaderBoard = async (req, res) => {
    try{
        const users = await User.find({})
            .select("displayName avatar coins stats.level")
            .sort({coins: -1})
            .limit(15)
        res.status(200).json({
            success: true, 
            data: users
        });
    }catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching leaderboard"
        })
    }
};

export const getMatchHistory = async (req, res) => {
    try {
        const history = await Match.find({ player: req.user._id})
            .sort({createdAt: -1})
            .populate("winner", "displayName")
            .limit(10);
        res.status(200).json({ success: true, data: history});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message})
    }
}

export const recordMatchResult = async (req, res) => {
    try{
        const { winnerId, playerIds, prizePool, entryFee, roomName } = req.body;

        if(!winnerId || !playerIds || playerIds.length === 0){
            return res.status(400).json({ success: false, message: "Invalid match data" });
        }

        const updateWinner = await User.findByIdAndUpdate(
            winnerId,
            {
                $inc: {
                    coins: prizePool,
                    "stats.wins": 1
                }
            },
            { new: true }
        );
        
        if(!updateWinner){
            return res.status(400).json({ success: false, message: "Winner not found"});
        }

        const newMatch = await Match.create({
            roomName: roomName || "Classic Hall",
            players: winnerId,
            entryFee: entryFee || 0,
            prizePool: prizePool,
            status: "completed"
        });

        res.status(201).json({
            success: true,
            message:"Message recorded and winner rewarded",
            match : newMatch
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message})
    }
}