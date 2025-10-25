import Breadcrumbs from "./breadcrumbs";
import { Navbar } from "./navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow p-4">
                <div className="mb-4">
                    <Breadcrumbs />
                </div>
                
                {children}
            </main>
        </div>
    );

}