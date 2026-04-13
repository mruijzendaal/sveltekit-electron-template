export type PowerMonitorIdleState = "active" | "idle" | "locked" | "unknown";

export type PowerMonitorThermalState =
  | "unknown"
  | "nominal"
  | "fair"
  | "serious"
  | "critical";

export interface PowerMonitorSnapshot {
  onBatteryPower: boolean;
  platform: NodeJS.Platform;
  systemIdleState: PowerMonitorIdleState;
  systemIdleThreshold: number;
  systemIdleTime: number;
  thermalState: PowerMonitorThermalState | null;
}
