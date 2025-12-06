import * as React from 'react';
import { DashboardPage } from './pages/Dashboard';
import { ExcalidrawPage } from './pages/Excalidraw';
import { ReactFlowPage } from './pages/ReactFlow';
import { BroadbandPage } from './pages/Broadband';
import { DatabasePage } from './pages/Database';
import { LogsPage } from './pages/Logs';
import { TemplatePage } from './pages/Template';

export type ViewState = 'dashboard' | 'excalidraw' | 'reactflow' | 'broadband' | 'database' | 'logs' | 'template';

const App: React.FC = () => {
    const [activeView, setActiveView] = React.useState<ViewState>('dashboard');

    const handleNavigate = (view: ViewState) => {
        setActiveView(view);
    };

    if (activeView === 'excalidraw') {
        return <ExcalidrawPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'reactflow') {
        return <ReactFlowPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'broadband') {
        return <BroadbandPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'database') {
        return <DatabasePage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'logs') {
        return <LogsPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'template') {
        return <TemplatePage onBack={() => setActiveView('dashboard')} />;
    }

    return <DashboardPage onNavigate={handleNavigate} />;
};

export default App;