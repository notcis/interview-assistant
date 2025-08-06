// utils/index.ts

// Utility functions for error handling and async operations
export function formatError(error: any) {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const field = error.meta.target ? error.meta.target : "field";

    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

// for mongoose db

// Type for handler function
type handlerFunction = (...args: any[]) => Promise<any>;

// Type for validation error message
interface IvalidationError {
  message: string;
}

// Extracts error messages and status codes from an error object
function extractErrors(error: any) {
  if (error?.name === "ValidationError") {
    return {
      message: Object.values<IvalidationError>(error?.errors)
        .map((value) => value.message)
        .join(", "),
      statusCode: 400,
    };
  }

  if (error?.response?.data.message) {
    return {
      message: error?.response.data.message,
      statusCode: 400,
    };
  }

  if (error?.message) {
    return {
      message: error?.message,
      statusCode: 400,
    };
  }

  return {
    message: "Internal server error",
    statusCode: 500,
  };
}

// Extracts error messages and status codes from an error object
export const catchAsyncErrors =
  (handler: handlerFunction) =>
  async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const { message, statusCode } = extractErrors(error);
      return {
        error: {
          message,
          statusCode,
        },
      };
    }
  };
