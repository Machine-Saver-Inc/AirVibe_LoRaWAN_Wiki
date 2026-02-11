
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
    raw: '04030107088181000500d200020088130101007f001c25f401f401f4016400640064001b0122020a00',
    fPort: 8
  },
  {
    id: 'ex2',
    name: 'Overall',
    raw: '020000da9a631400150013000a000f000d00',
    fPort: 8
  },
  {
    id: 'ex3',
    name: '(Initial) Tri-Axial_Waveform_Information',
    raw: '03190000070a0081204e420008',
    fPort: 8
  },
  {
    id: 'ex4',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0000',
    raw: '011900000600a60209000900440207000700ca0103000600350101000700930005000500f1ffffff050050fff9ff',
    fPort: 8
  },
  {
    id: 'ex5',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0100',
    raw: '011901000100b8fef7ff0000dbfdf6fffdff94fdf7ff02007afdfbff050089fdfaff0300b9fdf6fffeff11fef8ff',
    fPort: 8
  },
  {
    id: 'ex6',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0200',
    raw: '01190200f9ff8afef9fff9ff19fffcfff4ffafff0100f3ff53000500fafff8001200ffff90010f00fcff8b020d00',
    fPort: 8
  },
  {
    id: 'ex7',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0300',
    raw: '01190300fbffd3020c00fffff5020d00fcffed020d000000c502080005001202070008008d0100000d00eb000000',
    fPort: 8
  },
  {
    id: 'ex8',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0400',
    raw: '0119040008004000030005009fff0000040002fffdff030076fef4ff010003fef2ff0500b1fdfaff090081fdfdff',
    fPort: 8
  },
  {
    id: 'ex9',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0500',
    raw: '0119050008009afdf5ff0400e0fdf4ff000045fefafffaffc6fefefffbff5efffdfff8fffffffefff9ffa700fdff',
    fPort: 8
  },
  {
    id: 'ex10',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0600',
    raw: '01190600ffff490101000000db010300ffffb6020100fefff10205000200040305000500e6020200ffffab020300',
    fPort: 8
  },
  {
    id: 'ex11',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0700',
    raw: '011907000000cf0107000400cf01090007003f0105000300faffffff030057ff00000800c1fe000003003cfefdff',
    fPort: 8
  },
  {
    id: 'ex12',
    name: 'Tri-Axial_Waveform_Data_Segment_0x0800',
    raw: '011908000000d8fdf6ffffff98fdf7fffcff78fdfffffdff87fdf7fff9ff0ffefefff8ff85fefdfff4ff0eff0000',
    fPort: 8
  },
  {
    id: 'ex13',
    name: '(Final) Tri-Axial_Waveform_Data_Segment_0x0900',
    raw: '05190900f4ffacff0300f9ff4e000200fcffee000800',
    fPort: 8
  },
  {
    id: 'ex14',
    name: 'Axis1_Waveform_Information(Initial)',
    raw: '032c000001040081204e5300',
    fPort: 8
  },
  {
    id: 'ex15',
    name: 'Axis2_Waveform_Information(Initial)',
    raw: '032a000002040081204e5300',
    fPort: 8
  },
  {
    id: 'ex16',
    name: 'Axis3_Waveform_Information(Initial)',
    raw: '032b000004040081204e5300',
    fPort: 8
  }
];
