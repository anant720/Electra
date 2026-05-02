export default function AxiomValidatorPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Axiom Validator</h2>
          <p className="text-[#52606D] mt-2">LEGAL_VALIDATOR workflow: verify and approve civic facts.</p>
        </div>
        <button className="bg-[#0070F3] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0070F3]/90">
          + Create Axiom
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex gap-4 bg-[#F8FAFC]">
          <input type="text" placeholder="Search axioms by keyword..." className="flex-1 px-4 py-2 rounded border border-[#E2E8F0] text-sm" />
          <select className="px-4 py-2 rounded border border-[#E2E8F0] text-sm bg-white">
            <option>All Countries</option>
            <option>IND</option>
            <option>USA</option>
            <option>GBR</option>
          </select>
          <select className="px-4 py-2 rounded border border-[#E2E8F0] text-sm bg-white">
            <option>All Statuses</option>
            <option>Needs Verification</option>
            <option>Verified</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E2E8F0] text-[#52606D]">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Code</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Fact Content</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Volatility</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {[
                { code: 'IND-REG-01', text: 'Voter registration age is 18+', vol: 'STABLE', status: 'VERIFIED' },
                { code: 'USA-ID-04', text: 'Acceptable alternative IDs for provisional ballot', vol: 'HIGH', status: 'NEEDS_VERIFICATION' },
                { code: 'GBR-VAC-01', text: 'Voter Authority Certificate required for in-person voting', vol: 'MEDIUM', status: 'VERIFIED' },
              ].map((axiom, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-[#102A43] font-bold">{axiom.code}</td>
                  <td className="px-6 py-4 text-[#52606D] truncate max-w-xs">{axiom.text}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      axiom.vol === 'STABLE' ? 'bg-green-100 text-green-800' :
                      axiom.vol === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {axiom.vol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {axiom.status === 'VERIFIED' ? (
                      <span className="text-green-600 font-medium text-xs flex items-center gap-1">✓ Verified</span>
                    ) : (
                      <span className="text-amber-600 font-medium text-xs flex items-center gap-1">⚠ Review Needed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#0070F3] hover:underline font-medium text-xs mr-3">Edit</button>
                    {axiom.status !== 'VERIFIED' && <button className="text-green-600 hover:underline font-medium text-xs">Verify</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
