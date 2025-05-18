const { spawn } = require('cross-spawn');
const path = require('path');
const fs = require('fs');

// Load MCP server configuration
const configPath = path.join(process.cwd(), 'mcp_config.json');
let config;

try {
  const configData = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configData);
  console.log(`Found ${Object.keys(config.mcpServers).length} servers in configuration`);
} catch (error) {
  console.error(`Error loading configuration: ${error.message}`);
  process.exit(1);
}

// Store running server processes
const servers = {};

// Function to start a server
function startServer(name, serverConfig) {
  if (!serverConfig.enable) {
    console.log(`Skipping disabled server: ${name}`);
    return;
  }

  console.log(`Starting server: ${name}`);
  console.log(`Command: ${serverConfig.command} ${serverConfig.args.join(' ')}`);

  // Check if Python is set up properly
  if (serverConfig.command === 'python') {
    try {
      // Modify paths to use local project directories instead of C:\MyProgram\GitHub
      const pythonArgs = serverConfig.args.map(arg => {
        if (arg.includes('C:\\MyProgram\\GitHub\\')) {
          // Extract the server name from the path
          const serverName = arg.split('\\').pop().split('.')[0];
          // Use local ottomator-agents directory
          return path.join(process.cwd(), 'ottomator-agents', serverName, 'server.py');
        }
        return arg;
      });

      // Start the server process
      const proc = spawn(serverConfig.command, pythonArgs);
      servers[name] = proc;

      // Log process ID
      console.log(`[${name}] Server started with PID: ${proc.pid}`);

      // Handle server output
      proc.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
      });

      proc.stderr.on('data', (data) => {
        console.error(`[${name}] Error: ${data.toString().trim()}`);
      });

      // Handle server exit
      proc.on('close', (code) => {
        console.log(`[${name}] Server exited with code ${code}`);
        delete servers[name];
      });
    } catch (error) {
      console.error(`[${name}] Failed to start server: ${error.message}`);
    }
  }
}

// Start all the configured servers
for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
  startServer(name, serverConfig);
}

console.log(`All enabled servers started.`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down all servers...');
  
  for (const [name, proc] of Object.entries(servers)) {
    console.log(`Stopping ${name}...`);
    proc.kill();
  }
  
  process.exit(0);
});

// Keep the process running
process.stdin.resume(); 