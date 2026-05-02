export function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="font-extrabold text-xl text-[#102A43] tracking-tight mb-2">ELECTRA</div>
          <p className="text-sm text-[#52606D] max-w-sm">
            The civic intelligence platform. Navigate every election with verified, politically neutral guidance.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-[#102A43] mb-3 text-sm uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-sm text-[#52606D]">
            <li><a href="/verify" className="hover:text-[#0070F3]">Verify Sources</a></li>
            <li><a href="/help" className="hover:text-[#0070F3]">Troubleshooting</a></li>
            <li><a href="/register" className="hover:text-[#0070F3]">How to Register</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-[#102A43] mb-3 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2 text-sm text-[#52606D]">
            <li><a href="/privacy" className="hover:text-[#0070F3]">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-[#0070F3]">Terms of Service</a></li>
            <li><a href="/admin" className="hover:text-[#0070F3]">Admin Console</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 pt-8 border-t border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between text-xs text-[#52606D]">
        <p>© {new Date().getFullYear()} ELECTRA. Not affiliated with any political party.</p>
        <p className="mt-2 md:mt-0">Constitutional Compliance v1.1</p>
      </div>
    </footer>
  );
}
