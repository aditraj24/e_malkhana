export default function Footer() {
  return (
    <footer className="bg-[#1e3a8a] text-white mt-16 shadow-inner">
      <div className="px-4 py-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#1e3a8a] font-bold text-sm">EM</span>
              </div>
              <span className="text-lg font-bold">e-Malkhana</span>
            </div>
          </div>
          <div className="text-sm text-blue-200 space-y-1">
            <p className="font-semibold">Digital Evidence Management System</p>
            <p>© 2025 Government of India. All rights reserved.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-700">
            <p className="text-xs text-blue-300">
              Secure • Transparent • Efficient
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}