// DinoTradez Configuration
var config = {
    apiKey: '7DCHKM0CLGZ5LAAJ',
    baseUrl: 'https://www.alphavantage.co/query',
    updateInterval: 300000,       // 5 minutes
    apiCallDelay: 12500,          // 12.5s between calls (free tier: 5 calls/min)
    cacheDuration: 300000,        // Cache results for 5 minutes
    enableLogging: true
};

function logMessage(message) {
    if (config.enableLogging) {
        console.log('[DinoTradez] ' + message);
    }
}
