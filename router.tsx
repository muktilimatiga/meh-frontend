import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { MainLayout } from './components/layouts/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { ExcalidrawPage } from './pages/Excalidraw';
import { ReactFlowPage } from './pages/ReactFlow';
import { BroadbandPage } from './pages/Broadband';
import { DatabasePage } from './pages/Database';
import { LogsPage } from './pages/Logs';
import { TemplatePage } from './pages/Template';

// 1. Create a root route
const rootRoute = createRootRoute({
    component: MainLayout,
});

// 2. Define children routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: DashboardPage,
});

const excalidrawRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/excalidraw',
    component: ExcalidrawPage,
});

const reactFlowRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reactflow',
    component: ReactFlowPage,
});

const broadbandRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/broadband',
    component: BroadbandPage,
});

const databaseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/database',
    component: DatabasePage,
});

const logsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/logs',
    component: LogsPage,
});

const templateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/template',
    component: TemplatePage,
});

// 3. Create the route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    excalidrawRoute,
    reactFlowRoute,
    broadbandRoute,
    databaseRoute,
    logsRoute,
    templateRoute,
]);

// 4. Create the router
export const router = createRouter({ routeTree });

// 5. Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
