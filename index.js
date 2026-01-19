import "dotenv/config";
import http from "http"; // 1. Built-in Node module
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { initializeSocket } from "./src/socket/socket.manager.js"; // 2. Your socket setup

const port = process.env.PORT || 3000;

// 3. Create the HTTP server wrapper
const server = http.createServer(app);

// 4. Initialize Socket.io and pass the server
initializeSocket(server);

connectDB().then(() => {
    // 5. CRITICAL: Listen using 'server', NOT 'app'
    server.listen(port, () => {
        console.log(`Server & Sockets running on port ${port}`);
    });
});