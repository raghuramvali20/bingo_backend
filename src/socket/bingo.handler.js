import { GameLogic } from "./game.logic.js";

export const setupBingoEvents = (io, socket) => {
    // When searching for a match
    socket.on("join_game", () => GameLogic.handleJoin(socket, io));

    // When the game starts, Flutter sends the generated 5x5 board
    socket.on("send_board", (board) => GameLogic.registerBoard(socket, io, board));

    // When it's a player's turn and they pick a number
    socket.on("pick_number", (number) => GameLogic.handlePickNumber(socket, io, number));

    socket.on("disconnect", () => GameLogic.handleDisconnect(socket, io));
};