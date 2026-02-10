import { WikiPage } from '../../types';
import { overviewPages } from './overview';
import { quickstartPages } from './quickstart';
import { uplinkPages } from './uplinks';
import { downlinkPages } from './downlinks';
import { configModesPages } from './configModes';
import { alarmPages } from './alarms';
import { timeWaveformPages } from './timeWaveform';
import { fuotaPages } from './fuota';

export const wikiData: WikiPage[] = [
  ...overviewPages,
  ...quickstartPages,
  ...uplinkPages,
  ...downlinkPages,
  ...configModesPages,
  ...alarmPages,
  ...timeWaveformPages,
  ...fuotaPages,
];
