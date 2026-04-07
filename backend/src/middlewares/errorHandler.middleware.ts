import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';

function zodMessage(err: ZodError): string {
  const first = err.errors[0];
  return first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed';
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({ error: true, message: zodMessage(err) });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: true, message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({
      error: true,
      message: 'A candidate with this email already exists.',
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: true,
    message: 'Something went wrong on the server. Please try again later.',
  });
}
