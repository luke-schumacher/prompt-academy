/**
 * Shared utilities for Prompt Academy levels.
 * Handles navigation between levels and centralized analytics logging.
 */

// ============================================================================
// NAVIGATION MANAGER
// ============================================================================

/**
 * Navigates to a specific level, handling environment differences (Localhost vs Netlify).
 * @param {string} levelName - The name of the level to navigate to (e.g., 'ecology_level').
 */
export function navigateToLevel(levelName) {
    // Remove .html extension if provided, for consistency
    const cleanName = levelName.replace('.html', '');
    
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
        window.location.href = `${cleanName}.html`;
    } else {
        // Netlify / production style (clean URLs)
        window.location.href = `/${cleanName}`;
    }
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

export class AnalyticsManager {
    constructor() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.sessionStart = Date.now();
        this.events = [];
        
        // Auto-bind context for safety
        this.log = this.log.bind(this);
        this.sendToNetlify = this.sendToNetlify.bind(this);
        this.sendAll = this.sendAll.bind(this);

        // Setup unload listener
        window.addEventListener('beforeunload', () => {
            this.log('session_end', {
                duration: Date.now() - this.sessionStart,
                totalEvents: this.events.length
            });
            this.sendAll();
        });
    }

    /**
     * Log an event.
     * @param {string} eventType - The type of event (e.g., 'level_complete').
     * @param {object} data - Additional data for the event.
     */
    log(eventType, data = {}) {
        const event = {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            type: eventType,
            data: data
        };

        this.events.push(event);

        // Send to Netlify immediately for important events
        if (this.shouldSendImmediately(eventType)) {
            this.sendToNetlify(event);
        }
    }

    shouldSendImmediately(type) {
        // Send critical events right away
        return ['level_complete', 'mistake', 'cooldown_trigger', 'session_end'].includes(type);
    }

    async sendToNetlify(event) {
        try {
            await fetch('/.netlify/functions/log-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Analytics logging failed:', error);
            // Fail silently - don't break game
        }
    }

    // Batch send on session end
    async sendAll() {
        if (this.events.length === 0) return;

        try {
            await fetch('/.netlify/functions/log-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    sessionStart: this.sessionStart,
                    sessionEnd: Date.now(),
                    totalEvents: this.events.length,
                    events: this.events
                })
            });
        } catch (error) {
            console.error('Batch analytics send failed:', error);
        }
    }
}

// Create a singleton instance to be used by default
export const analytics = new AnalyticsManager();
