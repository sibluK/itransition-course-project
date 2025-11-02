import { createContext, useContext, type ReactNode } from "react";
import { Socket } from "socket.io-client";
import { useInventorySocket } from "@/hooks/useInventorySocket";

interface InventorySocketProviderProps {
    inventoryId: number;
    hasWriteAccess: boolean;
    children: ReactNode;
}

const InventorySocketContext = createContext<Socket | null>(null);

export const InventorySocketProvider = ({ inventoryId, hasWriteAccess, children }: InventorySocketProviderProps) => {
    const socket = useInventorySocket(inventoryId, hasWriteAccess);

    return (
        <InventorySocketContext.Provider value={socket}>
            {children}
        </InventorySocketContext.Provider>
    );
};

export const useInventorySocketContext = () => {
    return useContext(InventorySocketContext)
};