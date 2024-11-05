// src/lib/db.js
import { PrismaClient } from '@prisma/client';

// Define global type for PrismaClient
const globalForPrisma = global;

// Create or reuse Prisma instance
export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}