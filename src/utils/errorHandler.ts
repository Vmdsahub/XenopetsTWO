/**
 * Comprehensive Error Handling Utility
 * Fixes the [object Object] error logging issues across the entire app
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  context?: string;
  originalError?: any;
}

/**
 * Safely extracts error message from any error type
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return "Unknown error occurred";

  if (typeof error === "string") return error;

  if (error.message) return error.message;

  if (error.error?.message) return error.error.message;

  if (error.details) return error.details;

  if (error.hint) return error.hint;

  // For Supabase errors
  if (error.code && error.message) {
    return `${error.message} (Code: ${error.code})`;
  }

  // For auth errors
  if (error.name === "AuthError") {
    return error.message || "Authentication error occurred";
  }

  // For network errors
  if (error.name === "NetworkError" || error.type === "error") {
    return "Network connection error. Please check your internet connection.";
  }

  // Try to stringify as last resort
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error occurred";
  }
};

/**
 * Enhanced error logging that always shows readable messages
 */
export const logError = (
  context: string,
  error: any,
  additionalInfo?: any,
): ErrorDetails => {
  const errorDetails: ErrorDetails = {
    message: getErrorMessage(error),
    context,
    originalError: error,
  };

  if (error?.code) {
    errorDetails.code = error.code;
  }

  console.error(`[${context}]`, errorDetails.message, {
    error: errorDetails,
    additionalInfo,
  });

  return errorDetails;
};

/**
 * User-friendly error messages for common error codes
 */
export const getUserFriendlyMessage = (error: any): string => {
  const message = getErrorMessage(error);
  const code = error?.code;

  // Database/Auth specific errors
  if (code === "PGRST116") return "No data found";
  if (code === "PGRST301")
    return "Access denied. Please check your permissions.";
  if (code === "23505") return "This item already exists";
  if (code === "23503") return "Referenced item not found";
  if (code === "invalid_credentials") return "Invalid email or password";
  if (code === "email_not_confirmed") return "Please verify your email address";
  if (code === "over_email_send_rate_limit")
    return "Too many emails sent. Please wait before trying again.";

  // Network errors
  if (message.includes("fetch") || message.includes("network")) {
    return "Connection problem. Please check your internet and try again.";
  }

  // Generic fallback
  return message;
};

/**
 * Async wrapper that automatically handles errors
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallbackValue?: T,
): Promise<T | typeof fallbackValue> => {
  try {
    return await operation();
  } catch (error) {
    logError(context, error);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw error;
  }
};

/**
 * React hook for consistent error handling in components
 */
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    const errorDetails = logError(context || "Component Error", error);
    return getUserFriendlyMessage(error);
  };

  return { handleError };
};
