/**
 * In-memory client registry for Dashboard SSE broadcasts.
 * Tracks connected SSE response streams and sends real-time updates.
 */

const clients = new Set();

const addClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial handshake event
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  clients.add(res);

  // Send keep-alive heartbeat every 15 seconds to prevent connection drops
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (err) {
      clearInterval(heartbeat);
      clients.delete(res);
    }
  }, 15000);

  // Clean up when client disconnects
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
};

const broadcastDashboardUpdate = (eventPayload) => {
  if (clients.size === 0) return;

  const payload = {
    ...eventPayload,
    timestamp: eventPayload.timestamp || new Date().toISOString()
  };

  const formattedData = `event: dashboard_update\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const client of clients) {
    try {
      client.write(formattedData);
    } catch (err) {
      clients.delete(client);
    }
  }
};

const getConnectedClientCount = () => clients.size;

module.exports = {
  addClient,
  broadcastDashboardUpdate,
  getConnectedClientCount
};
