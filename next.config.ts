import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow development traffic from trusted local hostnames / devices.
  // Update this list if you open the app from another machine or mobile device.
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.8.193:3000",
    // Add any other dev origin you use, for example:
    // "http://192.168.1.100:3000",
  ],
};

export default nextConfig;
