
export interface EncoderExample {
  id: string;
  name: string;
  json: object;
}

export const encoderExamples: EncoderExample[] = [
  {
    id: 'enc1',
    name: 'Request_Configuration',
    json: {
      "fPort": 22,
      "CommandID": 2,
      "Parameters": []
    }
  },
  {
    id: 'enc2',
    name: 'Alarm_Set_OFF',
    json: {
      "fPort": 31,
      "AlarmsBitmask": 0,
      "TemperatureAlarmLevel_C": 0,
      "AccelerationAlarmLevels_mg": [0, 0, 0],
      "VelocityAlarmLevels_milli_ips": [0, 0, 0]
    }
  },
  {
    id: 'enc3',
    name: 'Alarm_Set_Accel_Only_0.5gRMS',
    json: {
      "fPort": 31,
      "AlarmsBitmask": 14,
      "TemperatureAlarmLevel_C": 0,
      "AccelerationAlarmLevels_mg": [500, 500, 500],
      "VelocityAlarmLevels_milli_ips": [0, 0, 0]
    }
  },
  {
    id: 'enc4',
    name: 'Alarm_Set_Vel_Only_0.10ipsRMS',
    json: {
      "fPort": 31,
      "AlarmsBitmask": 113,
      "TemperatureAlarmLevel_C": 0,
      "AccelerationAlarmLevels_mg": [0, 0, 0],
      "VelocityAlarmLevels_milli_ips": [100, 100, 100]
    }
  },
  {
    id: 'enc5',
    name: 'Alarm_Set_Temp_Only_50C',
    json: {
      "fPort": 31,
      "AlarmsBitmask": 1,
      "TemperatureAlarmLevel_C": 5000,
      "AccelerationAlarmLevels_mg": [0, 0, 0],
      "VelocityAlarmLevels_milli_ips": [0, 0, 0]
    }
  },
  {
    id: 'enc6',
    name: 'Configuration_Set_Overalls_Only_1m',
    json: {
      "fPort": 30,
      "Version": 2,
      "PushMode": 1,
      "AxisMask": 7,
      "AccelerationRange_g": 8,
      "HardwareFilterCode": 129,
      "TimeWaveformPushPeriod_min": 15,
      "OverallPushPeriod_min": 1,
      "NumberOfSamples": 210,
      "HighPassFilter_Hz": 2,
      "LowPassFilter_Hz": 5000,
      "WindowFunction": 1,
      "AlarmTestPeriod_min": 1,
      "MachineOffThreshold_mg": 25
    }
  },
  {
    id: 'enc7',
    name: 'Configuration_Set_Overalls_Only_5m',
    json: {
      "fPort": 30,
      "Version": 2,
      "PushMode": 1,
      "AxisMask": 7,
      "AccelerationRange_g": 8,
      "HardwareFilterCode": 129,
      "TimeWaveformPushPeriod_min": 15,
      "OverallPushPeriod_min": 5,
      "NumberOfSamples": 210,
      "HighPassFilter_Hz": 2,
      "LowPassFilter_Hz": 5000,
      "WindowFunction": 1,
      "AlarmTestPeriod_min": 5,
      "MachineOffThreshold_mg": 25
    }
  },
  {
    id: 'enc8',
    name: 'Configuration_Set_Dual-Mode_TriAxial_Maximum_Waveforms',
    json: {
      "fPort": 30,
      "Version": 2,
      "PushMode": 3,
      "AxisMask": 7,
      "AccelerationRange_g": 8,
      "HardwareFilterCode": 129,
      "TimeWaveformPushPeriod_min": 15,
      "OverallPushPeriod_min": 5,
      "NumberOfSamples": 4096,
      "HighPassFilter_Hz": 2,
      "LowPassFilter_Hz": 5000,
      "WindowFunction": 1,
      "AlarmTestPeriod_min": 5,
      "MachineOffThreshold_mg": 25
    }
  },
  {
    id: 'enc9',
    name: 'Configuration_Set_Overall-10m_Alarm-1m',
    json: {
      "fPort": 30,
      "Version": 2,
      "PushMode": 1,
      "AxisMask": 7,
      "AccelerationRange_g": 8,
      "HardwareFilterCode": 129,
      "TimeWaveformPushPeriod_min": 15,
      "OverallPushPeriod_min": 10,
      "NumberOfSamples": 210,
      "HighPassFilter_Hz": 2,
      "LowPassFilter_Hz": 5000,
      "WindowFunction": 1,
      "AlarmTestPeriod_min": 1,
      "MachineOffThreshold_mg": 25
    }
  }
];
