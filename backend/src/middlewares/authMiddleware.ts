import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import { supabase } from '../config/supabase';
import { AuthUser } from '@supabase/supabase-js';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const getUserFromRequest = (req: AuthenticatedRequest): AuthUser => {
  if (req.user) {
    return req.user;
  }

  throw Boom.unauthorized('User not authenticated');
};

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw Boom.unauthorized('Authorization header is missing');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw Boom.unauthorized('Invalid authorization format');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw Boom.unauthorized('Token is missing');
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw Boom.unauthorized('Invalid or expired token');
  }

  req.user = data.user;

  next();
};