// System Information Configuration
// This file reads from environment variables for easy deployment configuration

export const systemInfo = {
  // Organization Information
  organization: {
    name: import.meta.env.VITE_ORG_NAME || "Faculty of Technology",
    description: import.meta.env.VITE_ORG_DESCRIPTION || "Student Information System - Comprehensive platform for academic management and administrative operations.",
    icon: "GraduationCap" // Lucide icon name
  },

  // System Details
  system: {
    name: import.meta.env.VITE_SYSTEM_NAME || "SIS",
    version: import.meta.env.VITE_SYSTEM_VERSION || "v3.0",
    environment: import.meta.env.VITE_ENVIRONMENT || "Production", // Production, Development, Staging
    lastUpdated: import.meta.env.VITE_LAST_UPDATED || new Date().toLocaleDateString()
  },

  // Support Information
  support: {
    itSupport: import.meta.env.VITE_IT_SUPPORT || "Available 24/7",
    systemAdmin: import.meta.env.VITE_SYSTEM_ADMIN_STATUS || "Online",
    emergency: import.meta.env.VITE_EMERGENCY_CONTACT || "Contact Help Desk",
    email: import.meta.env.VITE_SUPPORT_EMAIL || "support@fot.edu.lk",
    phone: import.meta.env.VITE_SUPPORT_PHONE || "+94 11 234 5678"
  },

  // Additional Configuration
  features: {
    realTimeUpdates: import.meta.env.VITE_REAL_TIME_UPDATES === "true",
    maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === "true",
    backupEnabled: import.meta.env.VITE_BACKUP_ENABLED !== "false"
  }
};

// Health Status Configuration
export const systemHealth = {
  server: {
    status: import.meta.env.VITE_SERVER_STATUS || "Online",
    color: "green"
  },
  database: {
    status: import.meta.env.VITE_DATABASE_STATUS || "Connected", 
    color: "blue"
  },
  activeUsers: {
    count: import.meta.env.VITE_ACTIVE_USERS || 247,
    color: "yellow"
  },
  uptime: {
    percentage: import.meta.env.VITE_SYSTEM_UPTIME || "99.9%",
    color: "purple"
  }
};

export default systemInfo;