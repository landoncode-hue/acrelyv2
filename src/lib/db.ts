import postgres from 'postgres';
import { env } from '@/lib/env';

const sql = postgres(env.POSTGRES_URL, {
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10,
});

export default sql;
