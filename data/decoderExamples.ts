
export interface DecoderExample {
  id: string;
  name: string;
  raw: string;
  fPort: number;
}

export const decoderExamples: DecoderExample[] = [
  {
    id: 'ex1',
    name: 'Configuration',
    raw: '040201070881000F000500D2000213880100010000000000000000000000000000000001190214001E',
    fPort: 8
  },
  {
    id: 'ex2',
    name: 'Overall',
    raw: '020000129a6300000000000000000000000000',
    fPort: 8
  },
  {
    id: 'ex3',
    name: 'Tri-Axial_Waveform_Information(Initial)',
    raw: '03240000070003814e200015',
    fPort: 8
  },
  {
    id: 'ex4',
    name: 'TriAxial_Waveform_Data_Segment_A',
    raw: '012400000001000400000002000300000003fffb00010003fff900070003fffc0007000200000002fffd00000004',
    fPort: 8
  },
  {
    id: 'ex5',
    name: 'TriAxial_Waveform_Data_Segment_B',
    raw: '012400010000fffc00010001fffefffd0000ffff00000001000000000000fffffffffffdffff0000fffd00010000',
    fPort: 8
  },
  {
    id: 'ex6',
    name: 'TriAxial_Waveform_Data_Segment_C(Final)',
    raw: '05240002000000010001000000010006fffeffff000000000005fffa00000007fffafffe0004fffbffff0004fff6',
    fPort: 8
  },
  {
    id: 'ex7',
    name: 'Axis1_Waveform_Information(Initial)',
    raw: '032c0000010004814e200053',
    fPort: 8
  },
  {
    id: 'ex8',
    name: 'Axis2_Waveform_Information(Initial)',
    raw: '032a0000020004814e200053',
    fPort: 8
  },
  {
    id: 'ex9',
    name: 'Axis3_Waveform_Information(Initial)',
    raw: '032b0000040004814e200053',
    fPort: 8
  }
];
