import { useParams } from "react-router";

export default function UserInventories() {
    const { userId } = useParams<{ userId: string }>();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{userId?.toUpperCase()} Inventories</h1>
            <p>This is the user inventories page where you can view and manage inventories for a specific user.</p>
        </div>
    );
}