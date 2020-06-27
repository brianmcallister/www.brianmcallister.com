import assert from 'assert';
import { createPool, sql, QueryResultType, QueryResultRowType } from 'slonik';

interface User {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
}

const { POSTGRES_CONNECTION_STRING } = process.env;

assert(POSTGRES_CONNECTION_STRING);

export const getUser = async (
  user = 'freebowlofsoup',
): Promise<User | null> => {
  const pool = createPool(POSTGRES_CONNECTION_STRING);

  const result = await pool.maybeOne<User>(sql`
    SELECT *
    FROM users
    WHERE id = ${user}
  `);

  await pool.end();

  return result;
};

export const updateUser = async (
  id: string,
  rawParams: { access_token: string; refresh_token: string | null },
): Promise<QueryResultType<QueryResultRowType<string>>> => {
  const pool = createPool(POSTGRES_CONNECTION_STRING);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { access_token, refresh_token } = rawParams;
  const fields = [
    { key: 'access_token', value: access_token },
    { key: 'refresh_token', value: refresh_token },
  ];
  const setFields = fields.reduce<ReturnType<typeof sql.join>[]>(
    (acc, next) => {
      if (next.value != null) {
        return [
          ...acc,
          sql.join([sql.identifier([next.key]), next.value], sql` = `),
        ];
      }

      return acc;
    },
    [],
  );
  const query = sql`
    UPDATE users
    SET ${sql.join(setFields, sql`, `)}
    WHERE id = ${id}
  `;

  return pool.query(query);
};
