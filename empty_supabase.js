const fs = require('fs');

const filesToWipe = [
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/admin.ts',
  'src/lib/audit.ts'
];

for (const f of filesToWipe) {
  try {
    if (fs.existsSync(f)) {
      let content = fs.readFileSync(f, 'utf8');
      content = content.replace(/import { createClient.*} from ['"]@supabase\/supabase-js['"];?\n?/g, '');
      content = content.replace(/import { createServerClient.*} from ['"]@supabase\/ssr['"];?\n?/g, '');
      fs.writeFileSync(f, content);
      console.log('Fixed imports in', f);
    }
  } catch (e) { console.error('Error on', f, e.message); }
}
