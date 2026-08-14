const fs = require('fs');
const path = './src/app/api/admin/products/upload/route.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { auth }')) {
  code = code.replace("import { writeClient } from '@/shared/lib/sanity';", "import { writeClient } from '@/shared/lib/sanity';\nimport { auth } from '@/shared/lib/auth';");
}

const authCheck = `
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
`;

const methodRegex = new RegExp(`export async function POST\\([^)]*\\)\\s*\\{\\s*try\\s*\\{`, 'g');
code = code.replace(methodRegex, `$&${authCheck}`);

fs.writeFileSync(path, code);
