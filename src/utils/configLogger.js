// Configuration Logger for Excel Sheet Links and Admin Settings
class ConfigLogger {
  constructor() {
    this.LOG_KEY = 'adminConfigLog';
    this.SETTINGS_KEY = 'adminSettings';
  }

  // Log Excel sheet URL changes with timestamp
  logExcelURLChange(type, url, oldUrl = '') {
    try {
      const logs = this.getLogs();
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: type, // 'read' or 'write'
        action: oldUrl ? 'updated' : 'added',
        newUrl: url,
        oldUrl: oldUrl,
        adminSession: this.getCurrentSession()
      };

      logs.push(logEntry);
      
      // Keep only last 50 log entries
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }

      localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
      console.log('Excel URL change logged:', logEntry);
      
      return { success: true, logEntry };
    } catch (error) {
      console.error('Error logging URL change:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all configuration logs
  getLogs() {
    try {
      const stored = localStorage.getItem(this.LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }

  // Save admin settings (URLs, preferences, etc.)
  saveAdminSettings(settings) {
    try {
      const currentSettings = this.getAdminSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date().toISOString(),
        sessionId: this.getCurrentSession()
      };

      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
      console.log('Admin settings saved:', updatedSettings);
      
      return { success: true, settings: updatedSettings };
    } catch (error) {
      console.error('Error saving admin settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Get admin settings
  getAdminSettings() {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        readSheetURL: '',
        writeSheetURL: '',
        googleFormURL: '',
        certificateDataURL: '',
        certificateTemplate: null,
        lastLogin: null,
        preferences: {}
      };
    } catch (error) {
      console.error('Error reading admin settings:', error);
      return {
        readSheetURL: '',
        writeSheetURL: '',
        googleFormURL: '',
        certificateDataURL: '',
        certificateTemplate: null,
        lastLogin: null,
        preferences: {}
      };
    }
  }

  // Update last login time
  updateLastLogin() {
    const settings = this.getAdminSettings();
    settings.lastLogin = new Date().toISOString();
    this.saveAdminSettings(settings);
  }

  // Get current session ID
  getCurrentSession() {
    let sessionId = sessionStorage.getItem('adminSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('adminSessionId', sessionId);
    }
    return sessionId;
  }

  // Export logs as downloadable file
  exportLogs() {
    try {
      const logs = this.getLogs();
      const settings = this.getAdminSettings();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        totalLogs: logs.length,
        currentSettings: settings,
        logs: logs
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin_config_log_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Logs exported successfully' };
    } catch (error) {
      console.error('Error exporting logs:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear old logs (keep only recent ones)
  clearOldLogs(daysToKeep = 30) {
    try {
      const logs = this.getLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffDate;
      });

      localStorage.setItem(this.LOG_KEY, JSON.stringify(filteredLogs));
      
      const removedCount = logs.length - filteredLogs.length;
      console.log(`Cleared ${removedCount} old log entries`);
      
      return { success: true, removedCount, remainingCount: filteredLogs.length };
    } catch (error) {
      console.error('Error clearing old logs:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recent activity summary
  getRecentActivity(days = 7) {
    try {
      const logs = this.getLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffDate;
      });

      const summary = {
        totalChanges: recentLogs.length,
        readURLChanges: recentLogs.filter(log => log.type === 'read' || log.type === 'faculty-read').length,
        writeURLChanges: recentLogs.filter(log => log.type === 'write' || log.type === 'faculty-write').length,
        facultyReadChanges: recentLogs.filter(log => log.type === 'faculty-read').length,
        facultyWriteChanges: recentLogs.filter(log => log.type === 'faculty-write').length,
        googleFormChanges: recentLogs.filter(log => log.type === 'google-form').length,
        certificateDataChanges: recentLogs.filter(log => log.type === 'certificate-data').length,
        lastActivity: recentLogs.length > 0 ? recentLogs[recentLogs.length - 1].timestamp : null,
        recentLogs: recentLogs.slice(-10) // Last 10 activities
      };

      return { success: true, summary };
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ConfigLogger();