export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface WifiNetwork {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}

// Per WiFi QR spec — escape \ ; , " :
function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

export function buildWifiString({
  ssid,
  password,
  security,
  hidden,
}: WifiNetwork): string {
  if (!ssid.trim()) return "";
  const t = security === "nopass" ? "nopass" : security;
  const parts = [
    `T:${t}`,
    `S:${escapeWifi(ssid)}`,
  ];
  if (security !== "nopass" && password) {
    parts.push(`P:${escapeWifi(password)}`);
  }
  if (hidden) {
    parts.push("H:true");
  }
  return `WIFI:${parts.join(";")};;`;
}

export function buildShareText({
  ssid,
  password,
  security,
  hidden,
}: WifiNetwork): string {
  const lines = [`WiFi: ${ssid}`];
  if (security !== "nopass") lines.push(`Password: ${password}`);
  lines.push(`Security: ${security === "nopass" ? "Open" : security}`);
  if (hidden) lines.push("Hidden network: Yes");
  return lines.join("\n");
}
