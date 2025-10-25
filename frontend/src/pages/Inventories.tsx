import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Inventories() {
    const navigate = useNavigate();
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Inventories Page</h1>
            <p>This is the inventories page where you can view and manage your inventories.</p>
            <Button 
                className="mt-4"
                onClick={() => navigate(`/inventories/52162/items`)}
                >
                Inventory #52162
            </Button>
        
        </div>
    );
}