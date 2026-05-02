import { redirect } from 'next/navigation';

export default function LegacySignupRoute() {
  redirect('/auth/signup');
}
