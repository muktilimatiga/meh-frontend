import * as React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

export const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                <Header />
                <div className="flex-1 overflow-auto relative w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
