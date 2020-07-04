import { PrismaClient } from '@prisma/client';

const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

if (!isProduction && !global.prisma) {
  global.prisma = new PrismaClient();
}

export const prisma = isProduction ? new PrismaClient() : global.prisma;
