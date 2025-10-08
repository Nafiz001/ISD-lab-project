// Health monitoring middleware for Express server

const os = require('os');
const process = require('process');

// Metrics storage
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    responseTimes: []
  },
  server: {
    startTime: Date.now()
  }
};

// Request tracking middleware
const requestTracker = (req, res, next) => {
  const start = Date.now();
  metrics.requests.total++;

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Record response time
    metrics.requests.responseTimes.push(duration);
    
    // Keep only last 100 response times
    if (metrics.requests.responseTimes.length > 100) {
      metrics.requests.responseTimes.shift();
    }
    
    // Track success/error
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.errors++;
    }
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    originalSend.call(this, data);
  };

  next();
};

// Calculate average response time
const getAverageResponseTime = () => {
  if (metrics.requests.responseTimes.length === 0) return 0;
  
  const sum = metrics.requests.responseTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / metrics.requests.responseTimes.length);
};

// Get error rate percentage
const getErrorRate = () => {
  if (metrics.requests.total === 0) return 0;
  return ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2);
};

// Get server uptime
const getUptime = () => {
  const uptime = Date.now() - metrics.server.startTime;
  return {
    milliseconds: uptime,
    seconds: Math.floor(uptime / 1000),
    minutes: Math.floor(uptime / 60000),
    hours: Math.floor(uptime / 3600000),
    formatted: formatUptime(uptime)
  };
};

// Format uptime as human-readable string
const formatUptime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Get memory usage
const getMemoryUsage = () => {
  const used = process.memoryUsage();
  return {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
    percentage: ((used.heapUsed / used.heapTotal) * 100).toFixed(2) + '%'
  };
};

// Get CPU usage
const getCpuUsage = () => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);
  
  return {
    cores: cpus.length,
    model: cpus[0].model,
    usage: `${usage}%`
  };
};

// Get system info
const getSystemInfo = () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
    freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
    hostname: os.hostname()
  };
};

// Basic health check route
const healthCheck = (req, res) => {
  const health = {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: getUptime().formatted,
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(health);
};

// Detailed health check route
const detailedHealthCheck = (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    memory: getMemoryUsage(),
    cpu: getCpuUsage(),
    system: getSystemInfo(),
    metrics: {
      requests: {
        total: metrics.requests.total,
        success: metrics.requests.success,
        errors: metrics.requests.errors,
        errorRate: getErrorRate() + '%',
        averageResponseTime: getAverageResponseTime() + 'ms'
      }
    }
  };
  
  // Check if system is unhealthy
  const memoryPercentage = parseFloat(health.memory.percentage);
  const errorRate = parseFloat(getErrorRate());
  
  if (memoryPercentage > 90) {
    health.status = 'CRITICAL';
    health.warnings = health.warnings || [];
    health.warnings.push('High memory usage');
  } else if (memoryPercentage > 80) {
    health.status = 'WARNING';
    health.warnings = health.warnings || [];
    health.warnings.push('Memory usage above 80%');
  }
  
  if (errorRate > 10) {
    health.status = 'CRITICAL';
    health.warnings = health.warnings || [];
    health.warnings.push('Error rate above 10%');
  } else if (errorRate > 5) {
    health.status = 'WARNING';
    health.warnings = health.warnings || [];
    health.warnings.push('Error rate above 5%');
  }
  
  const statusCode = health.status === 'OK' ? 200 : 
                     health.status === 'WARNING' ? 200 : 503;
  
  res.status(statusCode).json(health);
};

// Metrics endpoint
const metricsEndpoint = (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    requests: {
      total: metrics.requests.total,
      success: metrics.requests.success,
      errors: metrics.requests.errors,
      errorRate: getErrorRate() + '%',
      averageResponseTime: getAverageResponseTime() + 'ms',
      recentResponseTimes: metrics.requests.responseTimes.slice(-10)
    },
    memory: getMemoryUsage(),
    cpu: getCpuUsage(),
    system: getSystemInfo()
  });
};

// Reset metrics (for testing)
const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    success: 0,
    errors: 0,
    responseTimes: []
  };
};

// Check if server is healthy
const isHealthy = () => {
  const memoryUsage = process.memoryUsage();
  const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  const errorRate = parseFloat(getErrorRate());
  
  return memoryPercentage < 90 && errorRate < 10;
};

// Setup monitoring routes
const setupMonitoring = (app) => {
  // Add request tracker middleware
  app.use(requestTracker);
  
  // Health check routes
  app.get('/health', healthCheck);
  app.get('/health/detailed', detailedHealthCheck);
  app.get('/metrics', metricsEndpoint);
  
  // Readiness probe (for Kubernetes)
  app.get('/ready', (req, res) => {
    res.json({ ready: true });
  });
  
  // Liveness probe (for Kubernetes)
  app.get('/live', (req, res) => {
    const healthy = isHealthy();
    res.status(healthy ? 200 : 503).json({ 
      alive: healthy,
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('✅ Health monitoring enabled');
  console.log('   GET /health - Basic health check');
  console.log('   GET /health/detailed - Detailed health info');
  console.log('   GET /metrics - Server metrics');
};

// Monitor and log alerts
const startAlertMonitoring = () => {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const errorRate = parseFloat(getErrorRate());
    const avgResponseTime = getAverageResponseTime();
    
    // Memory alert
    if (memoryPercentage > 90) {
      console.error('🚨 CRITICAL: Memory usage above 90%');
    } else if (memoryPercentage > 80) {
      console.warn('⚠️  WARNING: Memory usage above 80%');
    }
    
    // Error rate alert
    if (errorRate > 10) {
      console.error('🚨 CRITICAL: Error rate above 10%');
    } else if (errorRate > 5) {
      console.warn('⚠️  WARNING: Error rate above 5%');
    }
    
    // Response time alert
    if (avgResponseTime > 2000) {
      console.error('🚨 CRITICAL: Average response time above 2 seconds');
    } else if (avgResponseTime > 1000) {
      console.warn('⚠️  WARNING: Average response time above 1 second');
    }
  }, 60000); // Check every minute
  
  console.log('✅ Alert monitoring started');
};

module.exports = {
  setupMonitoring,
  startAlertMonitoring,
  requestTracker,
  healthCheck,
  detailedHealthCheck,
  metricsEndpoint,
  getMetrics: () => metrics,
  getAverageResponseTime,
  getErrorRate,
  getUptime,
  resetMetrics,
  isHealthy
};
