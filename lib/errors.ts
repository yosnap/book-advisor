export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class OrchestratorError extends Error {
  constructor(message: string, public phase?: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public resource?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function formatErrorResponse(
  error: Error | unknown,
  requestId: string
): {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  requestId: string;
  timestamp: string;
} {
  const now = new Date().toISOString();

  if (error instanceof ValidationError) {
    return {
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
      },
      requestId,
      timestamp: now,
    };
  }

  if (error instanceof OrchestratorError) {
    return {
      error: {
        code: 'ORCHESTRATION_ERROR',
        message: error.message,
        details: {
          phase: error.phase,
          ...error.details,
        },
      },
      requestId,
      timestamp: now,
    };
  }

  if (error instanceof DatabaseError) {
    return {
      error: {
        code: 'DATABASE_ERROR',
        message: error.message,
        details: error.details,
      },
      requestId,
      timestamp: now,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      error: {
        code: 'NOT_FOUND',
        message: error.message,
        details: { resource: error.resource },
      },
      requestId,
      timestamp: now,
    };
  }

  // Generic error
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    },
    requestId,
    timestamp: now,
  };
}

export function getStatusCode(error: Error | unknown): number {
  if (error instanceof ValidationError) return 400;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof DatabaseError) return 503;
  if (error instanceof OrchestratorError) return 500;
  return 500;
}
