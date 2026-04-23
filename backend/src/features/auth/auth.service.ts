import { AuthenticateUserDTO, CreateUserDTO, UserRole } from './auth.types';
import Boom from '@hapi/boom';
import { supabase } from '../../config/supabase';
import { AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js';

export const authenticateUserService = async (
  credentials: AuthenticateUserDTO
): Promise<AuthTokenResponsePassword['data']> => {
  const signInResponse = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (signInResponse.error) {
    throw Boom.unauthorized(signInResponse.error.message);
  }

  return signInResponse.data;
};

export const createUserService = async (
  user: CreateUserDTO
): Promise<AuthResponse['data']> => {
  const signUpResponse = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        address: user.address,
        role: user.role,
      },
    },
  });

  if (signUpResponse.error) {
    throw Boom.badRequest(signUpResponse.error.message);
  }

  // Auto-create store when role is store
  if (user.role === UserRole.STORE && user.storeName && signUpResponse.data.user) {
    const { error } = await supabase.from('stores').insert([{
      name: user.storeName,
      userId: signUpResponse.data.user.id,
      isOpen: false,
    }]);

    if (error) {
      console.error('Failed to create store:', error.message);
    }
  }

  return signUpResponse.data;
};
