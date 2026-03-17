/**
 * IMPORTANT: This module must be the very first import in app.js.
 *
 * It overrides the Node.js DNS resolver to use Google's public DNS servers
 * (8.8.8.8 / 8.8.4.4) before any network operations run.
 *
 * Background: The local router/ISP DNS fails to resolve MongoDB Atlas SRV
 * hostnames (*.mongodb.net), causing MongoServerSelectionError on startup.
 * Google DNS resolves these correctly.
 */
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
