import { ApiKeyDialog } from "@/components/dialogs/api-key";
import { Separator } from "@/components/ui/separator";

export function Integrations() {
    return (
        <div className="px-1 container">
            <div className="flex flex-col">
                <h3>API token</h3>
                <p className="mt-2 text-sm text-gray-400 mb-4">
                    This token allows you to integrate your inventory with third-party applications and services.
                </p>
                <ApiKeyDialog />
            </div>
            <Separator className="my-5"/>
        </div>
    );
}