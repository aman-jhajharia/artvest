import { HealthStatus } from '../types/index.js';
import { checkDatabaseConnection } from '../config/database.js';
import { config } from '../config/index.js';

const startTime = Date.now();

export class HealthService {
  public static async getHealthStatus(): Promise<HealthStatus> {
    const isDbConnected = await checkDatabaseConnection();

    return {
      status: isDbConnected ? 'healthy' : 'degraded',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.env,
      services: {
        database: isDbConnected ? 'connected' : 'disconnected',
      },
    };
  }
}
