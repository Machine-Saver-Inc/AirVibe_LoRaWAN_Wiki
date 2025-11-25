
export const toHex = (value: number, bytes: number): string => {
  const hex = (value >>> 0).toString(16).toUpperCase();
  return hex.padStart(bytes * 2, '0').slice(-(bytes * 2)); // Ensure correct length
};

export const encodeDownlink = (input: any): { hex: string, fPort: number, error?: string } => {
  try {
    const fPort = input.fPort;
    if (fPort === undefined) throw new Error("fPort is required in the input JSON.");

    let hex = '';

    switch (fPort) {
      case 22: // Command Downlink
        {
          const cmdId = input.CommandID;
          if (cmdId === undefined) throw new Error("CommandID is required for Port 22.");
          hex += toHex(cmdId, 2);
          
          if (Array.isArray(input.Parameters)) {
              // Assuming parameters are just bytes or need specific handling per command
              // For the example provided, Parameters is empty. 
              // If there were parameters, logic would be needed here.
              // For generic byte arrays:
              // input.Parameters.forEach((p: number) => hex += toHex(p, 1));
          }
        }
        break;

      case 30: // Configuration Downlink
        {
          hex += toHex(input.Version ?? 2, 1);
          hex += toHex(input.PushMode ?? 1, 1);
          hex += toHex(input.AxisMask ?? 7, 1);
          hex += toHex(input.AccelerationRange_g ?? 8, 1);
          hex += toHex(input.HardwareFilterCode ?? 129, 1);
          hex += toHex(input.TimeWaveformPushPeriod_min ?? 15, 2);
          hex += toHex(input.OverallPushPeriod_min ?? 5, 2);
          hex += toHex(input.NumberOfSamples ?? 210, 2);
          hex += toHex(input.HighPassFilter_Hz ?? 2, 2);
          hex += toHex(input.LowPassFilter_Hz ?? 5000, 2);
          hex += toHex(input.WindowFunction ?? 1, 1);
          hex += toHex(input.AlarmTestPeriod_min ?? 1, 2);
          hex += toHex(input.MachineOffThreshold_mg ?? 30, 2);
        }
        break;

      case 31: // Alarms Downlink
        {
          hex += toHex(input.AlarmsBitmask ?? 0, 2);
          hex += toHex(input.TemperatureAlarmLevel_C ?? 0, 2);
          
          const accels = input.AccelerationAlarmLevels_mg || [0, 0, 0];
          accels.forEach((val: number) => hex += toHex(val, 2));
          
          const vels = input.VelocityAlarmLevels_milli_ips || [0, 0, 0];
          vels.forEach((val: number) => hex += toHex(val, 2));
        }
        break;

      default:
        throw new Error(`Encoding for fPort ${fPort} is not supported yet.`);
    }

    return { hex, fPort };

  } catch (e: any) {
    return { hex: '', fPort: input?.fPort || 0, error: e.message };
  }
};
