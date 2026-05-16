import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { JwtPayload } from '../types/index.js';

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post<{ Body: RegisterBody }>(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      const { email, password, name } = request.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: {
            statusCode: 400,
            message: 'User already exists with this email',
          },
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          preferences: {
            create: {
              theme: 'light',
              timezone: 'UTC',
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true,
        },
      });

      // Generate token
      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '7d' }
      );

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user.register',
          details: { email: user.email },
        },
      });

      return reply.status(201).send({
        success: true,
        data: {
          user,
          token,
        },
      });
    }
  );

  // Login
  fastify.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { email, password } = request.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: {
            statusCode: 401,
            message: 'Invalid email or password',
          },
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);

      if (!validPassword) {
        return reply.status(401).send({
          success: false,
          error: {
            statusCode: 401,
            message: 'Invalid email or password',
          },
        });
      }

      // Generate token
      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '7d' }
      );

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user.login',
          details: { email: user.email },
        },
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            avatarUrl: user.avatarUrl,
          },
          token,
        },
      });
    }
  );

  // Get current user
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;

      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          avatarUrl: true,
          createdAt: true,
          preferences: true,
        },
      });

      if (!currentUser) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'User not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: currentUser,
      });
    }
  );

  // Update current user
  fastify.patch(
    '/me',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { name, avatarUrl } = request.body as { name?: string; avatarUrl?: string };

      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: {
          ...(name && { name }),
          ...(avatarUrl && { avatarUrl }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          avatarUrl: true,
        },
      });

      return reply.send({
        success: true,
        data: updatedUser,
      });
    }
  );

  // Refresh token
  fastify.post(
    '/refresh',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;

      // Generate new token
      const token = fastify.jwt.sign(
        { userId: user.userId, email: user.email },
        { expiresIn: '7d' }
      );

      return reply.send({
        success: true,
        data: { token },
      });
    }
  );

  // Logout (could implement token blacklisting here)
  fastify.post(
    '/logout',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'user.logout',
        },
      });

      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    }
  );
}