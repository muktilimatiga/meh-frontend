import { LucideIcon } from 'lucide-react';

export interface AppIcon {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    description: string;
}

export interface UserProfile {
    id: number;
    username: string;
    full_name: string;
    role: string;
}

export interface Customer {
    olt_name: string;
    interface: string;
    nameaddres: string;
    sn: string;
    modemt_type: string;
    status: string;
    last_uptime: string;
    rx_power_dbm: string;
    rx_power_str: string;
    raw_onuid: string;
    last_updated: Date;
}

export interface CustomerPSB {
    name: string;
    alamat: string;
    user_pppoe: string;
    password_pppoe: string;
    paket: string;
}

export interface SearchResult {
    type: 'APP' | 'AI_ANSWER';
    content: string | AppIcon;
}

export enum AISearchStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

// React Flow / Topology Types
export type NodeType = 'input' | 'process' | 'output' | 'database' | 'api' | 'decision';

export interface Node {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    label: string;
    data?: Record<string, any>; // For dropdowns, inputs, custom state
}

export interface Edge {
    id: string;
    source: string;
    target: string;
}

// Excalidraw / Whiteboard Types
export type WhiteboardTool = 'select' | 'rectangle' | 'circle' | 'text';

export interface WhiteboardShape {
    id: string;
    type: WhiteboardTool;
    x: number;
    y: number;
    width?: number;
    height?: number;
    text?: string;
    color: string;
}

// Stats & Support Types
export interface Ticket {
    id: string;
    title: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assigneeId?: string | null;
    createdAt: string;
}

export interface TicketLog {
    id: string;
    ticketId: string;
    message: string;
    timestamp: string;
    userId: string;
}

export interface TrafficData {
    timestamp: string;
    download: number;
    upload: number;
}

export interface DashboardStats {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    activeUsers: number;
}

export interface Device {
    id: string;
    name: string;
    ip: string;
    status: 'online' | 'offline';
    lastSeen: string;
    type: string;
}

export interface SystemLog {
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: number;
    source?: string;
}

export interface LogMetro {
    id: string;
    service_name: string;
    month_sheet: string;
    no_ref: number;
    description: string;
    start_time: string;
    finish_time: string;
    downtime_duration: number;
    downtime_minutes: number;
    problem_detail: string;
    action_taken: string;
}