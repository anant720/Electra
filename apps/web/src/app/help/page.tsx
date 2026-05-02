import Link from 'next/link';

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="mb-3 text-2xl font-black text-[#102A43]">Help & Troubleshooting</h1>
        <p className="mb-4 text-sm text-[#334E68]">
          Use this page if you are unsure where to start. For urgent election-day issues, use emergency mode immediately.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/challenge2-demo" className="rounded-xl bg-[#102A43] px-4 py-2 text-sm font-bold text-white">
            Open Challenge Demo
          </Link>
          <Link href="/emergency" className="rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-bold text-white">
            Open Emergency Help
          </Link>
        </div>
      </div>
    </main>
  );
}
