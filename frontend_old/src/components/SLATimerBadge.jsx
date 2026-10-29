import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Flame, ShieldAlert, Zap } from 'lucide-react';

const SLA_HOURS_MAP = {
    urgent: 2,
    high: 6,
    medium: 24,
    low: 48
};

/**
 * SLATimerBadge - Real-time SLA Countdown and Breach Alert Badge
 */
const SLATimerBadge = ({ ticket, compact = false, showTarget = false }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!ticket) return null;

    const priority = (ticket.priority || 'medium').toLowerCase();
    const targetHours = SLA_HOURS_MAP[priority] || 24;

    const createdAt = new Date(ticket.createdAt || currentTime).getTime();
    const deadline = ticket.slaDeadline 
        ? new Date(ticket.slaDeadline).getTime() 
        : createdAt + (targetHours * 60 * 60 * 1000);

    const isResolved = ticket.status === 'resolved' || ticket.status === 'closed' || ticket.status === 'rejected';
    const resolvedAt = ticket.resolvedAt 
        ? new Date(ticket.resolvedAt).getTime() 
        : (isResolved ? (ticket.updatedAt ? new Date(ticket.updatedAt).getTime() : currentTime) : null);

    // Helper format function for duration
    const formatDuration = (ms) => {
        if (ms <= 0) return '0s';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;
            return `${days}d ${remHours}h ${minutes}m`;
        }

        const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}h ` : '';
        const mStr = `${minutes.toString().padStart(2, '0')}m `;
        const sStr = `${seconds.toString().padStart(2, '0')}s`;

        return `${hStr}${mStr}${sStr}`;
    };

    // Case 1: Ticket is RESOLVED
    if (isResolved && resolvedAt) {
        const wasBreached = resolvedAt > deadline;
        const timeTakenMs = Math.max(0, resolvedAt - createdAt);
        const timeTakenStr = formatDuration(timeTakenMs);

        if (wasBreached) {
            const breachOverdueMs = resolvedAt - deadline;
            return (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${compact ? 'text-[11px] py-0.5' : ''}`}>
                    <AlertTriangle size={compact ? 12 : 14} className="text-amber-600 shrink-0" />
                    <span>Resolved (SLA Breached by {formatDuration(breachOverdueMs)})</span>
                </div>
            );
        }

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs ${compact ? 'text-[11px] py-0.5' : ''}`}>
                <CheckCircle size={compact ? 12 : 14} className="text-emerald-600 shrink-0" />
                <span>Resolved within SLA ({timeTakenStr})</span>
            </div>
        );
    }

    // Case 2: ACTIVE Ticket (Countdown or Breached)
    const remainingMs = deadline - currentTime;
    const isBreached = remainingMs <= 0;
    const isAtRisk = remainingMs > 0 && remainingMs <= 60 * 60 * 1000; // Less than 1 hour

    if (isBreached) {
        const overdueMs = Math.abs(remainingMs);
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-red-500 text-white border border-red-600 shadow-sm animate-pulse ${compact ? 'text-[11px] py-0.5 px-2' : ''}`}>
                <ShieldAlert size={compact ? 12 : 14} className="shrink-0 animate-bounce" />
                <span>🚨 SLA Breached (+{formatDuration(overdueMs)})</span>
            </div>
        );
    }

    if (isAtRisk) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs animate-pulse ${compact ? 'text-[11px] py-0.5 px-2' : ''}`}>
                <Flame size={compact ? 12 : 14} className="text-amber-600 shrink-0 animate-bounce" />
                <span>⚠️ SLA At Risk: {formatDuration(remainingMs)} left</span>
            </div>
        );
    }

    // Normal On-Track Active State
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs ${compact ? 'text-[11px] py-0.5 px-2' : ''}`}>
            <Clock size={compact ? 12 : 14} className="text-primary-medium shrink-0" />
            <span>⏳ SLA Target: {formatDuration(remainingMs)}</span>
            {showTarget && <span className="text-blue-500 text-[10px] font-medium hidden sm:inline">({targetHours}h Policy)</span>}
        </div>
    );
};

export default SLATimerBadge;
