# Production Monitoring & Maintenance Guide

## 🎯 Overview

Comprehensive guide for monitoring and maintaining the e-commerce platform in production environment.

## 📊 Monitoring Components

### 1. Application Health Monitoring
### 2. Performance Metrics
### 3. Error Tracking & Logging
### 4. Database Monitoring
### 5. Payment Gateway Monitoring
### 6. User Activity Analytics

---

## 🏥 Health Check Endpoints

### Server Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-10-08T10:00:00Z",
  "uptime": 86400,
  "environment": "production"
}
```

### Detailed Health Check
```http
GET /health/detailed
```

**Response:**
```json
{
  "status": "OK",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "payment": "healthy",
    "storage": "healthy"
  },
  "metrics": {
    "memory": {
      "used": "512MB",
      "total": "1GB"
    },
    "cpu": "45%",
    "requests": {
      "total": 10000,
      "lastHour": 1500
    }
  }
}
```

---

## 📈 Performance Metrics

### Key Performance Indicators (KPIs)

#### 1. **Response Time**
- **Target**: < 200ms for API calls
- **Alert Threshold**: > 1000ms

```javascript
// Monitor API response times
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    // Send to analytics
    logMetric('api.response_time', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  
  next();
};
```

#### 2. **Error Rate**
- **Target**: < 1%
- **Alert Threshold**: > 5%

```javascript
// Track error rates
const errorRate = {
  total: 0,
  errors: 0,
  
  record(isError) {
    this.total++;
    if (isError) this.errors++;
  },
  
  getRate() {
    return (this.errors / this.total) * 100;
  },
  
  reset() {
    this.total = 0;
    this.errors = 0;
  }
};
```

#### 3. **Throughput**
- **Target**: > 100 requests/second
- **Monitor**: Requests per minute/hour

#### 4. **Database Query Performance**
- **Target**: < 100ms per query
- **Monitor**: Slow queries, connection pool

---

## 🐛 Error Tracking & Logging

### Logging Levels

```javascript
const logLevels = {
  ERROR: 'error',    // Critical issues
  WARN: 'warn',      // Warning messages
  INFO: 'info',      // General information
  DEBUG: 'debug'     // Debug information
};
```

### Error Logging Implementation

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write errors to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    // Also log to console in development
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.error('Payment failed', { 
  orderId: 'ORD-123', 
  error: err.message 
});

logger.info('Order placed', { 
  orderId: 'ORD-123', 
  userId: 'user-123' 
});
```

### Error Categories

1. **System Errors** (500 errors)
   - Server crashes
   - Database connection failures
   - Out of memory errors

2. **Application Errors** (400 errors)
   - Validation failures
   - Authentication errors
   - Business logic errors

3. **External Service Errors**
   - Payment gateway failures
   - Email service failures
   - Third-party API errors

---

## 💾 Database Monitoring

### Firebase Firestore Monitoring

#### 1. **Read/Write Operations**
```javascript
// Monitor Firestore operations
const firestoreMetrics = {
  reads: 0,
  writes: 0,
  deletes: 0,
  
  trackRead() {
    this.reads++;
  },
  
  trackWrite() {
    this.writes++;
  },
  
  getMetrics() {
    return {
      reads: this.reads,
      writes: this.writes,
      deletes: this.deletes,
      total: this.reads + this.writes + this.deletes
    };
  }
};
```

#### 2. **Query Performance**
- Monitor slow queries (> 100ms)
- Identify missing indexes
- Optimize frequently used queries

#### 3. **Database Size**
- Track document count
- Monitor storage usage
- Set up alerts for quota limits

```javascript
// Check Firestore usage
const checkFirestoreUsage = async () => {
  const collections = ['products', 'orders', 'users'];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).count().get();
    console.log(`${collectionName}: ${snapshot.data().count} documents`);
  }
};
```

---

## 💳 Payment Gateway Monitoring

### bKash Payment Monitoring

```javascript
// Monitor payment success rate
const paymentMetrics = {
  total: 0,
  successful: 0,
  failed: 0,
  pending: 0,
  
  record(status) {
    this.total++;
    if (status === 'Completed') this.successful++;
    else if (status === 'Failed') this.failed++;
    else this.pending++;
  },
  
  getSuccessRate() {
    return (this.successful / this.total) * 100;
  }
};
```

### Payment Alerts

- **Failed Payment Rate** > 10%
- **Pending Payments** > 24 hours
- **Gateway Response Time** > 5 seconds

---

## 📱 User Activity Analytics

### Track User Engagement

```javascript
// User activity metrics
const userMetrics = {
  activeUsers: new Set(),
  pageViews: 0,
  orders: 0,
  cartAdditions: 0,
  
  trackUser(userId) {
    this.activeUsers.add(userId);
  },
  
  trackPageView() {
    this.pageViews++;
  },
  
  trackOrder() {
    this.orders++;
  },
  
  getMetrics() {
    return {
      activeUsers: this.activeUsers.size,
      pageViews: this.pageViews,
      orders: this.orders,
      conversionRate: (this.orders / this.activeUsers.size) * 100
    };
  }
};
```

---

## 🔔 Alert System

### Alert Thresholds

```javascript
const alerts = {
  // Server alerts
  serverDown: {
    condition: () => !isServerHealthy(),
    severity: 'critical',
    message: 'Server is down!'
  },
  
  // Performance alerts
  highResponseTime: {
    condition: () => getAverageResponseTime() > 1000,
    severity: 'warning',
    message: 'High response time detected'
  },
  
  // Error alerts
  highErrorRate: {
    condition: () => errorRate.getRate() > 5,
    severity: 'critical',
    message: 'Error rate exceeded 5%'
  },
  
  // Payment alerts
  paymentFailure: {
    condition: () => paymentMetrics.getSuccessRate() < 90,
    severity: 'critical',
    message: 'Payment success rate below 90%'
  },
  
  // Database alerts
  databaseSlow: {
    condition: () => getAverageQueryTime() > 100,
    severity: 'warning',
    message: 'Database queries are slow'
  }
};

// Check alerts periodically
setInterval(() => {
  Object.entries(alerts).forEach(([name, alert]) => {
    if (alert.condition()) {
      sendAlert(alert.severity, alert.message);
    }
  });
}, 60000); // Check every minute
```

### Alert Channels

1. **Email Notifications**
   - Critical errors
   - Daily summaries
   - Weekly reports

2. **SMS Alerts**
   - Server down
   - Critical payment failures
   - Security incidents

3. **Dashboard Alerts**
   - Real-time notifications
   - Warning indicators
   - Status badges

---

## 🔧 Maintenance Tasks

### Daily Tasks

#### 1. **Log Review**
```bash
# Check error logs
tail -f logs/error.log

# Review last 100 errors
tail -n 100 logs/error.log | grep ERROR

# Count errors by type
grep ERROR logs/error.log | cut -d':' -f2 | sort | uniq -c
```

#### 2. **Health Check**
```bash
# Check server status
curl http://localhost:5000/health

# Test all API endpoints
./scripts/test-endpoints.sh
```

#### 3. **Database Cleanup**
```javascript
// Remove expired sessions
const cleanupExpiredSessions = async () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - 30); // 30 days ago
  
  const snapshot = await db.collection('sessions')
    .where('expiresAt', '<', expiryDate)
    .get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  console.log(`Deleted ${snapshot.size} expired sessions`);
};
```

### Weekly Tasks

#### 1. **Performance Review**
- Analyze response times
- Identify slow endpoints
- Review database queries
- Check cache hit rates

#### 2. **Security Audit**
- Review access logs
- Check failed login attempts
- Update dependencies
- Scan for vulnerabilities

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

#### 3. **Backup Verification**
- Verify database backups
- Test restore procedures
- Check backup storage

### Monthly Tasks

#### 1. **Capacity Planning**
- Review resource usage
- Analyze traffic patterns
- Plan for scaling
- Update infrastructure

#### 2. **Cost Analysis**
- Review Firebase usage
- Analyze payment gateway fees
- Optimize resource allocation

#### 3. **Feature Review**
- Analyze feature usage
- Identify unused features
- Plan feature improvements

---

## 📊 Monitoring Dashboard

### Real-Time Metrics Display

```javascript
// Express endpoint for metrics
app.get('/metrics', (req, res) => {
  res.json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    api: {
      totalRequests: requestMetrics.total,
      errorRate: errorRate.getRate(),
      averageResponseTime: getAverageResponseTime()
    },
    database: firestoreMetrics.getMetrics(),
    payment: {
      total: paymentMetrics.total,
      successful: paymentMetrics.successful,
      failed: paymentMetrics.failed,
      successRate: paymentMetrics.getSuccessRate()
    },
    users: userMetrics.getMetrics()
  });
});
```

### Dashboard Features

1. **Real-Time Graphs**
   - Request rate over time
   - Response time trends
   - Error rate chart
   - Active users count

2. **Status Indicators**
   - Server status (🟢 Green / 🔴 Red)
   - Database status
   - Payment gateway status
   - CDN status

3. **Recent Events**
   - Latest errors
   - Recent orders
   - Failed payments
   - Security events

---

## 🚨 Incident Response

### Incident Response Plan

#### 1. **Detection**
- Alert received
- User report
- Monitoring system

#### 2. **Assessment**
- Determine severity
- Identify affected services
- Estimate impact

#### 3. **Response**
- Follow runbook
- Notify stakeholders
- Begin mitigation

#### 4. **Resolution**
- Fix the issue
- Verify fix works
- Monitor for recurrence

#### 5. **Post-Mortem**
- Document incident
- Analyze root cause
- Implement prevention

### Common Incidents & Solutions

#### Server Down
```bash
# Check server status
systemctl status app

# Restart server
pm2 restart all

# Check logs
pm2 logs
```

#### Database Connection Lost
```javascript
// Implement retry logic
const connectWithRetry = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await db.connect();
      console.log('Database connected');
      return;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Failed to connect to database');
};
```

#### Payment Gateway Down
- Switch to fallback payment method (COD)
- Display maintenance message
- Queue payments for retry
- Notify customers

---

## 🔒 Security Monitoring

### Security Checklist

- [ ] Monitor failed login attempts
- [ ] Track unusual API activity
- [ ] Check for SQL injection attempts
- [ ] Monitor file upload activity
- [ ] Review admin access logs
- [ ] Check for DDoS attacks
- [ ] Verify SSL certificate validity
- [ ] Monitor for data breaches

### Security Alerts

```javascript
// Monitor suspicious activity
const securityMonitor = {
  failedLogins: new Map(),
  
  trackFailedLogin(email, ip) {
    const key = `${email}:${ip}`;
    const count = (this.failedLogins.get(key) || 0) + 1;
    this.failedLogins.set(key, count);
    
    // Alert if too many failed attempts
    if (count > 5) {
      sendSecurityAlert('Multiple failed login attempts', {
        email,
        ip,
        count
      });
    }
  }
};
```

---

## 📦 Deployment Monitoring

### Deployment Checklist

- [ ] Run tests before deployment
- [ ] Create database backup
- [ ] Update environment variables
- [ ] Deploy to staging first
- [ ] Smoke test critical features
- [ ] Monitor error rates post-deployment
- [ ] Have rollback plan ready

### Post-Deployment Monitoring

```javascript
// Enhanced monitoring after deployment
const postDeploymentMonitoring = {
  enabled: true,
  duration: 3600000, // 1 hour
  startTime: Date.now(),
  
  isActive() {
    return this.enabled && 
           (Date.now() - this.startTime) < this.duration;
  },
  
  checkMetrics() {
    if (!this.isActive()) return;
    
    // More aggressive monitoring
    if (errorRate.getRate() > 2) {
      sendAlert('critical', 'High error rate after deployment');
    }
  }
};
```

---

## 📞 Contact Information

### On-Call Rotation

| Time | Person | Phone | Email |
|------|--------|-------|-------|
| Mon-Wed | Engineer 1 | +880... | eng1@domain.com |
| Thu-Fri | Engineer 2 | +880... | eng2@domain.com |
| Weekend | Engineer 3 | +880... | eng3@domain.com |

### Escalation Path

1. **Level 1**: On-call engineer
2. **Level 2**: Team lead
3. **Level 3**: CTO

---

## 🛠️ Useful Commands

### Server Management
```bash
# Check server status
pm2 status

# View logs
pm2 logs

# Restart server
pm2 restart app

# Monitor resources
pm2 monit
```

### Database Management
```bash
# Backup Firestore
gcloud firestore export gs://bucket-name/backups

# Restore Firestore
gcloud firestore import gs://bucket-name/backups/export-date
```

### Log Analysis
```bash
# Find errors in last hour
grep ERROR logs/combined.log | tail -n 100

# Count requests by status code
grep "status:" logs/access.log | cut -d':' -f2 | sort | uniq -c

# Monitor live logs
tail -f logs/combined.log | grep ERROR
```

---

## 📖 Resources

- [Firebase Console](https://console.firebase.google.com)
- [Server Dashboard](http://your-domain.com/admin)
- [Error Tracking](http://sentry.io)
- [Payment Gateway Dashboard](https://merchant.bka sh.com)
- [Documentation](http://docs.your-domain.com)

---

**Version**: 1.0.0  
**Last Updated**: October 8, 2025  
**Next Review**: November 8, 2025
