import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AccountOrdersRedirectPage() {
  redirect('/account?tab=orders');
}
