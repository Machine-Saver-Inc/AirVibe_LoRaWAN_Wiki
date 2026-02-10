import { SectionType, WikiPage } from '../../types';

export const downlinkPages: WikiPage[] = [
  {
    id: 'downlink-config',
    title: 'Configuration Downlink',
    section: SectionType.DOWNLINKS,
    content: `Configures the AirVibe sensor parameters.`,
    packetTable: {
      port: 30,
      fields: [
        { byte: '0', name: 'Version', description: 'Protocol Version', values: '2 (0x02)', default: '2' },
        { byte: '1', name: 'Push Mode', description: 'Data transmission mode', values: 'overall_only 1 (0x01) | waveform_only 2 (0x02) | overall_and_waveform 3 (0x03)', default: '0x01' },
        { byte: '2', name: 'Axis', description: 'Bitmask of active axes', values: 'axis_1_only 1 (0x01) | axis_2_only 2 (0x02) | axis_3_only 4 (0x04) | all_axes 7 (0x07)', default: '0x07' },
        { byte: '3', name: 'Accel Range', description: 'Accelerometer full-scale range in g', values: '2 (0x02) | 4 (0x04) | 8 (0x08) | 16 (0x10) | 32 (0x20) | 64 (0x40)', default: '8' },
        { byte: '4', name: 'Hardware Filter', description: 'Analog hardware filter setting', values: 'no_filter 0 (0x00) | hp_33Hz 23 (0x17) | hp_67Hz 22 (0x16) | hp_134Hz 21 (0x15) | hp_267Hz 20 (0x14) | hp_593Hz 19 (0x13) | hp_1335Hz 18 (0x12) | hp_2670Hz 17 (0x11) | lp_33Hz 135 (0x87) | lp_67Hz 134 (0x86) | lp_134Hz 133 (0x85) | lp_267Hz 132 (0x84) | lp_593Hz 131 (0x83) | lp_1335Hz 130 (0x82) | lp_2670Hz 129 (0x81) | lp_6675Hz 128 (0x80)', default: '129' },
        { byte: '5-6', name: 'Time Waveform Push Period', description: 'Minutes between waveform pushes (15 - 44640)', default: '15' },
        { byte: '7-8', name: 'Overall Push Period', description: 'Minutes between overall data pushes (1 - 744)', default: '5' },
        { byte: '9-10', name: 'Sample Count', description: 'Samples per axis: 1..12288 (1 axis) or 4096 (3 axis)', default: '210' },
        { byte: '11-12', name: 'High Pass Filter', description: 'Digital high pass filter frequency in Hz (0 - 65535)', default: '2' },
        { byte: '13-14', name: 'Low Pass Filter', description: 'Digital low pass filter frequency in Hz (0 - 65535)', default: '5000' },
        { byte: '15', name: 'Window Function', description: 'Windowing function applied to waveform', values: 'none 0 (0x00) | hanning 1 (0x01) | inverse_hanning 2 (0x02) | hamming 3 (0x03) | inverse_hamming 4 (0x04)', default: '1' },
        { byte: '16-17', name: 'Alarm Test Period', description: 'Minutes between alarm checks', default: '1' },
        { byte: '18-19', name: 'Machine Off Threshold', description: 'Threshold in milli-g', default: '30' },
      ]
    }
  },
  {
    id: 'downlink-alarms',
    title: 'Alarms Downlink',
    section: SectionType.DOWNLINKS,
    content: `Sets alarm thresholds.`,
    packetTable: {
      port: 31,
      fields: [
        { byte: '0-1', name: 'Alarms Bitmask', description: 'Enables specific alarms', values: 'temperature 1 (0x01) | acceleration_axis1 2 (0x02) | acceleration_axis2 4 (0x04) | acceleration_axis3 8 (0x08) | velocity_axis1 16 (0x10) | velocity_axis2 32 (0x20) | velocity_axis3 64 (0x40)', default: '0x0000' },
        { byte: '2-3', name: 'Temp Level', description: 'Temperature alarm threshold in degrees C', default: '0' },
        { byte: '4-5', name: 'Accel Axis 1 Level', description: 'Acceleration alarm threshold for Axis 1 in milli-g', default: '0' },
        { byte: '6-7', name: 'Accel Axis 2 Level', description: 'Acceleration alarm threshold for Axis 2 in milli-g', default: '0' },
        { byte: '8-9', name: 'Accel Axis 3 Level', description: 'Acceleration alarm threshold for Axis 3 in milli-g', default: '0' },
        { byte: '10-11', name: 'Vel Axis 1 Level', description: 'Velocity alarm threshold for Axis 1 in milli-ips', default: '0' },
        { byte: '12-13', name: 'Vel Axis 2 Level', description: 'Velocity alarm threshold for Axis 2 in milli-ips', default: '0' },
        { byte: '14-15', name: 'Vel Axis 3 Level', description: 'Velocity alarm threshold for Axis 3 in milli-ips', default: '0' },
      ]
    }
  },
  {
    id: 'downlink-command',
    title: 'Command Downlink',
    section: SectionType.DOWNLINKS,
    content: `Requests actions from the sensor.`,
    packetTable: {
      port: 22,
      fields: [
        { byte: '0-1', name: 'Command ID', description: 'Command identifier (u16 LE)', values: 'request_current_twf 1 (0x0100) | request_config 2 (0x0200) | request_new_twf 3 (0x0300) | init_upgrade 5 (0x0500) | verify_upgrade 6 (0x0600)' },
        { byte: '2..', name: 'Parameters', description: 'Optional parameters (e.g. 4-byte file size for Command 5)' },
      ]
    }
  },
  {
    id: 'downlink-upgrade',
    title: 'Upgrade Data Downlink',
    section: SectionType.DOWNLINKS,
    content: `Transfers firmware image data.`,
    packetTable: {
      port: 25,
      fields: [
        { byte: '0-1', name: 'Block Number', description: 'Sequence number starting at 0' },
        { byte: '2-52', name: 'Data', description: '51 bytes of firmware data' },
      ]
    }
  },
  {
    id: 'downlink-waveform-ack',
    title: 'Waveform Acknowledgment Downlink',
    section: SectionType.DOWNLINKS,
    content: `Acknowledges receipt of waveform information or waveform data from the sensor.`,
    packetTable: {
      port: 20,
      fields: [
        { byte: '0', name: 'Opcode', description: 'Acknowledgment type', values: 'waveform_data_ack 1 (0x01) | waveform_info_ack 3 (0x03)' },
        { byte: '1', name: 'Transaction ID', description: 'Matches the Transaction ID from the uplink being acknowledged' },
      ]
    }
  },
  {
    id: 'downlink-missing-segments',
    title: 'Missing Segments Downlink',
    section: SectionType.DOWNLINKS,
    content: `Requests retransmission of missing waveform segments from the sensor.`,
    packetTable: {
      port: 21,
      fields: [
        { byte: '0', name: 'Value Size Mode', description: 'Determines byte width of segment numbers', values: '1_byte_values 0 (0x00) | 2_byte_values 1 (0x01)' },
        { byte: '1', name: 'Segment Count', description: 'Number of missing segments listed' },
        { byte: '2+', name: 'Segment Numbers', description: 'List of missing segment numbers (u8 if mode=0, u16 LE if mode=1)' },
      ]
    }
  },
];
