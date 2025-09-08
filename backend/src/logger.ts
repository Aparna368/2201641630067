import { sendLog } from "logging-middleware";

// Allowed values for logging API
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type BackendPackage = 'cache' | 'controller' | 'db' | 'domain' | 'handler' | 'route' | 'service' | 'auth' | 'config' | 'utils';

export class Logger {

  async info(message: string, packageName: BackendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "backend",
        level: "info",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async warn(message: string, packageName: BackendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "backend",
        level: "warn",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async error(message: string, packageName: BackendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "backend",
        level: "error",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async debug(message: string, packageName: BackendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "backend",
        level: "debug",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async fatal(message: string, packageName: BackendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "backend",
        level: "fatal",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }
}

export const logger = new Logger();
