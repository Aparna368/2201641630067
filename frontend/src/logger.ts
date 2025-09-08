import { sendLog } from "logging-middleware/dist/browser-client";

// Allowed values for logging API
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'utils';

export class Logger {

  async info(message: string, packageName: FrontendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "frontend",
        level: "info",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async warn(message: string, packageName: FrontendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "frontend",
        level: "warn",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async error(message: string, packageName: FrontendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "frontend",
        level: "error",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async debug(message: string, packageName: FrontendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "frontend",
        level: "debug",
        package: packageName,
        message,
        ...(metadata && { metadata })
      });
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }

  async fatal(message: string, packageName: FrontendPackage, metadata?: any) {
    try {
      await sendLog({
        stack: "frontend",
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
