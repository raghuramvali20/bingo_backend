import User from "../models/User.model.js";
import Match from "../models/Match.model.js";
import Transaction from "../models/Transaction.model.js";

const rooms = new Map(); 
const userToRoom = new Map();
let waitingPlayer = null;

export const GameLogic = {
    handleJoin: async (socket, io) => {
        const user = await User.findById(socket.userId);
        if (!user || user.coins < 200) {
            return socket.emit("error", "Insufficient coins to join the match");
        }

        if (waitingPlayer && waitingPlayer.userId !== socket.userId) {
            const opponent = waitingPlayer;
            const roomId = `room_${opponent.userId}_${socket.userId}`;
            waitingPlayer = null;

            socket.join(roomId);
            opponent.join(roomId);
            userToRoom.set(socket.userId, roomId);
            userToRoom.set(opponent.userId, roomId);

            const roomData = {
                roomId,
                players: [opponent.userId, socket.userId],
                boards: {}, 
                selectedNumbers: [],
                turnIndex: 0,
                entryFee: 200 
            };
            rooms.set(roomId, roomData);
            io.to(roomId).emit("match_found", { roomId, players: roomData.players });
        } else {
            waitingPlayer = socket;
            socket.emit("waiting", "Searching for opponent...");
        }
    },

    registerBoard: (socket, io, board) => {
        const roomId = userToRoom.get(socket.userId);
        const room = rooms.get(roomId);
        if (room) {
            room.boards[socket.userId] = board;
            if (Object.keys(room.boards).length === 2) {
                io.to(roomId).emit("start_game", { turn: room.players[room.turnIndex] });
            }
        }
    },

    handlePickNumber: async (socket, io, number) => {
        const roomId = userToRoom.get(socket.userId);
        const room = rooms.get(roomId);

        if (!room || room.players[room.turnIndex] !== socket.userId) return;
        if (room.selectedNumbers.includes(number)) return;

        room.selectedNumbers.push(number);
        io.to(roomId).emit("number_picked", { number, pickedBy: socket.userId });

        const winners = [];
        room.players.forEach(userId => {
            const board = room.boards[userId];
            // Safety check: only count lines if board exists and is valid
            if (board && Array.isArray(board) && GameLogic.countLines(board, room.selectedNumbers) >= 5) {
                winners.push(userId);
            }
        });

        if (winners.length > 0) {
            await GameLogic.finalizeMatch(io, roomId, winners[0]);
        } else {
            room.turnIndex = room.turnIndex === 0 ? 1 : 0;
            io.to(roomId).emit("next_turn", { turn: room.players[room.turnIndex] });
        }
    },

    finalizeMatch: async (io, roomId, winnerId) => {
        const room = rooms.get(roomId);
        if (!room) return;
        const prize = room.entryFee * 2;

        try {
            await User.findByIdAndUpdate(winnerId, { $inc: { coins: prize, "stats.wins": 1 } });
            await Transaction.create({
                userId: winnerId,
                amount: prize,
                type: "game_win",
                description: "Bingo 5-Line Win"
            });
            await Match.create({
                players: room.players,
                winner: winnerId,
                prizePool: prize,
                entryFee: room.entryFee,
                status: "completed"
            });

            io.to(roomId).emit("game_over", { winner: winnerId });
            rooms.delete(roomId);
            room.players.forEach(id => userToRoom.delete(id));
        } catch (err) {
            console.error("Match finalization failed:", err);
        }
    },

    countLines: (board, selected) => {
        console.log(board, selected)
        let lines = 0;
        const size = 5;
        // Verify board rows exist before checking .every
        for (let i = 0; i < size; i++) {
            if (board[i] && board[i].every(n => selected.includes(n))) lines++;
            if ([0,1,2,3,4].every(r => board[r] && selected.includes(board[r][i]))) lines++;
        }
        if ([0,1,2,3,4].every(i => board[i] && selected.includes(board[i][i]))) lines++;
        if ([0,1,2,3,4].every(i => board[i] && selected.includes(board[i][size - 1 - i]))) lines++;
        return lines;
    },

    handleDisconnect: (socket, io) => {
        const roomId = userToRoom.get(socket.userId);
        if (roomId) {
            io.to(roomId).emit("opponent_left");
            rooms.delete(roomId);
            userToRoom.delete(socket.userId);
        }
        if (waitingPlayer?.id === socket.id) waitingPlayer = null;
    }
};