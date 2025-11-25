
export interface DecodedResult {
  [key: string]: any;
}

const readInt16BE = (buffer: Uint8Array, offset: number): number => {
  const val = (buffer[offset] << 8) | buffer[offset + 1];
  return (val & 0x8000) ? val | 0xFFFF0000 : val;
};

const readUInt16BE = (buffer: Uint8Array, offset: number): number => {
  return (buffer[offset] << 8) | buffer[offset + 1];
};

const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.replace(/\s+/g, '');
  if (cleanHex.length % 2 !== 0) throw new Error("Invalid hex string");
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
};

const getFilterText = (code: number): string => {
  // Simplified mapping based on Example 1
  if (code === 129) return "Low-pass 2670 Hz";
  return "Unknown Filter";
};

const getWindowText = (code: number): string => {
  switch (code) {
    case 1: return "Hanning";
    case 0: return "None";
    default: return "Unknown";
  }
};

const getAxisText = (mask: number): string => {
  const axes = [];
  if (mask & 1) axes.push("Axis 1");
  if (mask & 2) axes.push("Axis 2");
  if (mask & 4) axes.push("Axis 3");
  return axes.join(",");
};

const getAxisSelectionText = (code: number): string => {
    switch(code) {
        case 1: return "Axis 1";
        case 2: return "Axis 2";
        case 4: return "Axis 3";
        case 7: return "Axis 1,2,3";
        default: return "Unknown";
    }
}

export const decodeUplink = (hex: string, fPort: number): DecodedResult => {
  const bytes = hexToBytes(hex);
  const packetType = bytes[0];

  switch (packetType) {
    case 4: // Configuration
      return {
        PacketType: 4,
        Version: bytes[1],
        PushMode: {
          Value: bytes[2],
          Text: bytes[2] === 1 ? "Overall" : bytes[2] === 2 ? "Waveform" : "Both"
        },
        AxisMask: bytes[3],
        AxisList: [
           (bytes[3] & 1) ? "Axis 1" : null,
           (bytes[3] & 2) ? "Axis 2" : null,
           (bytes[3] & 4) ? "Axis 3" : null
        ].filter(Boolean),
        AccelerationRange_g: bytes[4],
        HardwareFilterCode: bytes[5],
        HardwareFilterText: getFilterText(bytes[5]),
        TimeWaveformPushPeriod_min: readUInt16BE(bytes, 6),
        OverallPushPeriod_min: readUInt16BE(bytes, 8),
        NumberOfSamples: readUInt16BE(bytes, 10),
        HighPassFilter_Hz: readUInt16BE(bytes, 12),
        LowPassFilter_Hz: readUInt16BE(bytes, 14),
        WindowFunction: {
          Value: bytes[16],
          Text: getWindowText(bytes[16])
        },
        AlarmTestPeriod_min: readUInt16BE(bytes, 17),
        AlarmsBitmask: readUInt16BE(bytes, 19),
        TemperatureAlarmLevel_C: readUInt16BE(bytes, 21), // Assuming scaling 1 based on example
        AccelerationAlarmLevels_milli_g: [
          readUInt16BE(bytes, 23),
          readUInt16BE(bytes, 25),
          readUInt16BE(bytes, 27)
        ],
        VelocityAlarmLevels_milli_ips: [
          readUInt16BE(bytes, 29),
          readUInt16BE(bytes, 31),
          readUInt16BE(bytes, 33)
        ],
        VSM_Firmware: `${bytes[35]}.${bytes[36]}`, // Simple mapping based on 1.25 example
        TPM_Firmware: `${bytes[37]}.${bytes[38]}`, // Simple mapping
        MachineOffThreshold_mg: readUInt16BE(bytes, 39)
      };

    case 2: // Overall
      const temp = bytes[3]; // Example 2 says 0x12 -> 18.
      const voltageByte = bytes[4];
      // Reverse engineering 0x9A (154) -> 3.54V. Factor ~0.023
      const voltage = Number((voltageByte * 0.023).toFixed(2)); 
      
      return {
        PacketType: 2,
        Status: bytes[1],
        AlarmFlag: bytes[2],
        Alarms: {
          Raw: 0, // Simplified
          Temperature: false,
          Acceleration: { Axis1: false, Axis2: false, Axis3: false },
          Velocity: { Axis1: false, Axis2: false, Axis3: false },
          ActiveList: []
        },
        TemperatureAlarmActive: false,
        AccelerationAlarmActive: false,
        VelocityAlarmActive: false,
        Temperature_C: temp,
        batteryVoltage: voltage,
        batteryLevel: bytes[5],
        Overall: {
          Acceleration_milli_g_rms: [
            readUInt16BE(bytes, 7),
            readUInt16BE(bytes, 9),
            readUInt16BE(bytes, 11)
          ],
          Velocity_milli_ips_rms: [
            readUInt16BE(bytes, 13),
            readUInt16BE(bytes, 15),
            readUInt16BE(bytes, 17)
          ]
        }
      };

    case 3: // TWF Info
      return {
        PacketType: 3,
        TransactionID: bytes[1],
        SegmentNumber: bytes[2], // Usually 0 for Info
        ErrorCode: bytes[3],
        AxisSelection: bytes[4],
        AxisSelectionText: getAxisSelectionText(bytes[4]),
        NumberOfSegments: readUInt16BE(bytes, 5),
        HardwareFilterCode: bytes[7],
        HardwareFilterText: getFilterText(bytes[7]),
        SamplingRate_Hz: readUInt16BE(bytes, 8),
        NumberOfSamplesEachAxis: readUInt16BE(bytes, 10)
      };

    case 1: // TWF Data Segment
    case 5: // TWF Data Final
      const samples = [];
      for (let i = 4; i < bytes.length; i += 2) {
        if (i + 1 < bytes.length) {
          samples.push(readInt16BE(bytes, i));
        }
      }

      const triplets = [];
      if (samples.length % 3 === 0) {
          for(let i=0; i<samples.length; i+=3) {
              triplets.push([samples[i], samples[i+1], samples[i+2]]);
          }
      }

      return {
        PacketType: packetType,
        TransactionID: bytes[1],
        SegmentNumber: readUInt16BE(bytes, 2),
        LastSegment: packetType === 5,
        Samples_i16: samples,
        Samples_Triplets_i16: triplets.length > 0 ? triplets : undefined,
        SampleCount: samples.length
      };

    case 17: // Upgrade Status
       const missedBlocks = [];
       const missedCount = bytes[2];
       if (bytes[1] === 1) {
           for (let i=0; i < missedCount; i++) {
               const offset = 3 + (i * 2);
               if (offset + 1 < bytes.length) {
                   missedBlocks.push(readUInt16BE(bytes, offset));
               }
           }
       }
       return {
           PacketType: 17,
           MissedDataFlag: bytes[1],
           MissedCount: missedCount,
           MissedBlocks: missedBlocks
       }

    default:
      return { Error: "Unknown Packet Type", Type: packetType };
  }
};
