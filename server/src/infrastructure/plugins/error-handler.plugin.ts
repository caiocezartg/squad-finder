import type { FastifyInstance, FastifyError, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError } from 'zod'
import { AppError } from '@application/errors'

interface ErrorResponse {
  error: string
  message: string
  details?: unknown
}

interface ParsedError {
  statusCode: number
  response: ErrorResponse
}

function parseError(error: FastifyError | Error): ParsedError {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      response: {
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    }
  }

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      response: {
        error: error.code,
        message: error.message,
      },
    }
  }

  if ('validation' in error && error.validation) {
    return {
      statusCode: 400,
      response: {
        error: 'VALIDATION_ERROR',
        message: error.message,
      },
    }
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return {
      statusCode: error.statusCode,
      response: {
        error: 'INTERNAL_ERROR',
        message: error.message,
      },
    }
  }

  return {
    statusCode: 500,
    response: {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }
}

function logError(
  fastify: FastifyInstance,
  error: Error,
  request: FastifyRequest,
  statusCode: number
): void {
  if (statusCode === 500) {
    fastify.log.error(error, 'Unhandled error')
  }

  if (process.env.NODE_ENV !== 'production') {
    fastify.log.error({
      err: error,
      url: request.url,
      method: request.method,
      statusCode,
    })
  }
}

async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler((error: FastifyError | Error, request, reply) => {
    const { statusCode, response } = parseError(error)
    logError(fastify, error, request, statusCode)
    return reply.status(statusCode).send(response)
  })
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
  fastify: '5.x',
})
