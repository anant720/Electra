import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="mb-3 text-2xl font-black text-[#102A43]">Terms of Service</h1>
        <p className="mb-3 text-sm text-[#334E68]">
          ELECTRA is provided for educational civic process guidance. Users are responsible for verifying election-critical
          information from official authorities before taking action.
        </p>
        <p className="mb-4 text-sm text-[#334E68]">
          The platform does not provide political endorsements, predictions, or legal representation.
        </p>
        <Link href="/" className="text-sm font-bold text-[#0070F3] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
