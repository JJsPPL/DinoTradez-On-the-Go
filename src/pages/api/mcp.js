import mcpService from '../../services/mcpService';

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                // Return the status of all MCP servers
                const serverStatuses = mcpService.getServerStatuses();
                return res.status(200).json({ success: true, servers: serverStatuses });
            } catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }

        case 'POST':
            try {
                // Connect to all MCP servers
                await mcpService.connectToServers();
                const serverStatuses = mcpService.getServerStatuses();
                return res.status(200).json({ success: true, servers: serverStatuses });
            } catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }

        case 'DELETE':
            try {
                // Disconnect from all MCP servers
                await mcpService.disconnect();
                return res.status(200).json({ success: true, message: 'All MCP servers disconnected' });
            } catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
} 