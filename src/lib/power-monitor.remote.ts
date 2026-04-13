import { query } from "$app/server";

import type { PowerMonitorSnapshot } from "$lib/power-monitor";
import { getElectronServerApi } from "$lib/server/electron";

export const getElectronPowerMonitor = query(async () => {
  const { powerMonitor } = getElectronServerApi();

  return {
    onBatteryPower: powerMonitor.isOnBatteryPower(),
    platform: process.platform,
    systemIdleState: powerMonitor.getSystemIdleState(60),
    systemIdleThreshold: 60,
    systemIdleTime: powerMonitor.getSystemIdleTime(),
    thermalState:
      process.platform === "darwin"
        ? powerMonitor.getCurrentThermalState()
        : null,
  } satisfies PowerMonitorSnapshot;
});
