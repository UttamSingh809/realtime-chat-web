/**
 * Auth form schemas. Mirror the backend's Joi validation rules 1:1.
 */

import { z } from 'zod';

// Reusable rules
const usernameRule = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, "_" and "." allowed');

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .refine(
    (val) => {
      const checks = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(val));
      return checks.length >= 3;
    },
    { message: 'Must contain at least 3 of: lowercase, uppercase, digit, symbol' }
  );

const emailRule = z.string().email('Please enter a valid email').max(160);

const nameRule = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name cannot exceed 80 characters');

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginSchema = z
  .object({
    email: z.string().optional().transform((v) => (v && v.trim() ? v.trim() : undefined)),
    username: z.string().optional().transform((v) => (v && v.trim() ? v.trim() : undefined)),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .refine((data) => data.email || data.username, {
    message: 'Enter either an email or a username',
    path: ['email'],
  });

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: nameRule,
  username: usernameRule,
  email: emailRule,
  password: passwordRule,
});

export type RegisterInput = z.infer<typeof registerSchema>;