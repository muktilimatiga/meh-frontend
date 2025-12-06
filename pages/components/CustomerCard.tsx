import React from 'react';
import { User } from '../../types';
import { Badge, Avatar, Button } from '@/components/ui';

interface CustomerCardProps {
  user: User;
  onChangeUser?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ user, onChangeUser }) => {
  return (
    <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar fallback={user.name.charAt(0)} className="h-12 w-12" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
            {user.address && (
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{user.address}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{user.role}</Badge>
              {user.olt && (
                <Badge variant="secondary" className="text-xs">OLT: {user.olt}</Badge>
              )}
              {user.port && (
                <Badge variant="secondary" className="text-xs">Port: {user.port}</Badge>
              )}
            </div>
          </div>
        </div>
        {onChangeUser && (
          <Button variant="outline" size="sm" onClick={onChangeUser}>
            Change
          </Button>
        )}
      </div>
      {user.sn && (
        <div className="mt-4 p-3 bg-white dark:bg-zinc-800 rounded-md border border-slate-200 dark:border-zinc-700">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Device Information</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">SN:</span>
              <span className="ml-2 font-mono text-slate-900 dark:text-slate-200">{user.sn}</span>
            </div>
            {user.packet && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Package:</span>
                <span className="ml-2 text-slate-900 dark:text-slate-200">{user.packet}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};