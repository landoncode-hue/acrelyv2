
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function count() {
    const { count } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
    console.log(`Allocation Count: ${count}`);
}
count();
