import { Server } from "socket.io";
import { verifyToken } from "../config/jwt.js";
import { setupBingoEvents } from "./bingo.handler.js";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.token;
        if (!token) return next(new Error("Token missing"));
        
        try {
            const decoded = verifyToken(token);
            socket.userId = decoded.id; 
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);
        // Pass the connection to the handler
        setupBingoEvents(io, socket); 
    });

    return io;
};