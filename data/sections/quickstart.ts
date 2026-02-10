import { SectionType, WikiPage } from '../../types';
import quickstartArchitecture from '../../public/assets/quickstart-architecture.mmd?raw';

export const quickstartPages: WikiPage[] = [
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
Use the **JavaScript Codec Utility** section and the built-in Uplink Decoder tool in this wiki to parse incoming hex payloads into human-readable vibration, temperature, and status data. The AirVibe_TS013_Codec_vX.X.X.js may be downloaded from the JavaScript Codec Utility section of this wiki. This codec can often be uploaded directly into your LNS (ChirpStack, Actility, etc.) to automatically decode uplinks and downlinks. Start by reviewing the current_configuration uplink packet that AirVibe sends automatically after a successful join.

### 7. Send Configuration Downlinks
Customize sensor behavior (push periods, acceleration range, filtering, push mode) by sending downlink commands. Refer to the **Downlinks** and **Configuration & Modes** sections for payload formats and available options.

### 8. Set Up Alarms and Monitoring
Configure alarm thresholds for temperature, acceleration, and velocity via downlink. The sensor will flag active alarms in its Overall Uplink packets. See the **Alarms** section for details.`,
    mermaidDiagram: quickstartArchitecture
  },
];
