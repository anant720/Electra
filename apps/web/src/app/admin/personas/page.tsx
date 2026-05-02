export default function PersonaEditorPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Persona Editor</h2>
          <p className="text-[#52606D] mt-2">Manage the 6 core voting personas and jargon simplification rules.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-[#E2E8F0] text-[#52606D]">
            <tr>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Code</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Name</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Jargon Level</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Tone</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { code: 'P01', name: 'First-Time Voter', jargon: 'AGGRESSIVE', tone: 'Encouraging' },
              { code: 'P02', name: 'Student / Moved', jargon: 'MODERATE', tone: 'Direct' },
              { code: 'P03', name: 'Elderly / First-Time Digital', jargon: 'AGGRESSIVE', tone: 'Patient' },
              { code: 'P04', name: 'Overseas Voter', jargon: 'MODERATE', tone: 'Precise' },
              { code: 'P05', name: 'Accessibility Needs', jargon: 'AGGRESSIVE', tone: 'Clear' },
              { code: 'P06', name: 'Emergency Voter', jargon: 'NONE', tone: 'Urgent' },
            ].map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-[#102A43]">{p.code}</td>
                <td className="px-6 py-4 text-[#52606D]">{p.name}</td>
                <td className="px-6 py-4 text-[#0070F3] font-medium">{p.jargon}</td>
                <td className="px-6 py-4 text-[#52606D]">{p.tone}</td>
                <td className="px-6 py-4">
                  <button className="text-[#0070F3] hover:underline font-medium text-xs">Edit Rules</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
