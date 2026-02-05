// DinoTradez API Proxy — Cloudflare Worker
// Secures API keys and proxies requests to Finnhub, SEC EDGAR, FINRA

import { handleQuote } from './routes/quote.js';
import { handleFilings } from './routes/filings.js';
import { handleShortInterest } from './routes/shortInterest.js';
import { handleDarkPool } from './routes/darkPool.js';

// Rate limiting state (per-isolate, resets on new deployment)
const requestCounts = new Map();
const RATE_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_MIN = 120;

function checkRateLimit(request) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(ip);
    if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
        requestCounts.set(ip, { count: 1, windowStart: now });
        return true;
    }
    entry.count++;
    return entry.count <= MAX_REQUESTS_PER_MIN;
}

function corsHeaders(origin, env) {
    return {
        'Access-Control-Allow-Origin': origin || env.ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

const ALLOWED_ORIGINS = [
    'https://dinotradez.com',
    'https://www.dinotradez.com',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS preflight
        if (request.method === 'OPTIONS') {
            const origin = request.headers.get('Origin') || '';
            return new Response(null, {
                status: 204,
                headers: corsHeaders(origin, env)
            });
        }

        // Origin check
        const origin = request.headers.get('Origin') || '';
        if (origin && !ALLOWED_ORIGINS.includes(origin) && origin !== env.ALLOWED_ORIGIN) {
            return new Response('Forbidden', { status: 403 });
        }

        // Rate limiting
        if (!checkRateLimit(request)) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env) }
            });
        }

        let response;
        try {
            if (path === '/api/quote') {
                response = await handleQuote(request, env);
            } else if (path === '/api/filings/s3') {
                response = await handleFilings(request, env);
            } else if (path === '/api/short-interest') {
                response = await handleShortInterest(request, env);
            } else if (path === '/api/dark-pool') {
                response = await handleDarkPool(request, env);
            } else if (path === '/') {
                response = new Response(JSON.stringify({ status: 'ok', service: 'DinoTradez API Proxy' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                response = new Response('Not Found', { status: 404 });
            }
        } catch (err) {
            console.error('Worker error:', err);
            response = new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Attach CORS headers to every response
        const headers = new Headers(response.headers);
        for (const [k, v] of Object.entries(corsHeaders(origin, env))) {
            headers.set(k, v);
        }
        return new Response(response.body, { status: response.status, headers });
    }
};
