import { SectionType, WikiPage } from '../../types';

export const configModesPages: WikiPage[] = [
  {
    id: 'config-modes',
    title: 'Configuration & Modes',
    section: SectionType.CONFIG_MODES,
    content: `The AirVibe sensor operates based on a flexible configuration schedule.

**Push Modes**
*   **overall_only (0x01):** Sends summary RMS data only. Efficient for battery.
*   **waveform_only (0x02):** Sends full high-frequency raw data. High bandwidth usage.
*   **overall_and_waveform (0x03):** Alternates or sends both based on their respective periods.

**Machine Off Function**
To conserve battery and avoid recording meaningless vibration data while the monitored equipment is idle, the sensor includes a configurable **Machine Off Threshold**.

*   Configured in **Byte 18-19** of Configuration Downlink (Port 30). Default: **30 mg**.
*   Unit: **mg (milli-g)**.
*   **Detection:** Before any vibration processing or alarm evaluation, the sensor compares the measured acceleration against this threshold. If the reading falls below it, the machine is considered off.
*   **Behavior when off:** The sensor skips all vibration processing and alarm checks, sets the uplink status to \`machine_off\` (status code 16), and returns \`null\` for all vibration and temperature fields. Battery voltage and percentage are still reported.
*   **Alarm interaction:** Because the machine-off check runs first in every wake cycle, no alarms can fire while the machine is off — the sensor goes back to sleep immediately.`
  },
];
