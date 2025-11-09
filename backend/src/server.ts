import config from "./configs/config.js";
import app from "./index.js";
import db from "./configs/database.js";
import { sql } from "drizzle-orm";
import { createServer } from "http";
import { initializeSocket } from "./configs/socket.js";

const server = createServer(app);

const io = initializeSocket(server);

db.execute(sql`SELECT 1`).then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.error("Database connection failed:", error);
});

server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});

export { io };