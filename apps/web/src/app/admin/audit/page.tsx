export default function AuditLogsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Audit Logs</h2>
          <p className="text-[#52606D] mt-2">Immutable record of all governance mutations.</p>
        </div>
        <button className="bg-white text-[#102A43] border border-[#E2E8F0] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50">
          Export CSV
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex gap-4 bg-[#F8FAFC]">
          <input type="text" placeholder="Search by user or action..." className="flex-1 px-4 py-2 rounded border border-[#E2E8F0] text-sm" />
          <input type="date" className="px-4 py-2 rounded border border-[#E2E8F0] text-sm bg-white" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E2E8F0] text-[#52606D]">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Timestamp</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Action</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">User (RBAC)</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {[
                { time: '2026-04-28 14:20:00', action: 'AXIOM_UPDATED', user: 'admin@electra.org', details: 'Updated IND T02 steps (Volatility: STABLE)' },
                { time: '2026-04-28 13:15:22', action: 'SOURCE_ADDED', user: 'legal@electra.org', details: 'Added AEC official domain' },
                { time: '2026-04-28 10:05:11', action: 'VOLATILITY_RAISED', user: 'system', details: 'USA NVRA deadline approached' },
                { time: '2026-04-27 09:12:00', action: 'COUNTRY_CONFIG_CHANGED', user: 'superadmin@electra.org', details: 'Enabled GBR Voter Authority Certificate workflow' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#52606D] whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4 font-bold text-[#0070F3] text-xs">{log.action}</td>
                  <td className="px-6 py-4 text-[#102A43] font-medium">{log.user}</td>
                  <td className="px-6 py-4 text-[#52606D]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
