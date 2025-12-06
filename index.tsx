import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/Sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Debug: Import CSS to ensure Tailwind styles are loaded
import './index.css';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <App />
        <Toaster />
      </NotificationProvider>
    </QueryClientProvider>
  </StrictMode>
);