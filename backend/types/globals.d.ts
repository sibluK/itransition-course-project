/// <reference types="@clerk/express/env" />

declare global {
    namespace Express {
        interface Request {
            inventory?: typeof inventoriesTable.$inferSelect;
        }
    }
}