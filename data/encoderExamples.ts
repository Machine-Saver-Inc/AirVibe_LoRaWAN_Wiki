
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
      "data": {
        "command_id": "request_config",
        "parameters": []
      }
    }
  },
  {
    id: 'enc2',
    name: 'Alarm_Set_OFF',
    json: {
      "fPort": 31,
      "data": {
        "alarms": {
          "temperature": { "enabled": false, "threshold_c": 0 },
          "acceleration_mg": {
            "axis_1": { "enabled": false, "threshold": 0 },
            "axis_2": { "enabled": false, "threshold": 0 },
            "axis_3": { "enabled": false, "threshold": 0 }
          },
          "velocity_mips": {
            "axis_1": { "enabled": false, "threshold": 0 },
            "axis_2": { "enabled": false, "threshold": 0 },
            "axis_3": { "enabled": false, "threshold": 0 }
          }
        }
      }
    }
  },
  {
    id: 'enc3',
    name: 'Alarm_Set_Accel_Only_0.5gRMS',
    json: {
      "fPort": 31,
      "data": {
        "alarms": {
          "temperature": { "enabled": false, "threshold_c": 0 },
          "acceleration_mg": {
            "axis_1": { "enabled": true, "threshold": 500 },
            "axis_2": { "enabled": true, "threshold": 500 },
            "axis_3": { "enabled": true, "threshold": 500 }
          },
          "velocity_mips": {
            "axis_1": { "enabled": false, "threshold": 0 },
            "axis_2": { "enabled": false, "threshold": 0 },
            "axis_3": { "enabled": false, "threshold": 0 }
          }
        }
      }
    }
  },
  {
    id: 'enc4',
    name: 'Alarm_Set_Vel_Only_0.10ipsRMS',
    json: {
      "fPort": 31,
      "data": {
        "alarms": {
          "temperature": { "enabled": true, "threshold_c": 0 },
          "acceleration_mg": {
            "axis_1": { "enabled": false, "threshold": 0 },
            "axis_2": { "enabled": false, "threshold": 0 },
            "axis_3": { "enabled": false, "threshold": 0 }
          },
          "velocity_mips": {
            "axis_1": { "enabled": true, "threshold": 100 },
            "axis_2": { "enabled": true, "threshold": 100 },
            "axis_3": { "enabled": true, "threshold": 100 }
          }
        }
      }
    }
  },
  {
    id: 'enc5',
    name: 'Alarm_Set_Temp_Only_50C',
    json: {
      "fPort": 31,
      "data": {
        "alarms": {
          "temperature": { "enabled": true, "threshold_c": 50 },
          "acceleration_mg": {
            "axis_1": { "enabled": false, "threshold": 0 },
            "axis_2": { "enabled": false, "threshold": 0 },
            "axis_3": { "enabled": false, "threshold": 0 }
          },
          "velocity_mips": {
            "axis_1": { "enabled": false, "threshold": 0 },
            "axis_2": { "enabled": false, "threshold": 0 },
            "axis_3": { "enabled": false, "threshold": 0 }
          }
        }
      }
    }
  },
  {
    id: 'enc6',
    name: 'Configuration_Set_Overalls_Only_1m',
    json: {
      "fPort": 30,
      "data": {
        "version": 2,
        "device_settings": {
          "push_mode": "overall_only",
          "accel_range_g": 8,
          "hw_filter": "lp_2670_hz",
          "machine_off_threshold_mg": 25
        },
        "waveform_config": {
          "push_period_min": 15,
          "samples_per_axis": 210,
          "active_axes": { "axis_1": true, "axis_2": true, "axis_3": true }
        },
        "vibration_config": {
          "overall_push_period_min": 1,
          "high_pass_filter_hz": 2,
          "low_pass_filter_hz": 5000,
          "window_function": "hanning"
        },
        "alarms": { "test_period_min": 1 }
      }
    }
  },
  {
    id: 'enc7',
    name: 'Configuration_Set_Overalls_Only_5m',
    json: {
      "fPort": 30,
      "data": {
        "version": 2,
        "device_settings": {
          "push_mode": "overall_only",
          "accel_range_g": 8,
          "hw_filter": "lp_2670_hz",
          "machine_off_threshold_mg": 25
        },
        "waveform_config": {
          "push_period_min": 15,
          "samples_per_axis": 210,
          "active_axes": { "axis_1": true, "axis_2": true, "axis_3": true }
        },
        "vibration_config": {
          "overall_push_period_min": 5,
          "high_pass_filter_hz": 2,
          "low_pass_filter_hz": 5000,
          "window_function": "hanning"
        },
        "alarms": { "test_period_min": 5 }
      }
    }
  },
  {
    id: 'enc8',
    name: 'Configuration_Set_Dual-Mode_TriAxial_Maximum_Waveforms',
    json: {
      "fPort": 30,
      "data": {
        "version": 2,
        "device_settings": {
          "push_mode": "overall_and_waveform",
          "accel_range_g": 8,
          "hw_filter": "lp_2670_hz",
          "machine_off_threshold_mg": 25
        },
        "waveform_config": {
          "push_period_min": 15,
          "samples_per_axis": 4096,
          "active_axes": { "axis_1": true, "axis_2": true, "axis_3": true }
        },
        "vibration_config": {
          "overall_push_period_min": 5,
          "high_pass_filter_hz": 2,
          "low_pass_filter_hz": 5000,
          "window_function": "hanning"
        },
        "alarms": { "test_period_min": 5 }
      }
    }
  },
  {
    id: 'enc9',
    name: 'Configuration_Set_Overall-10m_Alarm-1m',
    json: {
      "fPort": 30,
      "data": {
        "version": 2,
        "device_settings": {
          "push_mode": "overall_only",
          "accel_range_g": 8,
          "hw_filter": "lp_2670_hz",
          "machine_off_threshold_mg": 25
        },
        "waveform_config": {
          "push_period_min": 15,
          "samples_per_axis": 210,
          "active_axes": { "axis_1": true, "axis_2": true, "axis_3": true }
        },
        "vibration_config": {
          "overall_push_period_min": 10,
          "high_pass_filter_hz": 2,
          "low_pass_filter_hz": 5000,
          "window_function": "hanning"
        },
        "alarms": { "test_period_min": 1 }
      }
    }
  }
];
