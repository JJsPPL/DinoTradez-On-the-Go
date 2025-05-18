import MCPServerPanel from '../components/MCPServerPanel';

export default function MCPServerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">MCP Server Manager</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <MCPServerPanel />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <p className="mb-4">
            This panel allows you to connect to and manage MCP servers from C:\MyProgram\GitHub.
            These servers can be used as data sources or tools for your application.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">Available Servers:</h3>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li><strong>mcp-server</strong> - Main MCP server for general tools and functions</li>
            <li><strong>nasdaq-data</strong> - Data source for NASDAQ stock information</li>
            <li><strong>nyse-data</strong> - Data source for NYSE stock information</li>
            <li><strong>otc-data</strong> - Data source for OTC stock information</li>
            <li><strong>stock-data</strong> - General stock data utilities</li>
          </ul>
          
          <h3 className="text-lg font-semibold mb-2">How to Use:</h3>
          <ol className="list-decimal list-inside mb-4 pl-4">
            <li>Click "Connect All" to initialize all MCP servers</li>
            <li>Select a server from the list by clicking "Use"</li>
            <li>View the data or results in the right panel</li>
            <li>Use "Refresh Data" to get the latest information</li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-md font-semibold mb-2">Note:</h3>
            <p>
              You can also start the MCP servers from the command line using:<br />
              <code className="bg-gray-100 px-2 py-1 rounded">npm run start-mcp</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 