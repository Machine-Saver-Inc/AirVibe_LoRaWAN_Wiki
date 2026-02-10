import { SectionType, WikiPage } from '../../types';
import timeWaveformTransfer from '../../public/assets/time-waveform-transfer.mmd?raw';

export const timeWaveformPages: WikiPage[] = [
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
];
