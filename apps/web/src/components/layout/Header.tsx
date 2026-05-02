import Link from 'next/link';
import { useCivicStore } from '@/store/civicStore';

export function Header() {
  const { countryCode } = useCivicStore();
  
  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-extrabold text-xl text-[#102A43] tracking-tight">
          ELECTRA
        </Link>
        {countryCode && (
          <span className="hidden md:inline-flex px-2 py-1 bg-gray-100 text-xs font-bold text-[#52606D] rounded uppercase">
            {countryCode}
          </span>
        )}
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-medium text-[#52606D] hover:text-[#102A43]">Dashboard</Link>
        <Link href="/register" className="text-sm font-medium text-[#52606D] hover:text-[#102A43]">Register</Link>
        <Link href="/emergency" className="text-sm font-bold text-[#C0392B] hover:text-red-800">Emergency</Link>
      </nav>
      
      <div className="flex items-center gap-4">
        <Link href="/auth/login" className="text-sm font-medium text-[#0070F3] hover:underline">
          Login
        </Link>
      </div>
    </header>
  );
}
