export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#102A43] text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="font-extrabold text-xl tracking-tight">ELECTRA ADMIN</span>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3 text-sm font-medium">
            <li><a href="/admin" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90">Dashboard</a></li>
            <li className="pt-4 pb-2 px-3 text-xs font-bold text-white/50 uppercase tracking-wider">Governance</li>
            <li><a href="/admin/axioms" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90">Axiom Validator</a></li>
            <li><a href="/admin/sources" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90">Source Registry</a></li>
            <li><a href="/admin/volatility" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90 text-[#D4AF37]">Volatility Approvals</a></li>
            <li className="pt-4 pb-2 px-3 text-xs font-bold text-white/50 uppercase tracking-wider">Configuration</li>
            <li><a href="/admin/countries" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90">Country Editor</a></li>
            <li><a href="/admin/personas" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90">Persona Editor</a></li>
            <li className="pt-4 pb-2 px-3 text-xs font-bold text-white/50 uppercase tracking-wider">System</li>
            <li><a href="/admin/audit" className="block px-3 py-2 rounded hover:bg-white/10 text-white/90">Audit Logs</a></li>
            <li><a href="/admin/security" className="block px-3 py-2 rounded hover:bg-white/10 text-[#C0392B] font-bold">Security Alerts</a></li>
          </ul>
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          Logged in as SUPER_ADMIN
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-[#102A43]">Admin Workspace</h1>
          <a href="/dashboard" className="text-sm text-[#0070F3] hover:underline font-medium">Exit to App →</a>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
