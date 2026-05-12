export interface HandledError {
  message: string;
  fields?: { [key: string]: string }; // Keeping for potential future backend changes or different error types
}

export const handleApiError = (error: any): HandledError => {
  // Determine the status code, prioritizing the HTTP status, then backend's 'code'
  const httpStatusCode = error.response?.status;
  const backendStatusCode = error.response?.data?.code;

  // Case 1: Handle 422 Validation Errors with messages in 'content' array
  // Example: { success: false, message: "Validation failed", code: 422, content: [{ message: "Valid email is required" }] }
  if (httpStatusCode === 422 || backendStatusCode === 422) {
    if (Array.isArray(error.response?.data?.content)) {
      const generalMessages = error.response.data.content
        .map((item: { message?: string }) => item.message)
        .filter(Boolean) as string[];

      if (generalMessages.length > 0) {
        return {
          message: `${error.response.data.message || 'Validation failed'}: ${generalMessages.join('; ')}`,
        };
      }
    }
    // If 422 but not the expected content array structure, fallback to general message
    if (error.response?.data?.message) {
      return {
        message: error.response.data.message,
      };
    }
  }

  // Case 2: Handle other structured API errors (e.g., 400, 404, 500)
  // Example: { success: false, message: "User not found", code: 404, content: null }
  // This also catches 422s if they don't have the 'content' array but have a top-level message
  if (error.response?.data?.message) {
    return {
      message: error.response.data.message,
    };
  }

  // Case 3: Handle cases where the response data might be a string (potentially JSON, potentially plain text)
  if (typeof error.response?.data === 'string') {
    try {
      const parsed = JSON.parse(error.response.data);
      if (parsed.message) {
        return { message: parsed.message };
      }
    } catch (e) {
      // If parsing fails, treat as plain text message
      return { message: error.response.data };
    }
  }

  // Case 4: Handle generic Axios errors or other uncaught exceptions
  if (error.message) {
    return { message: error.message };
  }

  // Fallback for any truly unexpected error structure
  return { message: 'An unexpected error occurred. Please try again.' };
};
