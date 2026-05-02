export default function VolatilityApprovalsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Volatility Approvals</h2>
          <p className="text-[#52606D] mt-2">Manage temporary overrides and emergency procedural changes.</p>
        </div>
      </div>

      <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/50 rounded-xl p-6 mb-8 flex items-start gap-4">
        <div className="text-[#9C7A14] mt-1">⚠</div>
        <div>
          <h3 className="font-bold text-[#9C7A14]">Active Volatile Overrides</h3>
          <p className="text-sm text-[#9C7A14] mt-1">
            When an axiom is marked HIGH volatility, the UI will display a mandatory verification warning to users.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="font-semibold text-[#102A43]">Pending Volatility Escalations</h3>
        </div>
        <div className="p-8 text-center text-[#52606D]">
          <p>No pending volatility escalations.</p>
          <p className="text-sm mt-2">System is currently stable.</p>
        </div>
      </div>
    </div>
  );
}
