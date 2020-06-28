import { PrismaClient, users } from '@prisma/client';

const prisma = new PrismaClient();

type UpdateParams = Pick<users, 'access_token' | 'refresh_token'>;

export const getUser = async (id = 'freebowlofsoup'): Promise<users | null> => {
  return prisma.users.findOne({
    where: {
      id,
    },
  });
};

export const updateUser = async (
  id: string,
  rawParams: UpdateParams,
): Promise<users> => {
  return prisma.users.update({
    where: {
      id,
    },
    data: rawParams,
  });
};
