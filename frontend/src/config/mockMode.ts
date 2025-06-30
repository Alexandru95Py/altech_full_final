/**
 * Mock Mode Configuration
 * Global configuration for enabling/disabling mock mode during development
 */

// Global flag to enable/disable mock mode
// Set to true for development, false for production with real backend
export const IS_MOCK_MODE = false;

// Mock mode settings
export const MOCK_CONFIG = {
  // Simulate network delays for realism
  delays: {
    fast: 200, // Quick operations like login validation
    medium: 500, // Standard API calls
    slow: 1000, // File operations
    upload: 100, // Progress update interval for uploads
  },

  // Console logging configuration
  logging: {
    enabled: true,
    includeTimestamp: true,
    includeRequestDetails: true,
    includeResponsePreview: true,
  },

  // Mock data configuration
  data: {
    // User configuration
    defaultUser: {
      id: "mock-user-123",
      email: "demo@altech.com",
      firstName: "Demo",
      lastName: "User",
      profileImage: null,
    },

    // Storage configuration (in bytes)
    storage: {
      used: 45 * 1024 * 1024, // 45MB used
      total: 100 * 1024 * 1024, // 100MB total
    },

    // File upload simulation
    upload: {
      simulateProgress: true,
      progressSteps: 20, // Number of progress updates
      successRate: 0.95, // 95% success rate
    },
  },
};

/**
 * Utility to check if mock mode is enabled
 */
export const isMockMode = (): boolean => {
  return IS_MOCK_MODE;
};

/**
 * Get mock delay for operation type
 */
export const getMockDelay = (type: keyof typeof MOCK_CONFIG.delays): number => {
  return MOCK_CONFIG.delays[type];
};

/**
 * Log mock API calls to console
 */
export const logMockApiCall = (
  method: string,
  route: string,
  requestData?: any,
  responseData?: any,
): void => {
  if (!MOCK_CONFIG.logging.enabled) return;

  const timestamp = MOCK_CONFIG.logging.includeTimestamp
    ? new Date().toISOString()
    : "";

  const logStyle =
    "background: #4338ca; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;";

  console.group(`%c🎭 MOCK API CALL`, logStyle);

  if (timestamp) {
    console.log(`⏰ Time: ${timestamp}`);
  }

  console.log(`🔧 Method: ${method.toUpperCase()}`);
  console.log(`🛣️  Route: ${route}`);

  if (MOCK_CONFIG.logging.includeRequestDetails && requestData) {
    console.log("📤 Request Data:", requestData);
  }

  if (MOCK_CONFIG.logging.includeResponsePreview && responseData) {
    console.log(
      "📥 Response Preview:",
      typeof responseData === "object"
        ? Object.keys(responseData)
        : responseData,
    );
  }

  console.groupEnd();
};

/**
 * Create a promise with mock delay
 */
export const createMockPromise = <T>(
  data: T,
  delayType: keyof typeof MOCK_CONFIG.delays = "medium",
): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), getMockDelay(delayType));
  });
};

/**
 * Simulate upload progress
 */
export const simulateUploadProgress = (
  onProgress: (progress: number) => void,
  duration: number = MOCK_CONFIG.delays.slow,
): Promise<void> => {
  return new Promise((resolve) => {
    const steps = MOCK_CONFIG.data.upload.progressSteps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const updateProgress = () => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      onProgress(progress);

      if (currentStep >= steps) {
        resolve();
      } else {
        setTimeout(updateProgress, stepDuration);
      }
    };

    // Start progress simulation
    setTimeout(updateProgress, getMockDelay("upload"));
  });
};
