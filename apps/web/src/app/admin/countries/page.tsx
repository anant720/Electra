export default function CountryEditorPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">Country Editor</h2>
          <p className="text-[#52606D] mt-2">Manage supported regions, eligibility logic, and election cycles.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['IND', 'USA', 'GBR', 'CAN', 'AUS'].map(code => (
          <div key={code} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#102A43]">{code}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">ACTIVE</span>
              </div>
              <p className="text-sm text-[#52606D] mb-4">
                Configuration for voting age, ID requirements, and default scenarios.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex-1 bg-gray-50 border border-[#E2E8F0] py-2 rounded text-sm font-semibold text-[#102A43] hover:bg-gray-100 transition-colors">
                Edit Config
              </button>
              <button className="flex-1 bg-gray-50 border border-[#E2E8F0] py-2 rounded text-sm font-semibold text-[#102A43] hover:bg-gray-100 transition-colors">
                Manage Elections
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
