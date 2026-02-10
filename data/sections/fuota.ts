import { SectionType, WikiPage } from '../../types';
import firmwareUpgradeOta from '../../public/assets/firmware-upgrade-ota.mmd?raw';

export const fuotaPages: WikiPage[] = [
  {
    id: 'process-ota',
    title: 'Firmware Upgrade Over The Air',
    section: SectionType.FUOTA,
    content: `
1.  **Initialize Upgrade:** Gateway sends **Command Downlink 0x0500 (Port 22)** with image size in bytes (4 Bytes, LittleEndian) as the parameters.
2.  **Mode Switch:** AirVibe switches to LoRaWAN Class C (always listening) for fast acceptance of data blocks.
3.  **Acknowledge:** AirVibe sends **Initialize Upgrade Acknowledgement Uplink Type 16 (0x10)** (1 Byte, Error Code=0). The LoRa Network/Application Server updates its profile of the AirVibe to Class C Mode so the downlinks will be sent as quickly as the network allows.
4.  **Data:** Gateway streams the upgrade.bin image via **Upgrade Data Downlinks (Port 25)**. Each block contains a block number (2 Bytes, LittleEndian) followed by an upgrade.bin chunk (51 Bytes). If the image size divided by 51 has a remainder, the last block will be shorter.
5.  **Verify Command:** When all Upgrade Data Downlinks have been sent from the Gateway, the Gateway should send **Command Downlink 0x0600 (Port 22)** to the AirVibe.
6.  **Verification Status:** The AirVibe will respond with **Upgrade Verification Status Uplink Type 17 (0x11)**.
7.  If any blocks are flagged, they should be resent via **Upgrade Data Downlinks (Port 25)**, followed by another **Command Downlink 0x0600 (Port 22)**. This verify-and-resend cycle repeats until no missing blocks remain.
8.  Once **Upgrade Verification Status Uplink Type 17 (0x11)** returns from the AirVibe with flag=0 and count=0, the AirVibe runs a CRC16 check on the image to verify that it was all successfully received, then the AirVibe applies the firmware update (to the TPM or VSM as defined by the upgrade.bin binary file), reverts back to Class A Mode, and reboots. The LoRa Network/Application Server updates its profile of the AirVibe back to Class A Mode.
`,
    mermaidDiagram: firmwareUpgradeOta
  },
];
