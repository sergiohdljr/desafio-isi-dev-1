export type PostgresUrlParams = {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
};

export function buildPostgresUrl(params: PostgresUrlParams): string {
  const user = encodeURIComponent(params.user);
  const password = encodeURIComponent(params.password);
  return `postgresql://${user}:${password}@${params.host}:${params.port}/${params.database}`;
}
