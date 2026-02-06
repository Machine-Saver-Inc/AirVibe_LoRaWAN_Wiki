import { SectionType, WikiPage, WikiVersion } from '../types';

const v1_01_Data: WikiPage[] = [
  // --- OVERVIEW ---
  {
    id: 'intro',
    title: 'Introduction',
    section: SectionType.OVERVIEW,
    content: `Machine Saver's AirVibe sensor utilizes LoRa and LoRaWAN communication protocol to send high-fidelity vibration analysis data (full time waveform) as well as summary data (3 axes of RMS acceleration, 3 axes of RMS velocity, and temperature data) from the TPM (transmission and power module) to a receiving gateway or basestation to various LoRa Network Servers. AirVibe was built for industrial environments and to scale for large enterprise customers. All functions of the AirVibe use standard LoRaWAN protocols (no proprietary communication methods) to accomplish everything from configuration, to updates to data transfer. Anyone with an AirVibe sensor and knowledge of LoRaWAN can use these standard Uplink (Sensor -> Gateway/Base Station) and Downlink (Gateway/Base Station -> Sensor) payloads to manage configuration, alarms, and high-fidelity vibration data transfer.

    The system supports LoRaWAN Class A (default) and Class C (during firmware upgrades). All multi-byte fields use **Little Endian** format to comply with the LoRa Alliance TS013-1.0.0 Payload Codec API.`
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
        { byte: '0', name: 'Packet Type', description: 'Always 4' },
        { byte: '1', name: 'Version', description: 'Protocol Version' },
        { byte: '2', name: 'Push Mode', description: '0x01: Overall, 0x02: Time Waveform, 0x03: Dual Mode (Overalls Interspersed with Time Waveform Packets)' },
        { byte: '3', name: 'Time Waveform Axis', description: 'Bitmask of active axes. axis_1_only = 0x01, axis_2_only = 0x02, axis_3_only = 0x04, all_axes = 0x07' },
        { byte: '4', name: 'Acceleration Range', description: '2g, 4g, 8g, 16g (special order - 32g, 64g)' },
        { byte: '5', name: 'Hardware Filter', description: '0 – no filter, 23 - High Pass - 33 Hz, 22 - High Pass - 67 Hz, 21 - High Pass - 134 Hz, 20 - High Pass - 267 Hz, 19 - High Pass - 593 Hz, 18 - Hig3h Pass - 1335 Hz, 17 - High Pass - 2670 Hz, 135 - Low Pass - 33 Hz, 134 - Low Pass - 67 Hz, 133 - Low Pass - 134 Hz, 132 - Low Pass - 267 Hz, 131 - Low Pass - 593 Hz, 130 - Low Pass - 1335 Hz, 129 - Low Pass - 2670 Hz, 128 - Low Pass - 6675 Hz' },
        { byte: '6-7', name: 'Time Waveform Push Period', description: 'Minutes between waveform pushes' },
        { byte: '8-9', name: 'Overall Push Period', description: 'Minutes between overall data pushes' },
        { byte: '10-11', name: 'Waveform Samples Per Axis', description: 'Number of Samples waveforms per configured axis' },
        { byte: '12-13', name: 'High Pass Filter', description: 'Frequency in Hz' },
        { byte: '14-15', name: 'Low Pass Filter', description: 'Frequency in Hz' },
        { byte: '16', name: 'Window Function', description: 'Windowing function ID' },
        { byte: '17-18', name: 'Alarm Test Period', description: 'Minutes between alarm checks' },
        { byte: '19-20', name: 'Alarms bitmask', description: 'Active alarms configuration. temperature = 0x01, acceleration_axis1 = 0x02, acceleration_axis2 = 0x04, acceleration_axis3 = 0x08, velocity_axis1 = 0x10, velocity_axis2 = 0x20, velocity_axis3 = 0x40' },
        { byte: '21-22', name: 'Temperature Alarm Level', description: 'Threshold for temp alarm' },
        { byte: '23-28', name: 'Acceleration Alarm Levels', description: '2 bytes per axis (1, 2, 3)' },
        { byte: '29-34', name: 'Velocity Alarm Levels', description: '2 bytes per axis (1, 2, 3)' },
        { byte: '35-36', name: 'TPM Firmware Rev', description: 'AirVibe TPM Firmware Version. Firmware Revision Encoding: High byte = Major Number, Low byte = Minor Number.' },
        { byte: '37-38', name: 'VSM Firmware Rev', description: 'AirVibe VSM Firmware Version. Firmware Revision Encoding: High byte = Major Number, Low byte = Minor Number.' },
        { byte: '39-40', name: 'Machine Off Threshold', description: 'Threshold in milli-g' },
      ]
    }
  },
  {
    id: 'uplink-overall',
    title: 'Overall Uplink',
    section: SectionType.UPLINKS,
    content: `Transfers summary vibration readings, status, and battery information.`,
    packetTable: {
      packetType: 2,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Always 2' },
        { byte: '1', name: 'Status', description: '0 = OK, 1= "UART Read Error", 2= "UART Read Busy", 3= "UART Read Timeout", 4= "UART Write Error", 5= "UART Write Busy", 6= "UART Write Timeout", 7= "Modbus CRC Error", 8= "Vibration Sensor Module (VSM) error", 11= "Timewave API Not Initialized", 12= "Timewave collection timeout", 13= "Timewave Bad Params", 14= "Timewave Read Error", 15= "Timewave processing timeout", 16= "Machine Off", 21= "Missing ack"' },
        { byte: '2', name: 'Active Alarm Bitmask', description: 'no_alarm = 0x00, temperature = 0x01, acceleration_axis1 = 0x02, acceleration_axis2 = 0x04, acceleration_axis3 = 0x08, velocity_axis1 = 0x10, velocity_axis2 = 0x20, velocity_axis3 = 0x40' },
        { byte: '3', name: 'Temperature', description: 'Degrees C (Value / 10)' },
        { byte: '4', name: 'Voltage', description: 'Volts (Value / 10)' },
        { byte: '5', name: 'Charge Status', description: 'Percentage' },
        { byte: '6', name: 'Reserved', description: 'Reserved' },
        { byte: '7-8', name: 'Accel Axis 1', description: 'RMS in milli-g' },
        { byte: '9-10', name: 'Accel Axis 2', description: 'RMS in milli-g' },
        { byte: '11-12', name: 'Accel Axis 3', description: 'RMS in milli-g' },
        { byte: '13-14', name: 'Vel Axis 1', description: 'RMS in milli-ips' },
        { byte: '15-16', name: 'Vel Axis 2', description: 'RMS in milli-ips' },
        { byte: '17-18', name: 'Vel Axis 3', description: 'RMS in milli-ips' },
      ]
    }
  },
  {
    id: 'uplink-twf-info',
    title: 'Time Waveform Info Uplink',
    section: SectionType.UPLINKS,
    content: `Initiates a Time Waveform transfer sequence. Contains metadata about the waveform about to be sent.`,
    packetTable: {
      packetType: 3,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Always 3' },
        { byte: '1', name: 'Transaction ID', description: 'Unique ID for the waveform' },
        { byte: '2', name: 'Segment Number', description: 'Number of the sent segment' },
        { byte: '3', name: 'Error Code', description: '0 = OK' },
        { byte: '4', name: 'Axis Selection', description: 'Bitmask of active axes. axis_1_only = 0x01, axis_2_only = 0x02, axis_3_only = 0x04, all_axes = 0x07' },
        { byte: '5-6', name: 'Number of Segments', description: 'Total segments in waveform' },
        { byte: '7', name: 'Hardware Filter', description: 'Filter setting used' },
        { byte: '8-9', name: 'Sampling Rate', description: 'Rate of acquisition' },
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
        { byte: '0', name: 'Packet Type', description: '1 = Data, 5 = Last Data Segment' },
        { byte: '1', name: 'Transaction ID', description: 'Matches Info Uplink' },
        { byte: '2-3', name: 'Segment Number', description: 'Index (0 to N-1)' },
        { byte: '4..', name: 'Data Samples', description: 'Variable length raw data' },
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
        { byte: '0', name: 'Packet Type', description: 'Always 17 (0x11)' },
        { byte: '1', name: 'Missed Data Flag', description: '0 = Complete, 1 = Missing Data' },
        { byte: '2', name: 'Missed Count', description: 'Number of missed blocks listed here' },
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
        { byte: '0', name: 'Version', description: 'Protocol Version (Default 2)', default: '2' },
        { byte: '1', name: 'Push Mode', description: '0x01: Overall, 0x02: Time Waveform, 0x03: Dual Mode (Overalls Interspersed with Time Waveform Packets)', default: '0x01' },
        { byte: '2', name: 'Axis', description: 'Bitmask of active axes. axis_1_only = 0x01, axis_2_only = 0x02, axis_3_only = 0x04, all_axes = 0x07', default: '0x07' },
        { byte: '3', name: 'Accel Range', description: '2g, 4g, 8g, 16g (special order - 32g, 64g)', default: '8' },
        { byte: '4', name: 'Hardware Filter', description: '0 – no filter, 23 - High Pass - 33 Hz, 22 - High Pass - 67 Hz, 21 - High Pass - 134 Hz, 20 - High Pass - 267 Hz, 19 - High Pass - 593 Hz, 18 - Hig3h Pass - 1335 Hz, 17 - High Pass - 2670 Hz, 135 - Low Pass - 33 Hz, 134 - Low Pass - 67 Hz, 133 - Low Pass - 134 Hz, 132 - Low Pass - 267 Hz, 131 - Low Pass - 593 Hz, 130 - Low Pass - 1335 Hz, 129 - Low Pass - 2670 Hz, 128 - Low Pass - 6675 Hz', default: '129' },
        { byte: '5-6', name: 'TWF Push Period', description: 'Minutes (15 - 44640)', default: '15' },
        { byte: '7-8', name: 'Overall Push Period', description: 'Minutes (1 - 744)', default: '5' },
        { byte: '9-10', name: 'Sample Count', description: '1..12288 (1 axis) or 4096 (3 axis)', default: '210' },
        { byte: '11-12', name: 'High Pass Filter', description: 'Hz (0 - 65535)', default: '2' },
        { byte: '13-14', name: 'Low Pass Filter', description: 'Hz (0 - 65535)', default: '5000' },
        { byte: '15', name: 'Window Function', description: '0= "None", 1= "Hanning", 2= "InverseHanning", 3= "Hamming", 4= "InverseHamming"', default: '1' },
        { byte: '16-17', name: 'Alarm Test Period', description: 'Minutes', default: '1' },
        { byte: '18-19', name: 'Machine Off Threshold', description: 'mg', default: '30' },
      ]
    }
  },
  {
    id: 'downlink-alarms',
    title: 'Alarms Downlink',
    section: SectionType.DOWNLINKS, // Moved from ALARMS
    content: `Sets alarm thresholds.`,
    packetTable: {
      port: 31,
      fields: [
        { byte: '0-1', name: 'Alarms Bitmask', description: 'Enables specific alarms: 0x01=Temp, 0x02=Acc1, 0x04=Acc2, 0x08=Acc3, 0x10=Vel1, 0x20=Vel2, 0x40=Vel3' },
        { byte: '2-3', name: 'Temp Level', description: 'Degrees C' },
        { byte: '4-9', name: 'Accel Levels', description: 'Thresholds for Axis 1, 2, 3 (milli-g)' },
        { byte: '10-15', name: 'Velocity Levels', description: 'Thresholds for Axis 1, 2, 3 (milli-ips)' },
      ]
    }
  },
  {
    id: 'downlink-command',
    title: 'Command Downlink',
    section: SectionType.DOWNLINKS,
    content: `Requests actions from the sensor.
    Commands:
    0x0001: Request sending current TWF packet
    0x0002: Request current configuration
    0x0003: Request new TWF
    0x0005: Initialize Upgrade Session (Requires 4-byte file size payload)
    0x0006: Verify updated upgrade image`,
    packetTable: {
      port: 22,
      fields: [
        { byte: '0-1', name: 'Command ID', description: 'Command Identifier' },
        { byte: '2..', name: 'Parameters', description: 'Optional parameters (e.g. File Size for Cmd 5)' },
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
    mermaidDiagram: `sequenceDiagram
    autonumber
    participant M as Machine
    participant S as AirVibe Sensor
    participant C as Cloud / Backend

    M->>S: Machine state & signals (vibration, temp)
    S->>S: Check machine state

    alt Machine OFF
        S-->>S: Skip vibration processing & alarm checks
        S-->>S: Go to sleep
    else Machine ON
        S->>S: Capture waveform & compute overalls (if scheduled)

        Note over S: If overall calc is running,<br/>reuse these results for Alarm Check #1

        S->>S: Alarm Check #1
        alt No alarm
            S-->>S: Nothing to push
            S-->>S: Go to sleep
        else Alarm detected
            Note over S: Apply shortcuts:<br/>• Accel-only alarm → skip velocity calc<br/>• Temp-only alarm → skip vibration processing

            loop Up to 2 more checks (5 s apart)
                S-->>S: Wait 5 seconds
                S->>S: Capture again (only needed channels)
                S->>S: Recompute metrics
                S->>S: Alarm Check #2 / #3
            end

            alt Alarm still present after 3 checks
                S->>S: Build overall payload<br/>+ alarm-source byte
                S->>C: Send overall payload<br/>with alarm source
                S-->>S: Go to sleep
            else Alarm cleared
                S-->>S: Nothing to push
                S-->>S: Go to sleep
            end
        end
    end`
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
    section: SectionType.TIME_WAVEFORM, // Moved from Processes
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
    mermaidDiagram: `sequenceDiagram
  participant Dev as Device
  participant Act as Gateway
  participant MQ as LoRa Network/Application Server


  %% --- Start of waveform ---
  Dev->>MQ: Time Waveform Information Uplink (Type 03)
  MQ->>MQ: Log Timestamp, TxID, + Parameters
  MQ->>Dev: Time Waveform Information Acknowledge Downlink (fPort 20, Type 03)

  %% --- Segments may arrive before TWIU ---
  alt TWIU not yet received
    Dev->>MQ: Time Waveform Data Uplink - normal segment (Type 01)
    MQ->>MQ: Insert segment + update bitmap
  end

  %% --- Main transfer loop ---
  loop Each subsequent segment
    Dev->>MQ: Time Waveform Data Uplink - normal segment (Type 01)
    MQ->>MQ: Insert segment + update bitmap
  end

  %% --- Finalization ---
  Dev->>MQ: Time Waveform Data Uplink - final segment (Type 05)
  MQ->>MQ: Assemble and verify
    opt Missing segments detected
    MQ->>Dev: Time Waveform Missing Segments Downlink (fPort 21)
  end
  MQ->>Dev: Commit waveform and mark complete
  MQ->>Dev: Time Waveform Data Acknowledge Downlink (fPort 20, Type 01)`
  },

  // --- FUOTA (Renamed from Processes) ---
  {
    id: 'process-ota',
    title: 'Firmware Upgrade Over The Air', // Renamed title
    section: SectionType.FUOTA, // Renamed section
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
    mermaidDiagram: `sequenceDiagram
  autonumber
  participant LRC as LoRaWAN App
  participant GW as Gateway
  participant TPM as AirVibe

  Note over LRC,TPM: Get a Machine Saver TPM/VSM Factory Upgrade.bin File (customers cannot create)

  LRC->>GW: Command_Downlink - [Init_Upload]<br> Port: 22 <br> 0x0005 + upgrade.bin_bytesize (4 Bytes BigEndian)
  GW->>TPM: Command_Downlink - [Init_Upload]<br> Port: 22 <br> 0x0005 + upgrade.bin_bytesize (4 Bytes BigEndian)
  TPM->>TPM: Enter Class C Mode
  TPM-->>GW: Init_Upload_Ack_Uplink <br> Type_16 (0x10) <br> (1 Byte, Error Code=0)
  GW->>GW: Enter Class C Mode
  GW-->>LRC: Init_Upload_Ack_Uplink <br> Type_16 (0x10) <br> (1 Byte, Error Code=0)
  
  Note over LRC,TPM: App sends upgrade.bin chunked into data blocks n=0..N-1 (51 Bytes, 16-bit Blocks, BigEndian)
  loop Data blocks
    LRC->>GW: Upgrade_Data_Downlink <br> Port: 25 <br> block_num (2 Bytes BigEndian) + upgrade.bin_chunk (51 Bytes BigEndian)
    GW->>TPM: Upgrade_Data_Downlink <br> Port: 25 <br> block_num (2 Bytes BigEndian) + upgrade.bin_chunk (51 Bytes BigEndian)
  end
  Note over LRC,TPM: If upgrade.bin size/51 has a remainder, then the last block will be shorter.

  LRC->>GW: Command_Downlink - [Verify_Data]<br> Port: 22 <br> 0x0006
  GW->>TPM: Command_Downlink - [Verify_Data]<br> Port: 22 <br> 0x0006
  TPM->>GW: Data_Verification_Status_Uplink <br>Packet Type:17 (0x11) <br>(flag=1, count<=25, list)
  GW->>LRC: Data_Verification_Status_Uplink <br>Packet Type:17 (0x11) <br>(flag=1, count<=25, list)
  LRC->>LRC: Check Missing Data Blocks

  alt Data_Verification_Status_Uplink has Missing Data Blocks
    loop Resend Missing & Verify Until No Missing Blocks Remain
      LRC->>GW: Port_25 resend Upgrade_Data_Downlink block n {b1..bN}
      GW->>TPM: Port_25 resend Upgrade_Data_Downlink block n {b1..bN}
      LRC->>GW: Command_Downlink - [Verify_Data]<br> Port: 22 <br> 0x0006 
      GW->>TPM: Command_Downlink - [Verify_Data]<br> Port: 22 <br> 0x0006
      TPM-->>GW: Data_Verification_Status_Uplink <br>Type_17 (0x11) <br>(flag=0, count=0)
      GW-->>LRC: Data_Verification_Status_Uplink <br>Type_17 (0x11) <br>(flag=0, count=0)
    end
  else No blocks missed
    TPM->>TPM: CRC16 validate image
    TPM->>TPM: Selects Upgrade Target <br> VSM or TPM <br> (based on internal hardware code)
    TPM->>TPM: Apply Upgrade
    TPM->>TPM: Reverts Back to Class A
  end

  TPM-->>LRC: Upgrade_Status_Uplink
  LRC-->>GW: Upgrade_Status_Uplink
  GW->>GW: Switch to Class A`
  }
];

// Create a pseudo "Legacy" version for demonstration
// 1. Remove Machine Off section (Simulating it wasn't there in 1.0)
// 2. Remove Machine Off Threshold from Config Downlink
const v1_00_Data: WikiPage[] = v1_01_Data
  .filter(p => !p.content.includes('Machine Off')) // Filter out Machine Off content
  .map(p => {
    if (p.id === 'downlink-config' && p.packetTable) {
      // Return a copy of the page with modified packet table
      return {
        ...p,
        packetTable: {
          ...p.packetTable,
          fields: p.packetTable.fields.filter(f => f.name !== 'Machine Off Threshold')
        }
      };
    }
    if (p.id === 'uplink-config' && p.packetTable) {
         return {
        ...p,
        packetTable: {
          ...p.packetTable,
          fields: p.packetTable.fields.filter(f => f.name !== 'Machine Off Threshold')
        }
      };
    }
    return p;
  });

export const versionHistory: WikiVersion[] = [
  {
    version: '1.01E',
    date: '15 Oct 2025',
    description: 'Added Machine Off Threshold and TWF Receive Edits',
    data: v1_01_Data
  },
  {
    version: '1.00',
    date: '01 Jan 2024',
    description: 'Initial Release',
    data: v1_00_Data
  }
];

export const wikiData = v1_01_Data; // Default export for backwards compatibility if needed