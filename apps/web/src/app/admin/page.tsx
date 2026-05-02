export default function AdminHomePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Governance Dashboard</h2>
        <p className="text-[#52606D] mt-2">Manage civic data, sources, and platform security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric Cards */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
          <div className="text-sm font-semibold text-[#52606D] mb-2 uppercase tracking-wide">Pending Axioms</div>
          <div className="text-4xl font-extrabold text-[#D4AF37]">12</div>
          <div className="text-xs text-[#D4AF37] mt-2 font-medium">Requires LEGAL_VALIDATOR review</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
          <div className="text-sm font-semibold text-[#52606D] mb-2 uppercase tracking-wide">Active Sources</div>
          <div className="text-4xl font-extrabold text-[#102A43]">45</div>
          <div className="text-xs text-[#16A34A] mt-2 font-medium">100% healthy links</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm border-t-4 border-t-[#C0392B]">
          <div className="text-sm font-semibold text-[#52606D] mb-2 uppercase tracking-wide">Security Alerts</div>
          <div className="text-4xl font-extrabold text-[#C0392B]">0</div>
          <div className="text-xs text-[#52606D] mt-2">No injection attempts detected</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Audit Logs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-semibold text-[#102A43]">Recent Audit Activity</h3>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-[#E2E8F0]">
              {[
                { action: 'AXIOM_UPDATED', user: 'admin@electra.org', time: '10 mins ago', detail: 'Updated IND T02 steps' },
                { action: 'SOURCE_ADDED', user: 'legal@electra.org', time: '1 hour ago', detail: 'Added AEC official domain' },
                { action: 'VOLATILITY_RAISED', user: 'system', time: '3 hours ago', detail: 'USA NVRA deadline approached' },
              ].map((log, i) => (
                <li key={i} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-[#0070F3]">{log.action}</span>
                    <span className="text-xs text-[#52606D]">{log.time}</span>
                  </div>
                  <div className="text-sm text-[#102A43] font-medium">{log.detail}</div>
                  <div className="text-xs text-[#52606D] mt-1">by {log.user}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-t border-[#E2E8F0] text-center bg-gray-50">
            <a href="/admin/audit" className="text-sm text-[#0070F3] hover:underline font-medium">View Full Audit Log →</a>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-semibold text-[#102A43]">Quick Actions</h3>
          </div>
          <div className="p-5 grid gap-4">
            <a href="/admin/axioms" className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0070F3] transition-colors group">
              <div>
                <div className="font-semibold text-[#102A43] group-hover:text-[#0070F3]">Review Volatile Axioms</div>
                <div className="text-sm text-[#52606D]">Axioms marked HIGH volatility need verification</div>
              </div>
              <span className="text-[#0070F3]">→</span>
            </a>
            <a href="/admin/sources" className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0070F3] transition-colors group">
              <div>
                <div className="font-semibold text-[#102A43] group-hover:text-[#0070F3]">Add Official Source</div>
                <div className="text-sm text-[#52606D]">Register a new electoral authority URL</div>
              </div>
              <span className="text-[#0070F3]">→</span>
            </a>
            <a href="/admin/countries" className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0070F3] transition-colors group">
              <div>
                <div className="font-semibold text-[#102A43] group-hover:text-[#0070F3]">Configure Elections</div>
                <div className="text-sm text-[#52606D]">Set upcoming election dates per country</div>
              </div>
              <span className="text-[#0070F3]">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
