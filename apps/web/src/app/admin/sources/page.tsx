export default function SourceRegistryPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Source Registry</h2>
          <p className="text-[#52606D] mt-2">Manage official electoral authorities and link health.</p>
        </div>
        <button className="bg-[#0070F3] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0070F3]/90">
          + Add Source
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="font-semibold text-[#102A43]">Registered Sources</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-[#E2E8F0] text-[#52606D]">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Authority</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Domain</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Country</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Link Health</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {[
                { name: 'Election Commission of India', domain: 'eci.gov.in', country: 'IND', health: 'HEALTHY' },
                { name: 'National Voter Service Portal', domain: 'voters.eci.gov.in', country: 'IND', health: 'HEALTHY' },
                { name: 'USA Vote.gov', domain: 'vote.gov', country: 'USA', health: 'HEALTHY' },
                { name: 'Electoral Commission UK', domain: 'electoralcommission.org.uk', country: 'GBR', health: 'REDIRECT' },
              ].map((source, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[#102A43]">{source.name}</td>
                  <td className="px-6 py-4 text-[#0070F3] font-mono text-xs"><a href={`https://${source.domain}`} target="_blank" rel="noreferrer">{source.domain}</a></td>
                  <td className="px-6 py-4 font-bold text-[#52606D]">{source.country}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      source.health === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                      source.health === 'BROKEN' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {source.health}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#52606D] hover:text-[#0070F3] font-medium text-xs">Edit</button>
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
