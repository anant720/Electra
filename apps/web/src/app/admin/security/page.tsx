export default function SecurityAlertsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#C0392B] tracking-tight">Security Alerts</h2>
          <p className="text-[#52606D] mt-2">Active threat detection, hallucination monitoring, and system degradation.</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-xl border border-[#C0392B]/30 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
            <h3 className="font-bold text-lg text-[#102A43]">System Degradation Level</h3>
          </div>
          <p className="text-sm text-[#52606D] mb-4">
            Currently operating at <strong>LEVEL 0 (Normal)</strong>. All primary PostgreSQL and Gemini AI services are responsive.
          </p>
          <div>
            <button className="bg-gray-50 border border-[#E2E8F0] px-4 py-2 rounded text-sm font-semibold text-[#102A43] hover:bg-gray-100 transition-colors">
              Test Level 3 Degradation (Fallback Cache)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-semibold text-[#102A43]">AI Post-Filter Flags (Last 24h)</h3>
          </div>
          <div className="p-8 text-center text-[#52606D]">
            <p>0 queries flagged for hallucination or political bias.</p>
            <p className="text-sm mt-2 text-[#16A34A] font-medium">Safety Middleware is fully operational.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
