import { PrismaClient, users } from '@prisma/client';

const prisma = new PrismaClient();

type UpdateParams = Pick<users, 'access_token' | 'refresh_token'>;

export const getUser = async (id = 'freebowlofsoup'): Promise<users | null> => {
  try {
    const result = prisma.users.findOne({
      where: {
        id,
      },
    });

    return result;
  } catch (err) {
    console.log('getUser error:');
    console.log(err);

    return null;
  }
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
