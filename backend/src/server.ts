import config from "./config/config.js";
import app from "./index.js";
import db from "./config/database.js";
import { sql } from "drizzle-orm";
import { createServer } from "http";
import { initializeSocket } from "./config/socket.js";

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