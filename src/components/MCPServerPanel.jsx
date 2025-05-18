import { useState, useEffect } from 'react';
import mcpService from '../services/mcpService';

export default function MCPServerPanel() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeServer, setActiveServer] = useState(null);
  const [commandResults, setCommandResults] = useState(null);
  const [commandLoading, setCommandLoading] = useState(false);

  // Fetch server status directly from mcpService
  const fetchServerStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const statuses = mcpService.getServerStatuses();
      setServers(statuses);
    } catch (error) {
      setError(error.message || 'Failed to fetch server status');
    } finally {
      setLoading(false);
    }
  };

  // Connect to servers using mcpService
  const connectServers = async () => {
    try {
      setLoading(true);
      setError(null);
      const statuses = await mcpService.connectToServers();
      setServers(statuses);
    } catch (error) {
      setError(error.message || 'Failed to connect to servers');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect from servers using mcpService
  const disconnectServers = async () => {
    try {
      setLoading(true);
      setError(null);
      await mcpService.disconnect();
      setServers([]);
      setActiveServer(null);
      setCommandResults(null);
    } catch (error) {
      setError(error.message || 'Failed to disconnect from servers');
    } finally {
      setLoading(false);
    }
  };

  // Execute a command on a specific server
  const executeCommand = async (serverName, command = 'getData') => {
    try {
      setCommandLoading(true);
      const result = await mcpService.executeCommand(serverName, command);
      setCommandResults(result);
    } catch (error) {
      setError(error.message || `Failed to execute command on ${serverName}`);
    } finally {
      setCommandLoading(false);
    }
  };

  // Load initial server status
  useEffect(() => {
    connectServers();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">MCP Servers</h2>
        <p className="text-sm text-gray-500">Manage your MCP servers for data sources and additional tools</p>
      </div>
      
      {error && (
        <div className="m-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="p-4 flex space-x-2">
        <button 
          onClick={connectServers}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Connect All
        </button>
        <button 
          onClick={disconnectServers}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Disconnect All
        </button>
        <button 
          onClick={fetchServerStatus}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Refresh Status
        </button>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading servers...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Server List Panel */}
            <div className="md:w-1/2">
              <h3 className="font-bold mb-2">Available Servers</h3>
              {servers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Server</th>
                        <th className="py-2 px-4 border-b text-left">Type</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((server) => (
                        <tr key={server.name} className={activeServer === server.name ? 'bg-blue-50' : ''}>
                          <td className="py-2 px-4 border-b">{server.name}</td>
                          <td className="py-2 px-4 border-b">{server.metadata?.type || 'Unknown'}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded text-xs ${
                              server.status === 'connected' ? 'bg-green-100 text-green-800' :
                              server.status === 'disabled' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {server.status}
                            </span>
                            {server.error && <p className="text-xs text-red-600 mt-1">{server.error}</p>}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {server.status === 'connected' && (
                              <button
                                onClick={() => {
                                  setActiveServer(server.name);
                                  executeCommand(server.name);
                                }}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                              >
                                Use
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No servers connected</p>
                  <p className="text-sm mt-2">Click "Connect All" to start the MCP servers</p>
                </div>
              )}
            </div>
            
            {/* Server Details Panel */}
            <div className="md:w-1/2 bg-gray-50 rounded-md p-4">
              {activeServer ? (
                <div>
                  <h3 className="font-bold mb-4">
                    Server: {activeServer}
                  </h3>
                  
                  {commandLoading ? (
                    <div className="text-center p-4">
                      <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p>Executing command...</p>
                    </div>
                  ) : commandResults ? (
                    <div>
                      <h4 className="font-semibold mb-2">Results:</h4>
                      <div className="bg-white p-4 rounded-md border">
                        {commandResults.data ? (
                          <div>
                            <h5 className="font-medium mb-2">Data:</h5>
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead>
                                  <tr>
                                    {Object.keys(commandResults.data[0] || {}).map(key => (
                                      <th key={key} className="py-2 px-4 border-b text-left">{key}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {commandResults.data.map((item, index) => (
                                    <tr key={index}>
                                      {Object.values(item).map((value, i) => (
                                        <td key={i} className="py-2 px-4 border-b">
                                          {typeof value === 'number' ? 
                                            value.toFixed(2) : 
                                            String(value)
                                          }
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap overflow-auto p-2 text-sm">
                            {JSON.stringify(commandResults, null, 2)}
                          </pre>
                        )}
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => executeCommand(activeServer)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Refresh Data
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-gray-500">No data available</p>
                      <p className="text-sm mt-2">Execute a command to see results</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500">Select a server to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 