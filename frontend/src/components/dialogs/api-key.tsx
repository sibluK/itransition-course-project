import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ClipboardCopy } from "lucide-react";
import { useApiKey } from "@/hooks/useApiKey";
import { useParams } from "react-router";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";

export function ApiKeyDialog() {
    const { inventoryId } = useParams();
    const { apiKey, refetchApiKey, isRefetching } = useApiKey(Number(inventoryId));

    const handleCopyKeyToClipboard = async () => {
        await navigator.clipboard.writeText(apiKey);
        toast.success("API token copied to clipboard!");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-fit">Show API Token</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>API Token</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2">
                    <div className="flex w-full gap-2">
                        <Label htmlFor="token" className="sr-only">
                            Token
                        </Label>
                        <Input
                            id="token"
                            value={apiKey}
                        />
                        <Button onClick={handleCopyKeyToClipboard}>
                            <ClipboardCopy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <DialogFooter className="flex flex-col">
                    <Button onClick={() => refetchApiKey()} disabled={isRefetching}>
                        {!isRefetching ? "Generate New Token" : <Spinner className="w-4 h-4" />}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
  );
}
