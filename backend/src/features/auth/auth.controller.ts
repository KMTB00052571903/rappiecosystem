import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { authenticateUserService, createUserService } from './auth.service';
import { UserRole } from './auth.types';



// LOGIN
export const authenticateUserController = async (
  req: Request,
  res: Response
) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    throw Boom.badRequest('Email is required and must be a string');
  }

  if (!password || typeof password !== 'string') {
    throw Boom.badRequest('Password is required and must be a string');
  }

  const user = await authenticateUserService({ email, password });
  return res.json(user);
};

// REGISTER
export const createUserController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const { email, password, role, name, address } = req.body;

  if (!email || typeof email !== 'string') {
    throw Boom.badRequest('Email is required and must be a string');
  }

  if (!password || typeof password !== 'string') {
    throw Boom.badRequest('Password is required and must be a string');
  }

  if (!role || !Object.values(UserRole).includes(role)) {
    throw Boom.badRequest(
      `Role must be one of: ${Object.values(UserRole).join(', ')}`
    );
  }

  const user = await createUserService({
    email,
    password,
    role,
    name,
    address,
  });

  return res.status(201).json(user);
};