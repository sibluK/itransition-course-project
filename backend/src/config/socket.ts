import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import config from "./config.js";

export const initializeSocket = (server: HTTPServer): Server => {
    console.log("Initializing Socket.io server");
    const io = new Server(server, {
        cors: {
            origin: config.frontendUrl,
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.IO server initialized");

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join_inventory", (inventoryId: number) => {
            socket.join(`inventory_${inventoryId}`);
            console.log(`User ${socket.id} joined inventory_${inventoryId}`);
        });

        socket.on("leave_inventory", (inventoryId: number) => {
            socket.leave(`inventory_${inventoryId}`);
            console.log(`User ${socket.id} left inventory_${inventoryId}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}