export default function CustodyLogsList({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-20 h-20 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 font-semibold mb-2 text-lg">
          No custody records yet
        </p>
        <p className="text-sm text-gray-500">
          Add the first custody entry using the form
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log, index) => (
        <div key={log._id} className="relative">
          {index !== logs.length - 1 && (
            <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-300"></div>
          )}

          <div className="flex gap-4 pb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#1e3a8a] rounded-full flex items-center justify-center shadow-md relative z-10">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-[#1e3a8a] hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          log.purpose === "STORAGE"
                            ? "bg-blue-100 text-blue-800"
                            : log.purpose === "COURT"
                              ? "bg-purple-100 text-purple-800"
                              : log.purpose === "FSL"
                                ? "bg-green-100 text-green-800"
                                : log.purpose === "ANALYSIS"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.purpose}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.movementTimestamp).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.movementTimestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-3 rounded-r-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        FROM
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {log.fromOfficer} ({log.fromLocation})
                      </p>
                      {log.fromOfficerId && (
                        <p className="text-xs text-gray-500 mt-1">Officer ID: <span className="font-semibold">{log.fromOfficerId}</span></p>
                      )}
                    </div>

                    <svg
                      className="w-8 h-8 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>

                    <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-3 rounded-r-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        TO
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {log.toOfficer} ({log.toLocation})
                      </p>
                      {log.toOfficerId && (
                        <p className="text-xs text-gray-500 mt-1">Officer ID: <span className="font-semibold">{log.toOfficerId}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r-lg">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      REMARKS
                    </p>
                    <p className="text-sm text-gray-700">{log.remarks}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
