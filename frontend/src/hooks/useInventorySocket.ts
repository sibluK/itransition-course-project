import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useInventorySocket(inventoryId: number, hasWriteAccess: boolean) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { isSignedIn } = useAuth();
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const SOCKET_URL = API_URL.replace('/api', '');
    
    useEffect(() => {
        if (!hasWriteAccess || !isSignedIn) return;
        const newSocket = io(SOCKET_URL);

        newSocket.on("connect", () => {
            newSocket.emit("join_inventory", inventoryId);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit("leave_inventory", inventoryId);
            newSocket.disconnect();
        };
    }, [inventoryId]);

    return socket;
}