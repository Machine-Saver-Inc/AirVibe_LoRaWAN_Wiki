import { SectionType, WikiPage } from '../../types';

export const uplinkPages: WikiPage[] = [
  {
    id: 'uplink-config',
    title: 'Current Configuration Uplink',
    section: SectionType.UPLINKS,
    content: `Sent by AirVibe TPM to the Gateway to report its current settings.`,
    packetTable: {
      packetType: 4,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Identifies packet as Current Configuration', values: '4 (0x04)' },
        { byte: '1', name: 'Version', description: 'Protocol Version' },
        { byte: '2', name: 'Push Mode', description: 'Data transmission mode', values: 'overall_only 1 (0x01) | waveform_only 2 (0x02) | overall_and_waveform 3 (0x03)' },
        { byte: '3', name: 'Time Waveform Axis', description: 'Bitmask of active axes', values: 'axis_1_only 1 (0x01) | axis_2_only 2 (0x02) | axis_3_only 4 (0x04) | all_axes 7 (0x07)' },
        { byte: '4', name: 'Acceleration Range', description: 'Accelerometer full-scale range', values: '2 (0x02) | 4 (0x04) | 8 (0x08) | 16 (0x10) | 32 (0x20) | 64 (0x40)' },
        { byte: '5', name: 'Hardware Filter', description: 'Analog hardware filter setting', values: 'no_filter 0 (0x00) | hp_33Hz 23 (0x17) | hp_67Hz 22 (0x16) | hp_134Hz 21 (0x15) | hp_267Hz 20 (0x14) | hp_593Hz 19 (0x13) | hp_1335Hz 18 (0x12) | hp_2670Hz 17 (0x11) | lp_33Hz 135 (0x87) | lp_67Hz 134 (0x86) | lp_134Hz 133 (0x85) | lp_267Hz 132 (0x84) | lp_593Hz 131 (0x83) | lp_1335Hz 130 (0x82) | lp_2670Hz 129 (0x81) | lp_6675Hz 128 (0x80)' },
        { byte: '6-7', name: 'Time Waveform Push Period', description: 'Minutes between waveform pushes' },
        { byte: '8-9', name: 'Overall Push Period', description: 'Minutes between overall data pushes' },
        { byte: '10-11', name: 'Waveform Samples Per Axis', description: 'Number of samples per configured axis' },
        { byte: '12-13', name: 'High Pass Filter', description: 'Digital high pass filter frequency in Hz' },
        { byte: '14-15', name: 'Low Pass Filter', description: 'Digital low pass filter frequency in Hz' },
        { byte: '16', name: 'Window Function', description: 'Windowing function applied to waveform', values: 'none 0 (0x00) | hanning 1 (0x01) | inverse_hanning 2 (0x02) | hamming 3 (0x03) | inverse_hamming 4 (0x04)' },
        { byte: '17-18', name: 'Alarm Test Period', description: 'Minutes between alarm checks' },
        { byte: '19-20', name: 'Alarms Bitmask', description: 'Active alarms configuration', values: 'temperature 1 (0x01) | acceleration_axis1 2 (0x02) | acceleration_axis2 4 (0x04) | acceleration_axis3 8 (0x08) | velocity_axis1 16 (0x10) | velocity_axis2 32 (0x20) | velocity_axis3 64 (0x40)' },
        { byte: '21-22', name: 'Temperature Alarm Level', description: 'Threshold for temperature alarm in degrees C' },
        { byte: '23-24', name: 'Accel Axis 1 Alarm Level', description: 'Acceleration alarm threshold for Axis 1 in milli-g' },
        { byte: '25-26', name: 'Accel Axis 2 Alarm Level', description: 'Acceleration alarm threshold for Axis 2 in milli-g' },
        { byte: '27-28', name: 'Accel Axis 3 Alarm Level', description: 'Acceleration alarm threshold for Axis 3 in milli-g' },
        { byte: '29-30', name: 'Vel Axis 1 Alarm Level', description: 'Velocity alarm threshold for Axis 1 in milli-ips' },
        { byte: '31-32', name: 'Vel Axis 2 Alarm Level', description: 'Velocity alarm threshold for Axis 2 in milli-ips' },
        { byte: '33-34', name: 'Vel Axis 3 Alarm Level', description: 'Velocity alarm threshold for Axis 3 in milli-ips' },
        { byte: '35-36', name: 'TPM Firmware Rev', description: 'AirVibe TPM Firmware Version. High byte = Major, Low byte = Minor.' },
        { byte: '37-38', name: 'VSM Firmware Rev', description: 'AirVibe VSM Firmware Version. High byte = Major, Low byte = Minor.' },
        { byte: '39-40', name: 'Machine Off Threshold', description: 'Threshold in milli-g' },
      ]
    }
  },
  {
    id: 'uplink-overall',
    title: 'Overall Uplink / Alarm Uplink',
    section: SectionType.UPLINKS,
    content: `Transfers summary vibration readings, status, and battery information.

**Note:** Type 7 (Alarm Uplink) uses the same byte structure as Type 2, but the codec returns \`null\` for any measurement field whose corresponding alarm bit is NOT set in the Active Alarm Bitmask (Byte 2). This means when the sensor sends an Alarm Uplink, it only calculates and reports data for channels with active alarms to conserve battery.`,
    packetTable: {
      packetType: '2 or 7',
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Identifies packet as Overall or Alarm Uplink', values: 'overall 2 (0x02) | alarm 7 (0x07)' },
        { byte: '1', name: 'Status', description: 'Sensor status code', values: 'ok 0 (0x00) | uart_read_error 1 (0x01) | uart_read_busy 2 (0x02) | uart_read_timeout 3 (0x03) | uart_write_error 4 (0x04) | uart_write_busy 5 (0x05) | uart_write_timeout 6 (0x06) | modbus_crc_error 7 (0x07) | vsm_error 8 (0x08) | timewave_api_not_init 11 (0x0B) | timewave_collection_timeout 12 (0x0C) | timewave_bad_params 13 (0x0D) | timewave_read_error 14 (0x0E) | timewave_processing_timeout 15 (0x0F) | machine_off 16 (0x10) | missing_ack 21 (0x15)' },
        { byte: '2', name: 'Active Alarm Bitmask', description: 'Indicates which alarms are currently active', values: 'no_alarm 0 (0x00) | temperature 1 (0x01) | acceleration_axis1 2 (0x02) | acceleration_axis2 4 (0x04) | acceleration_axis3 8 (0x08) | velocity_axis1 16 (0x10) | velocity_axis2 32 (0x20) | velocity_axis3 64 (0x40)' },
        { byte: '3', name: 'Temperature', description: 'Degrees C. Signed i8, 1°C steps.' },
        { byte: '4', name: 'Voltage', description: 'Battery voltage. Formula: (Value × 10 + 2000) / 1000 Volts' },
        { byte: '5', name: 'Battery Percentage', description: 'Battery charge level as percentage' },
        { byte: '6-7', name: 'Accel Axis 1', description: 'RMS acceleration in milli-g (u16 LE)' },
        { byte: '8-9', name: 'Accel Axis 2', description: 'RMS acceleration in milli-g (u16 LE)' },
        { byte: '10-11', name: 'Accel Axis 3', description: 'RMS acceleration in milli-g (u16 LE)' },
        { byte: '12-13', name: 'Vel Axis 1', description: 'RMS velocity in milli-ips (u16 LE)' },
        { byte: '14-15', name: 'Vel Axis 2', description: 'RMS velocity in milli-ips (u16 LE)' },
        { byte: '16-17', name: 'Vel Axis 3', description: 'RMS velocity in milli-ips (u16 LE)' },
      ]
    }
  },
  {
    id: 'uplink-twf-info',
    title: 'Time Waveform Information Uplink',
    section: SectionType.UPLINKS,
    content: `Initiates a Time Waveform transfer sequence. Contains metadata about the waveform about to be sent.`,
    packetTable: {
      packetType: 3,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Identifies packet as Time Waveform Information', values: '3 (0x03)' },
        { byte: '1', name: 'Transaction ID', description: 'Unique ID for the waveform transfer' },
        { byte: '2', name: 'Segment Number', description: 'Number of the sent segment' },
        { byte: '3', name: 'Error Code', description: 'Waveform collection error status', values: 'ok 0 (0x00)' },
        { byte: '4', name: 'Axis Selection', description: 'Bitmask of active axes', values: 'axis_1_only 1 (0x01) | axis_2_only 2 (0x02) | axis_3_only 4 (0x04) | all_axes 7 (0x07)' },
        { byte: '5-6', name: 'Number of Segments', description: 'Total segments in waveform transfer' },
        { byte: '7', name: 'Hardware Filter', description: 'Hardware filter setting used during collection', values: 'no_filter 0 (0x00) | hp_33Hz 23 (0x17) | hp_67Hz 22 (0x16) | hp_134Hz 21 (0x15) | hp_267Hz 20 (0x14) | hp_593Hz 19 (0x13) | hp_1335Hz 18 (0x12) | hp_2670Hz 17 (0x11) | lp_33Hz 135 (0x87) | lp_67Hz 134 (0x86) | lp_134Hz 133 (0x85) | lp_267Hz 132 (0x84) | lp_593Hz 131 (0x83) | lp_1335Hz 130 (0x82) | lp_2670Hz 129 (0x81) | lp_6675Hz 128 (0x80)' },
        { byte: '8-9', name: 'Sampling Rate', description: 'Rate of acquisition in samples/s' },
        { byte: '10-11', name: 'Number of Samples', description: 'Samples per axis' },
      ]
    }
  },
  {
    id: 'uplink-twf-data',
    title: 'Time Waveform Data Uplink',
    section: SectionType.UPLINKS,
    content: `Carries the actual raw waveform data. If configured for a single axis, data samples are sequential for that axis. If configured for all axes, samples are interleaved (Axis 1, Axis 2, Axis 3, etc.).`,
    packetTable: {
      packetType: '1 or 5',
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Identifies segment type', values: 'data 1 (0x01) | last_data 5 (0x05)' },
        { byte: '1', name: 'Transaction ID', description: 'Matches Info Uplink' },
        { byte: '2-3', name: 'Segment Number', description: 'Segment index (0 to N-1)' },
        { byte: '4..', name: 'Data Samples', description: 'Variable length raw waveform data' },
      ]
    }
  },
  {
    id: 'uplink-upgrade-status',
    title: 'Upgrade Verification Status',
    section: SectionType.UPLINKS,
    content: `Sent during OTA firmware upgrade to report missing blocks. If all data is received, the packet is 3 bytes long: 0x11 0x00 0x00.`,
    packetTable: {
      packetType: 17,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Identifies packet as Upgrade Verification Status', values: '17 (0x11)' },
        { byte: '1', name: 'Missed Data Flag', description: 'Indicates whether data is complete or missing', values: 'complete 0 (0x00) | missing_data 1 (0x01)' },
        { byte: '2', name: 'Missed Count', description: 'Number of missed blocks listed' },
        { byte: '3-52', name: 'Missed Blocks', description: 'List of 16-bit block numbers (max 25)' },
      ]
    }
  },
];
