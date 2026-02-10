import { SectionType, WikiPage } from '../../types';
import alarmLogic from '../../public/assets/alarm-logic.mmd?raw';

export const alarmPages: WikiPage[] = [
  {
    id: 'alarm-logic',
    title: 'Alarm Logic',
    section: SectionType.ALARMS,
    content: `AirVibe uses a 15-second trip delay to avoid spurious alarms while still conserving battery. The sequence works like this:

After each waveform capture and processing, the sensor checks for an alarm condition.
- If no alarm is detected, nothing is transmitted and the node returns to sleep.
- If an alarm is detected, the sensor waits 5 seconds, captures again, and rechecks.
- If the second check still shows an alarm, it waits another 5 seconds and performs a third check.
- If all three checks show an alarm, the sensor sends an overall payload containing the alarm-source byte (not just a binary alarm flag).

**Machine-off logic always runs first.**
If the machine is off, the sensor skips vibration processing and alarm checks entirely.

**Alarm-source reporting:**
Instead of sending a 0/1 flag, the payload includes a byte indicating which condition caused the alarm (acceleration, velocity, temperature, etc.).

**Skip unnecessary calculations to save power:**
- If an alarm threshold exists only for acceleration, the sensor skips velocity calculation during alarm checks.
- If the alarm threshold exists only for temperature, the sensor skips all vibration processing during alarm checks.

**When an alarm check overlaps with an overall measurement cycle:**
The sensor avoids double computation. It uses the already-computed overalls for the first alarm check.
In this overlap case, it also avoids sending duplicate packets—only the overall packet is transmitted, with the alarm-source byte set appropriately.`,
    mermaidDiagram: alarmLogic
  },
];
