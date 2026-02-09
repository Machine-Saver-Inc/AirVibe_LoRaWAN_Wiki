
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
    raw: '0402010708810f000500d2000200881301010000000000000000000000000000000000190114021e00',
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
    raw: '0324000007030081204e1500',
    fPort: 8
  },
  {
    id: 'ex4',
    name: 'TriAxial_Waveform_Data_Segment_A',
    raw: '012400000100040000000200030000000300fbff01000300f9ff07000300fcff0700020000000200fdff00000400',
    fPort: 8
  },
  {
    id: 'ex5',
    name: 'TriAxial_Waveform_Data_Segment_B',
    raw: '012401000000fcff01000100fefffdff0000ffff00000100000000000000fffffffffdffffff0000fdff01000000',
    fPort: 8
  },
  {
    id: 'ex6',
    name: 'TriAxial_Waveform_Data_Segment_C(Final)',
    raw: '05240200000001000100000001000600feffffff000000000500faff00000700fafffeff0400fbffffff0400f6ff',
    fPort: 8
  },
  {
    id: 'ex7',
    name: 'Axis1_Waveform_Information(Initial)',
    raw: '032c000001040081204e5300',
    fPort: 8
  },
  {
    id: 'ex8',
    name: 'Axis2_Waveform_Information(Initial)',
    raw: '032a000002040081204e5300',
    fPort: 8
  },
  {
    id: 'ex9',
    name: 'Axis3_Waveform_Information(Initial)',
    raw: '032b000004040081204e5300',
    fPort: 8
  }
];
