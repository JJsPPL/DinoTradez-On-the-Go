
import { spawn, SpawnOptions } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  enable?: boolean;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

let runningServers: Record<string, any> = {};

/**
 * Starts MCP servers from configuration
 * @param configPath Path to the MCP configuration file
 */
export function startMCPServers(configPath: string): void {
  try {
    // Load configuration
    const configData = fs.readFileSync(configPath, 'utf8');
    const config: MCPConfig = JSON.parse(configData);
    
    console.log(`Found ${Object.keys(config.mcpServers).length} MCP servers in configuration`);
    
    // Start each server
    for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
      if (serverConfig.enable === false) {
        console.log(`Skipping disabled server: ${name}`);
        continue;
      }
      
      startServer(name, serverConfig);
    }
    
    console.log('All enabled MCP servers started');
  } catch (error) {
    console.error(`Error starting MCP servers: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Starts a single MCP server
 */
function startServer(name: string, config: MCPServerConfig): void {
  console.log(`Starting MCP server: ${name}`);
  
  try {
    // Set up spawn options
    const spawnOptions: SpawnOptions = {
      shell: true
    };
    
    // Add environment variables if specified
    if (config.env) {
      spawnOptions.env = { ...process.env, ...config.env };
    }
    
    // Start server process
    const serverProcess = spawn(config.command, config.args, spawnOptions);
    runningServers[name] = serverProcess;
    
    // Handle output
    serverProcess.stdout?.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });
    
    serverProcess.stderr?.on('data', (data) => {
      console.error(`[${name}] Error: ${data.toString().trim()}`);
    });
    
    // Handle exit
    serverProcess.on('close', (code) => {
      console.log(`[${name}] Server exited with code ${code}`);
      delete runningServers[name];
    });
    
    console.log(`[${name}] Server started with PID: ${serverProcess.pid}`);
  } catch (error) {
    console.error(`Error starting server ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Stops all running MCP servers
 */
export function stopAllMCPServers(): void {
  console.log('Shutting down all MCP servers...');
  
  for (const [name, process] of Object.entries(runningServers)) {
    try {
      console.log(`Stopping ${name}...`);
      process.kill();
    } catch (error) {
      console.error(`Error stopping server ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  runningServers = {};
}
