import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./i18n/config.ts";
import { ThemeProvider } from './contexts/theme-provider.tsx'
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const queryClient = new QueryClient();

if (!PUBLISHABLE_KEY) {
    throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
                <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
                    <App />
                </ThemeProvider>
            </ClerkProvider>
        </QueryClientProvider>
    </StrictMode>,
)
