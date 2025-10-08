// Global setup for integration tests
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Service management for integration tests
class ServiceManager {
  constructor() {
    this.services = [];
    this.isCI = process.env.CI === 'true';
  }

  async startServices() {
    if (this.isCI) {
      console.log('🚀 CI environment detected - services will be managed by GitHub Actions');
      return;
    }

    console.log('🚀 Starting services for integration tests...');
    
    // Start frontend service
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, PORT: '3000' }
    });

    // Start agent service
    const agentProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(process.cwd(), '../agent'),
      stdio: 'pipe',
      env: { ...process.env, PORT: '3001' }
    });

    this.services.push(frontendProcess, agentProcess);

    // Wait for services to be ready
    await this.waitForServices();
  }

  async waitForServices() {
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    let waited = 0;

    while (waited < maxWaitTime) {
      try {
        const frontendHealth = await fetch('http://localhost:3000/api/health');
        const agentHealth = await fetch('http://localhost:3001/health');
        
        if (frontendHealth.ok && agentHealth.ok) {
          console.log('✅ Services are ready for integration tests');
          return;
        }
      } catch (error) {
        // Services not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    console.warn('⚠️ Services may not be fully ready, but continuing with tests...');
  }

  async stopServices() {
    if (this.isCI) {
      return;
    }

    console.log('🛑 Stopping services...');
    
    for (const service of this.services) {
      if (service && !service.killed) {
        service.kill('SIGTERM');
      }
    }

    this.services = [];
  }
}

const serviceManager = new ServiceManager();

module.exports = async () => {
  await serviceManager.startServices();
  
  // Store service manager globally for teardown
  global.__SERVICE_MANAGER__ = serviceManager;
};
