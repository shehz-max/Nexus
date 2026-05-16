import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export async function errorHandler(
  app: FastifyInstance,
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Handle specific error types
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        statusCode: 400,
        message: 'Validation error',
        details: error.validation,
      },
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        statusCode: error.statusCode,
        message: error.message,
      },
    });
  }

  // Handle JWT errors
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
      error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    return reply.status(401).send({
      success: false,
      error: {
        statusCode: 401,
        message: 'Unauthorized - Invalid or missing token',
      },
    });
  }

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  // Generic error response
  return reply.status(500).send({
    success: false,
    error: {
      statusCode: 500,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
    },
  });
}