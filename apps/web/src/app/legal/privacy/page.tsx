import Link from 'next/link';

export default function LegalPrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="mb-3 text-2xl font-black text-[#102A43]">Privacy</h1>
        <p className="mb-3 text-sm text-[#334E68]">
          ELECTRA is designed to minimize sensitive data exposure. Queries are used to generate civic guidance and system
          quality signals. We do not use this platform for political targeting.
        </p>
        <p className="mb-4 text-sm text-[#334E68]">
          For high-stakes election decisions, verify with official sources listed inside the app.
        </p>
        <Link href="/" className="text-sm font-bold text-[#0070F3] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
