import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="mb-3 text-2xl font-black text-[#102A43]">Disclaimer</h1>
        <p className="mb-3 text-sm text-[#334E68]">
          ELECTRA provides educational civic guidance and process navigation support. It is not legal advice, does not
          represent any election authority, and does not provide political recommendations.
        </p>
        <p className="mb-4 text-sm text-[#334E68]">
          Always verify deadlines, eligibility, and official actions through your local election authority before acting.
        </p>
        <Link href="/" className="text-sm font-bold text-[#0070F3] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
