import { SectionType, WikiPage } from '../types';
import quickstartArchitecture from '../public/assets/quickstart-architecture.mmd?raw';
import alarmLogic from '../public/assets/alarm-logic.mmd?raw';
import timeWaveformTransfer from '../public/assets/time-waveform-transfer.mmd?raw';
import firmwareUpgradeOta from '../public/assets/firmware-upgrade-ota.mmd?raw';

export const wikiData: WikiPage[] = [
  // --- OVERVIEW ---
  {
    id: 'intro',
    title: 'Introduction',
    section: SectionType.OVERVIEW,
    content: `Machine Saver's AirVibe sensor utilizes LoRa and LoRaWAN communication protocol to send high-fidelity vibration analysis data (full time waveform) as well as summary data (3 axes of RMS acceleration, 3 axes of RMS velocity, and temperature data) from the TPM (transmission and power module) to a receiving gateway or basestation to various LoRa Network Servers. AirVibe was built for industrial environments and to scale for large enterprise customers. All functions of the AirVibe use standard LoRaWAN protocols (no proprietary communication methods) to accomplish everything from configuration, to updates to data transfer. Anyone with an AirVibe sensor and knowledge of LoRaWAN can use these standard Uplink (Sensor -> Gateway/Base Station) and Downlink (Gateway/Base Station -> Sensor) payloads to manage configuration, alarms, and high-fidelity vibration data transfer.

![LoRaWAN Network Architecture](assets/LoRaWAN_Network_Architecture.png)

The system supports LoRaWAN Class A (default) and Class C (during firmware upgrades). All multi-byte fields use **Little Endian** format to comply with the LoRa Alliance TS013-1.0.0 Payload Codec API.`
  },

  // --- QUICKSTART PLAN ---
  {
    id: 'quickstart-plan',
    title: 'Quickstart Plan',
    section: SectionType.QUICKSTART,
    content: `This quickstart guide walks you through getting an AirVibe sensor up and running with your own gateway and network/application server — from zero to fully operational.

### 1. Understand AirVibe & LoRaWAN Basics
AirVibe is a LoRaWAN Class A condition monitoring sensor that transmits vibration and temperature data. Familiarize yourself with the **Overview** section to understand uplink/downlink communication, payload structure, and the role of each component in the system.

### 2. Acquire Hardware
You need:
- **AirVibe sensor** (TPM + VSM)
- **LoRaWAN gateway or base station** — any standard LoRaWAN gateway that supports your regional frequency plan (e.g. US915, EU868)

### 3. Connect Your Gateway to a LoRa Network Server
Set up your gateway and register it with your chosen LoRa Network Server (e.g. ChirpStack, The Things Stack, AWS IoT Core for LoRaWAN, Actility, etc.). Ensure the gateway is online and forwarding packets.

### 4. Register the AirVibe Device on Your Network Server
Create a new LoRaWAN device profile on your Network Server using AirVibe's DevEUI, AppEUI, and AppKey. This information is available when you scan the QR code on AirVibe TPM and login to Machine Saver's activation portal. Use **OTAA** (Over-The-Air Activation) as the join method. Once you have set this up on your Network Server, wake the AirVibe up using the magnetic switch indicated on the outside of the TPM. The AirVibe TPM will make a wake up sound and (as long as it is within range of the gateway/base station) attempt to join automatically. Success is indicated with a Join-Success tone and failure indicated with a Join-Fail tone.

### 5. Configure Your Application Server to Receive Data
Point your Network Server's application integration at your Application Server or data platform. AirVibe uplinks arrive on specific ports — see the **Uplinks** section for packet formats and port numbers.

### 6. Decode Uplink Payloads
Use the **Decoder** section and the built-in Uplink Decoder tool in this wiki to parse incoming hex payloads into human-readable vibration, temperature, and status data. The AirVibe_TS013_Codec_vX.X.X.js may be downloaded from the Decoder section of this wiki. This codec can often be uploaded directly into your LNS (ChirpStack, Actility, etc.) to automatically decode uplinks and downlinks. Start by reviewing the current_configuration uplink packet that AirVibe sends automatically after a successful join.

### 7. Send Configuration Downlinks
Customize sensor behavior (push periods, acceleration range, filtering, push mode) by sending downlink commands. Refer to the **Downlinks** and **Configuration & Modes** sections for payload formats and available options.

### 8. Set Up Alarms and Monitoring
Configure alarm thresholds for temperature, acceleration, and velocity via downlink. The sensor will flag active alarms in its Overall Uplink packets. See the **Alarms** section for details.`,
    mermaidDiagram: quickstartArchitecture
  },

  // --- UPLINKS ---
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
        { byte: '2', name: 'Push Mode', description: 'Data transmission mode', values: 'overall 1 (0x01) | time_waveform 2 (0x02) | dual_mode 3 (0x03)' },
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

  // --- DOWNLINKS ---
  {
    id: 'downlink-config',
    title: 'Configuration Downlink',
    section: SectionType.DOWNLINKS,
    content: `Configures the AirVibe sensor parameters.`,
    packetTable: {
      port: 30,
      fields: [
        { byte: '0', name: 'Version', description: 'Protocol Version', values: '2 (0x02)', default: '2' },
        { byte: '1', name: 'Push Mode', description: 'Data transmission mode', values: 'overall 1 (0x01) | time_waveform 2 (0x02) | dual_mode 3 (0x03)', default: '0x01' },
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

  // --- CONFIG & MODES ---
  {
    id: 'config-modes',
    title: 'Configuration & Modes',
    section: SectionType.CONFIG_MODES,
    content: `The AirVibe sensor operates based on a flexible configuration schedule.

    **Push Modes**
    *   **Overall (0x01):** Sends summary RMS data only. Efficient for battery.
    *   **Time Waveform (0x02):** Sends full high-frequency raw data. High bandwidth usage.
    *   **Both (0x03):** Alternates or sends both based on their respective periods.

    **Machine Off Function**
    To save power and avoid logging "noise" when a machine is not running, the sensor features a **Machine Off Threshold**.

    *   Configured in **Byte 18-19** of Configuration Downlink (Port 30).
    *   Unit: **mg (milli-g)**.
    *   Logic: If the measured acceleration is below this threshold, the system decides the machine is off. The sensor may skip data transmission or flag the data accordingly.`
  },

  // --- ALARMS ---
  {
    id: 'alarm-logic',
    title: 'Alarm Logic',
    section: SectionType.ALARMS,
    content: `AirVibe uses a 15-second trip delay to avoid spurious alarms while still conserving battery. The sequence works like this:

    After each waveform capture and processing, the sensor checks for an alarm condition.
    • If no alarm is detected, nothing is transmitted and the node returns to sleep.
    • If an alarm is detected, the sensor waits 5 seconds, captures again, and rechecks.
    • If the second check still shows an alarm, it waits another 5 seconds and performs a third check.
    • If all three checks show an alarm, the sensor sends an overall payload containing the alarm-source byte (not just a binary alarm flag).

    **Machine-off logic always runs first.**
    If the machine is off, the sensor skips vibration processing and alarm checks entirely.

    **Alarm-source reporting:**
    Instead of sending a 0/1 flag, the payload includes a byte indicating which condition caused the alarm (acceleration, velocity, temperature, etc.).

    **Skip unnecessary calculations to save power:**
    • If an alarm threshold exists only for acceleration, the sensor skips velocity calculation during alarm checks.
    • If the alarm threshold exists only for temperature, the sensor skips all vibration processing during alarm checks.

    **When an alarm check overlaps with an overall measurement cycle:**
    The sensor avoids double computation. It uses the already-computed overalls for the first alarm check.
    In this overlap case, it also avoids sending duplicate packets—only the overall packet is transmitted, with the alarm-source byte set appropriately.`,
    mermaidDiagram: alarmLogic
  },

  // --- TIME WAVEFORM DATA (Renamed from Technical & Processes) ---
  {
    id: 'fft-conversion',
    title: 'FFT Conversion & Data Physics',
    section: SectionType.TIME_WAVEFORM,
    content: `The AirVibe sensor collects raw time-domain data. To analyze frequency components (Spectrum), a Fast Fourier Transform (FFT) is applied. The properties of the data stream determine the resolution and bandwidth of the resulting spectrum.`,
    extraTable: {
      title: 'Time Waveform Data Parameters',
      headers: ['Category', 'Parameter', 'Symbol', '3 Axis Waveform', '1 Axis Waveform'],
      rows: [
        ['Sampling', 'Sampling Rate', 'fs', '20,000 samples/s', '20,000 samples/s'],
        ['Sampling', 'Sample Period', 'Δt = 1/fs', '0.05 ms (50 µs)', '0.05 ms (50 µs)'],
        ['Sampling', 'Max Buffer Length', '—', '4,096 samples', '12,288 samples'],
        ['FFT Block', 'FFT Size', 'N', '4,096 points', '12,288 points'],
        ['FFT Block', 'Time-window max length', 'Tw = N/fs', '0.2048 s', '0.6144 s'],
        ['Spectrum', 'Bin Spacing (Resolution)', 'Δf = fs/N', '4.88 Hz/bin', '1.63 Hz/bin'],
        ['Sensor', '3 dB Bandwidth', '—', '~6.5 kHz', '~6.5 kHz'],
        ['Sensor', 'Practical Freq Span', 'Fmax', '10 Hz – 6,500 Hz', '4 Hz – 6,500 Hz'],
      ]
    }
  },
  {
    id: 'process-twf',
    title: 'Time Waveform Collection Process',
    section: SectionType.TIME_WAVEFORM,
    content: `
1. Information Uplink: Device sends Time Waveform Information Uplink (Type 03) to the LoRa Network / Application Server.
2. Logging: Server logs the timestamp, TxID, and waveform parameters.
3. Information Ack: Server sends Time Waveform Information Acknowledge Downlink (fPort 20, Type 03) to the device.
4. Early Segments (optional): If data segments arrive before the information uplink, the server inserts each segment and updates the segment bitmap as they come in.
5. Main Transfer Loop: For each subsequent waveform segment, the device sends Time Waveform Data Uplink – normal segment (Type 01), and the server inserts the segment and updates the bitmap.
6. Final Segment: The device sends the Time Waveform Data Uplink – final segment (Type 05).
7. Verification / Missing Segments: The server assembles the waveform and verifies completeness.
8. If missing segments are detected: server sends Time Waveform Missing Segments Downlink (fPort 21).
9. Commit & Final Ack: Once all segments are present, the server commits the waveform and marks it complete, then sends Time Waveform Data Acknowledge Downlink (fPort 20, Type 01) to the device.
    `,
    mermaidDiagram: timeWaveformTransfer
  },

  // --- FUOTA (Renamed from Processes) ---
  {
    id: 'process-ota',
    title: 'Firmware Upgrade Over The Air',
    section: SectionType.FUOTA,
    content: `
    The Over-The-Air upgrade process allows remote firmware updates.

    1.  **Init:** Gateway sends **Command 5 (Port 22)** with image size.
    2.  **Mode Switch:** Sensor switches to LoRaWAN Class C (always listening).
    3.  **Data:** Gateway streams image via **Upgrade Data Downlinks (Port 25)**.
    4.  **Verification:** Gateway sends **Command 6**.
    5.  **Status:** Sensor checks integrity and sends **Status Uplink (Type 17)**.
        *   If missing blocks: Gateway resends specific blocks.
        *   If complete (CRC OK): Sensor applies update and reboots.
    `,
    mermaidDiagram: firmwareUpgradeOta
  }
];

