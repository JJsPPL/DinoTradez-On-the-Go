import { spawn } from 'cross-spawn';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the mcp_config.json file
const configPath = resolve(__dirname, '../mcp_config.json');

// Server processes map
const serverProcesses = new Map();

// Function to start a server
function startServer(name, command, args) {
  console.log(`Starting server: ${name}`);
  console.log(`Command: ${command} ${args.join(' ')}`);
  
  try {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true
    });
    
    serverProcesses.set(name, process);
    
    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data}`);
    });
    
    process.stderr.on('data', (data) => {
      console.error(`[${name}] Error: ${data}`);
    });
    
    process.on('close', (code) => {
      console.log(`[${name}] Server exited with code ${code}`);
      serverProcesses.delete(name);
    });
    
    console.log(`[${name}] Server started with PID: ${process.pid}`);
    return true;
  } catch (error) {
    console.error(`[${name}] Failed to start server: ${error.message}`);
    return false;
  }
}

// Function to stop a server
function stopServer(name) {
  const process = serverProcesses.get(name);
  if (process) {
    console.log(`Stopping server: ${name}`);
    process.kill();
    serverProcesses.delete(name);
    return true;
  }
  return false;
}

// Function to stop all servers
function stopAllServers() {
  console.log('Stopping all servers...');
  for (const [name] of serverProcesses) {
    stopServer(name);
  }
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down servers...');
  stopAllServers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down servers...');
  stopAllServers();
  process.exit(0);
});

// Main function to start all servers
async function main() {
  try {
    // Read and parse the configuration file
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const { mcpServers } = config;
    
    if (!mcpServers) {
      console.error('No MCP servers found in configuration');
      process.exit(1);
    }
    
    console.log(`Found ${Object.keys(mcpServers).length} servers in configuration`);
    
    // Start each enabled server
    for (const [name, serverConfig] of Object.entries(mcpServers)) {
      if (serverConfig.enable) {
        startServer(name, serverConfig.command, serverConfig.args);
      } else {
        console.log(`Server ${name} is disabled. Skipping.`);
      }
    }
    
    console.log('All enabled servers started.');
  } catch (error) {
    console.error('Error starting servers:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 