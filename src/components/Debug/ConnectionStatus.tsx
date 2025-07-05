import React, { useState, useEffect } from "react";
import { testSupabaseConnection } from "../../lib/supabase";

export const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean;
    connected: boolean;
    error?: string;
  }>({ loading: true, connected: false });

  const testConnection = async () => {
    setConnectionStatus({ loading: true, connected: false });
    const result = await testSupabaseConnection();
    setConnectionStatus({
      loading: false,
      connected: result.success,
      error: result.error,
    });
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (connectionStatus.loading) return "text-yellow-600";
    return connectionStatus.connected ? "text-green-600" : "text-red-600";
  };

  const getStatusText = () => {
    if (connectionStatus.loading) return "Testing connection...";
    return connectionStatus.connected
      ? "Connected to Supabase"
      : "Connection failed";
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${connectionStatus.loading ? "bg-yellow-500" : connectionStatus.connected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <button
          onClick={testConnection}
          disabled={connectionStatus.loading}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Again
        </button>
      </div>

      {connectionStatus.error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-xs">
          <strong>Error:</strong> {connectionStatus.error}
        </div>
      )}

      {!connectionStatus.connected && !connectionStatus.loading && (
        <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-200 text-xs">
          <strong>Troubleshooting:</strong>
          <ul className="mt-1 list-disc list-inside">
            <li>Check if your Supabase project is active (not paused)</li>
            <li>Verify CORS settings in Supabase dashboard</li>
            <li>Ensure environment variables are correct</li>
          </ul>
        </div>
      )}
    </div>
  );
};
