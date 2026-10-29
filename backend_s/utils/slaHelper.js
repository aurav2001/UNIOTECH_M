/**
 * SLA Helper - Calculates target deadlines and checks breach status
 */

const SLA_HOURS = {
    urgent: 2,   // 2 Hours
    high: 6,     // 6 Hours
    medium: 24,  // 24 Hours
    low: 48      // 48 Hours
};

/**
 * Calculates target SLA deadline based on priority and creation time
 * @param {string} priority - 'urgent' | 'high' | 'medium' | 'low'
 * @param {Date|string} fromDate - Starting date (defaults to now)
 * @returns {Date} Target deadline timestamp
 */
function calculateSLADeadline(priority = 'medium', fromDate = new Date()) {
    const p = (priority || 'medium').toLowerCase();
    const hours = SLA_HOURS[p] || 24;
    const start = fromDate ? new Date(fromDate) : new Date();
    return new Date(start.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Returns SLA metrics for response payload
 */
function getSLAMetrics(ticket) {
    if (!ticket || ticket.type !== 'ticket') return null;

    const now = new Date();
    const createdAt = new Date(ticket.createdAt || now);
    const deadline = ticket.slaDeadline ? new Date(ticket.slaDeadline) : calculateSLADeadline(ticket.priority, createdAt);
    const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
    const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt) : (isResolved ? new Date(ticket.updatedAt || now) : null);

    const targetHours = SLA_HOURS[(ticket.priority || 'medium').toLowerCase()] || 24;

    if (isResolved && resolvedAt) {
        const timeTakenMs = resolvedAt.getTime() - createdAt.getTime();
        const isBreached = resolvedAt.getTime() > deadline.getTime();
        return {
            targetHours,
            deadline,
            isResolved: true,
            resolvedAt,
            isBreached,
            timeTakenMs,
            timeTakenFormatted: formatDuration(timeTakenMs)
        };
    }

    const remainingMs = deadline.getTime() - now.getTime();
    const isBreached = remainingMs <= 0;
    const isNearBreach = remainingMs > 0 && remainingMs <= 60 * 60 * 1000; // less than 1 hour

    return {
        targetHours,
        deadline,
        isResolved: false,
        resolvedAt: null,
        remainingMs,
        isBreached,
        isNearBreach,
        remainingFormatted: formatDuration(Math.abs(remainingMs))
    };
}

function formatDuration(ms) {
    if (ms <= 0) return '0m';
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remHours = hours % 24;
        return `${days}d ${remHours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

module.exports = {
    SLA_HOURS,
    calculateSLADeadline,
    getSLAMetrics,
    formatDuration
};
