import { SectionType, WikiPage, WikiVersion } from '../types';

const v1_01_Data: WikiPage[] = [
  // --- OVERVIEW ---
  {
    id: 'intro',
    title: 'Introduction',
    section: SectionType.OVERVIEW,
    content: `The AirVibe LoRa Communication Protocol describes the communication method between the AirVibe TPM board and a Gateway to exchange data with AirVibe sensors. It utilizes a combination of Uplink (Sensor to Gateway) and Downlink (Gateway to Sensor) payloads to manage configuration, alarms, and high-fidelity vibration data transfer.
    
    The system supports LoRaWAN Class A (default) and Class C (during firmware upgrades). All multi-byte fields use **Big Endian** format unless otherwise specified.`
  },

  // --- UPLINKS ---
  {
    id: 'uplink-config',
    title: 'Current Configuration Uplink',
    section: SectionType.UPLINKS,
    content: `Sent by AirVibe TPM to the Gateway to report its current settings.
    
    **Packet Type:** 4
    
    **Firmware Revision Encoding:** High byte = Major Number, Low byte = Minor Number.`,
    packetTable: {
      packetType: 4,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Always 4' },
        { byte: '1', name: 'Version', description: 'Protocol Version' },
        { byte: '2', name: 'Push Mode', description: '0x01: Overall, 0x02: Time Waveform, 0x03: Both' },
        { byte: '3', name: 'Axis', description: 'Bitmask of active axes' },
        { byte: '4', name: 'Acceleration Range', description: 'Range in g (e.g., 2, 4, 8, 16)' },
        { byte: '5', name: 'Hardware Filter', description: 'Filter setting ID' },
        { byte: '6-7', name: 'Time Waveform Push Period', description: 'Minutes between waveform pushes' },
        { byte: '8-9', name: 'Overall Push Period', description: 'Minutes between overall data pushes' },
        { byte: '10-11', name: 'Number of samples', description: 'Sample count for waveforms' },
        { byte: '12-13', name: 'High Pass Filter', description: 'Frequency in Hz' },
        { byte: '14-15', name: 'Low Pass Filter', description: 'Frequency in Hz' },
        { byte: '16', name: 'Window Function', description: 'Windowing function ID' },
        { byte: '17-18', name: 'Alarm Test Period', description: 'Minutes between alarm checks' },
        { byte: '19-20', name: 'Alarms bitmask', description: 'Active alarms configuration' },
        { byte: '21-22', name: 'Temperature Alarm Level', description: 'Threshold for temp alarm' },
        { byte: '23-28', name: 'Acceleration Levels', description: '2 bytes per axis (1, 2, 3)' },
        { byte: '29-34', name: 'Velocity Levels', description: '2 bytes per axis (1, 2, 3)' },
        { byte: '35-36', name: 'TPM Firmware Rev', description: 'AirVibe TPM Firmware Version' },
        { byte: '37-38', name: 'VSM Firmware Rev', description: 'AirVibe VSM Firmware Version' },
        { byte: '39-40', name: 'Machine Off Threshold', description: 'Threshold in mg' },
      ]
    }
  },
  {
    id: 'uplink-overall',
    title: 'Overall Uplink',
    section: SectionType.UPLINKS,
    content: `Transfers summary vibration readings, status, and battery information.
    
    **Packet Type:** 2`,
    packetTable: {
      packetType: 2,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Always 2' },
        { byte: '1', name: 'Status', description: '0 = OK, others = Error Code' },
        { byte: '2', name: 'Alarm Flag', description: '0 = No Alarms, 1 = Alarm Detected' },
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
    content: `Initiates a Time Waveform transfer sequence. Contains metadata about the waveform about to be sent.
    
    **Packet Type:** 3
    
    **Axis Selection Codes:**
    *   1: Axis 1 only
    *   2: Axis 2 only
    *   4: Axis 3 only
    *   7: All 3 Axes simultaneously`,
    packetTable: {
      packetType: 3,
      fields: [
        { byte: '0', name: 'Packet Type', description: 'Always 3' },
        { byte: '1', name: 'Transaction ID', description: 'Unique ID for the waveform' },
        { byte: '2', name: 'Segment Number', description: 'Number of the sent segment' },
        { byte: '3', name: 'Error Code', description: '0 = OK' },
        { byte: '4', name: 'Axis Selection', description: 'See Axis Codes' },
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
    content: `Carries the actual raw waveform data.
    
    **Packet Type:** 1 (Intermediate Segment) or 5 (Last Segment).
    
    If configured for a single axis, data samples are sequential for that axis. If configured for all axes, samples are interleaved (Axis 1, Axis 2, Axis 3, etc.).`,
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
    content: `Sent during OTA firmware upgrade to report missing blocks.
    
    **Packet Type:** 17
    
    If all data is received, the packet is 3 bytes long: **0x11 0x00 0x00**.`,
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
    content: `Configures the AirVibe sensor parameters.
    
    **Port:** 30`,
    packetTable: {
      port: 30,
      fields: [
        { byte: '0', name: 'Version', description: 'Protocol Version (Default 2)', default: '2' },
        { byte: '1', name: 'Push Mode', description: '1=Overall, 2=Waveform, 3=Both', default: '0x01' },
        { byte: '2', name: 'Axis', description: 'Bitmask (0x07 for all)', default: '0x07' },
        { byte: '3', name: 'Accel Range', description: '2g, 4g, 8g, 16g', default: '8' },
        { byte: '4', name: 'Hardware Filter', description: 'See Filter Table (Default 129)', default: '129' },
        { byte: '5-6', name: 'TWF Push Period', description: 'Minutes (15 - 44640)', default: '15' },
        { byte: '7-8', name: 'Overall Push Period', description: 'Minutes (1 - 744)', default: '5' },
        { byte: '9-10', name: 'Sample Count', description: '1..12288 (1 axis) or 4096 (3 axis)', default: '210' },
        { byte: '11-12', name: 'High Pass Filter', description: 'Hz (0 - 65535)', default: '2' },
        { byte: '13-14', name: 'Low Pass Filter', description: 'Hz (0 - 65535)', default: '5000' },
        { byte: '15', name: 'Window Function', description: '0=None, 1=Hanning, etc.', default: '1' },
        { byte: '16-17', name: 'Alarm Test Period', description: 'Minutes', default: '1' },
        { byte: '18-19', name: 'Machine Off Threshold', description: 'mg', default: '30' },
      ]
    }
  },
  {
    id: 'downlink-alarms',
    title: 'Alarms Downlink',
    section: SectionType.ALARMS,
    content: `Sets alarm thresholds.
    
    **Port:** 31
    
    **Bitmask (Bytes 0-1):**
    *   **0x01:** Temperature
    *   **0x02, 0x04, 0x08:** Accel Axis 1, 2, 3
    *   **0x10, 0x20, 0x40:** Vel Axis 1, 2, 3`,
    packetTable: {
      port: 31,
      fields: [
        { byte: '0-1', name: 'Alarms Bitmask', description: 'Enables specific alarms' },
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
    
    **Port:** 22
    
    **Commands:**
    *   1: Request sending current TWF packet
    *   2: Request current configuration
    *   3: Request new TWF
    *   5: Initialize Upgrade Session (Requires 4-byte file size payload)
    *   6: Verify updated upgrade image`,
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
    content: `Transfers firmware image data.
    
    **Port:** 25`,
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
    1.  **Trigger:** Configured schedule or Command 3.
    2.  **Collection:** Sensor wakes up, collects data.
    3.  **Initiation:** Sensor sends **Info Uplink (Type 3)**.
    4.  **Handshake:** Gateway records timestamp and sends **Ack Downlink (Port 4)**. (Note: Sensor proceeds even if Ack is lost).
    5.  **Transfer:** Sensor sends segments via **Data Uplink (Type 1)**.
    6.  **Completion:** Last segment sent as **Data Uplink (Type 5)**.
    7.  **Verification:** Gateway checks for missing segments.
        *   If missing: Sends **Missing Segments Downlink (Port 21)**.
        *   If complete: Sends **Data Ack Downlink (Port 6)**.
    8.  **Sleep:** Sensor returns to idle.
    `,
    mermaidDiagram: `sequenceDiagram
    participant Sensor as AirVibe TPM
    participant Gateway
    
    Note over Sensor: Wake & Collect Data
    Sensor->>Gateway: Uplink Type 3 (Info)
    Gateway-->>Sensor: Downlink Port 4 (Info Ack)
    
    loop Data Transfer
        Sensor->>Gateway: Uplink Type 1 (Data Segment)
    end
    
    Sensor->>Gateway: Uplink Type 5 (Last Segment)
    
    alt Missing Segments
        Gateway-->>Sensor: Downlink Port 21 (Missing Segments)
        Sensor->>Gateway: Uplink Type 1 (Resend Data)
    else All Received
        Gateway-->>Sensor: Downlink Port 6 (Data Ack)
        Note over Sensor: Go to Sleep
    end`
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
    participant Gateway
    participant Sensor as AirVibe TPM

    Gateway->>Sensor: Cmd 5 (Init Upgrade)
    Note over Sensor: Switch to Class C
    
    loop Firmware Stream
        Gateway->>Sensor: Port 25 (Data Block N)
    end
    
    Gateway->>Sensor: Cmd 6 (Verify)
    Sensor->>Gateway: Uplink 17 (Missing Blocks?)
    
    opt Missing Blocks
        Gateway->>Sensor: Port 25 (Resend Block X)
        Gateway->>Sensor: Cmd 6 (Verify)
        Sensor->>Gateway: Uplink 17 (All Received)
    end
    
    Note over Sensor: Apply FW & Reboot`
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