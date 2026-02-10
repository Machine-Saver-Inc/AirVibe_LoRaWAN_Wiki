import { SectionType, WikiPage } from '../../types';

export const overviewPages: WikiPage[] = [
  {
    id: 'intro',
    title: 'Introduction',
    section: SectionType.OVERVIEW,
    content: `Machine Saver's AirVibe sensor utilizes LoRa and LoRaWAN communication protocol to send high-fidelity vibration analysis data (full time waveform) as well as summary data (3 axes of RMS acceleration, 3 axes of RMS velocity, and temperature data) from the TPM (transmission and power module) to a receiving gateway or basestation to various LoRa Network Servers. AirVibe was built for industrial environments and to scale for large enterprise customers. All functions of the AirVibe use standard LoRaWAN protocols (no proprietary communication methods) to accomplish everything from configuration, to updates to data transfer. Anyone with an AirVibe sensor and knowledge of LoRaWAN can use these standard Uplink (Sensor -> Gateway/Base Station) and Downlink (Gateway/Base Station -> Sensor) payloads to manage configuration, alarms, and high-fidelity vibration data transfer.

![LoRaWAN Network Architecture](assets/LoRaWAN_Network_Architecture.png)

The system supports LoRaWAN Class A (default) and Class C (during firmware upgrades). All multi-byte fields use **Little Endian** format to comply with the LoRa Alliance TS013-1.0.0 Payload Codec API.`
  },
];
