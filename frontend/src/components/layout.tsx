import { Navbar } from "./navbar";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow px-2 py-5 lg:p-5 ">
                {children}
            </main>
            <Toaster position="bottom-right"/>
        </div>
    );

}