import config from '../../config.js';

class MCPService {
    constructor() {
        this.servers = {};
        this.config = null;
        this.isConnected = false;
    }

    async initialize() {
        try {
            // Load the MCP configuration
            // For browser environments, fetch the config file
            if (typeof window !== 'undefined') {
                const response = await fetch(config.mcp.configPath);
                if (!response.ok) {
                    throw new Error(`Failed to load MCP config: ${response.statusText}`);
                }
                this.config = await response.json();
            } else {
                // For server-side (Node.js) environments, require the file directly
                // This is a simplification - in a real app you'd use dynamic import or fs
                this.config = { mcpServers: {} };
                console.warn('Running in Node.js environment, MCP config loading is limited');
            }
            
            console.log('MCP configuration loaded:', this.config);
            return true;
        } catch (error) {
            console.error('Error initializing MCP service:', error);
            return false;
        }
    }

    async connectToServers() {
        if (!this.config) {
            await this.initialize();
        }

        console.log('Connecting to MCP servers...');
        const { mcpServers } = this.config;
        
        // For simplicity in the browser environment, we're simulating server connections
        // In a real implementation, we'd use WebSockets or server-side communication to actually
        // control the MCP servers that are launched by the start-mcp-servers.js script
        for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
            if (serverConfig.enable) {
                try {
                    console.log(`Connecting to ${serverName} MCP server...`);
                    
                    // Start a fake server connection process
                    // In a real implementation, this would connect to the running server processes
                    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate connection time
                    
                    this.servers[serverName] = {
                        name: serverName,
                        config: serverConfig,
                        status: 'connected',
                        // Add some metadata about the server for display
                        metadata: {
                            type: serverName.includes('data') ? 'Data Source' : 'Tool',
                            command: serverConfig.command,
                            args: serverConfig.args.join(' ')
                        }
                    };
                    console.log(`Successfully connected to ${serverName}`);
                } catch (error) {
                    console.error(`Failed to connect to ${serverName}:`, error);
                    this.servers[serverName] = {
                        name: serverName,
                        config: serverConfig,
                        status: 'error',
                        error: error.message
                    };
                }
            } else {
                console.log(`Server ${serverName} is disabled, skipping.`);
                this.servers[serverName] = {
                    name: serverName,
                    config: serverConfig,
                    status: 'disabled'
                };
            }
        }

        this.isConnected = true;
        return this.getServerStatuses();
    }

    getServerStatuses() {
        return Object.values(this.servers).map(server => ({
            name: server.name,
            status: server.status,
            error: server.error,
            metadata: server.metadata
        }));
    }

    async disconnect() {
        console.log('Disconnecting from all MCP servers...');
        
        // In a real implementation, this would send signals to stop the running server processes
        // or communicate with the start-mcp-servers.js script to stop them
        
        this.servers = {};
        this.isConnected = false;
        return true;
    }
    
    // Method to execute a command on a specific MCP server
    async executeCommand(serverName, command, params = {}) {
        if (!this.servers[serverName] || this.servers[serverName].status !== 'connected') {
            throw new Error(`Server ${serverName} is not connected`);
        }
        
        console.log(`Executing command on ${serverName}:`, command, params);
        
        // In a real implementation, this would send the command to the server process
        // and return the result
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return a fake result based on the server name
        if (serverName === 'mcp-server') {
            return {
                success: true,
                result: `Executed ${command} with parameters ${JSON.stringify(params)}`
            };
        } else if (serverName.includes('data')) {
            // For data servers, return some sample data
            return {
                success: true,
                data: [
                    { symbol: 'AAPL', price: 175.34, change: 1.25 },
                    { symbol: 'MSFT', price: 332.42, change: -0.75 },
                    { symbol: 'GOOGL', price: 128.11, change: 0.33 }
                ]
            };
        }
        
        return { success: true, message: 'Command executed' };
    }
}

// Create and export a singleton instance
const mcpService = new MCPService();
export default mcpService; 