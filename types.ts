
export enum SectionType {
  OVERVIEW = 'Overview',
  UPLINKS = 'Uplinks',
  DOWNLINKS = 'Downlinks',
  CONFIG_MODES = 'Configuration & Modes',
  ALARMS = 'Alarms',
  TIME_WAVEFORM = 'Time Waveform Data',
  FUOTA = 'FUOTA',
  DECODER = 'Decoder'
}

export interface PacketField {
  byte: string;
  name: string;
  description: string;
  default?: string;
}

export interface TableData {
  title: string;
  description?: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface WikiPage {
  id: string;
  title: string;
  section: SectionType;
  content: string; // Markdown-like text
  packetTable?: {
    port?: number;
    packetType?: number | string;
    fields: PacketField[];
  };
  mermaidDiagram?: string;
  extraTable?: TableData;
}

export interface WikiVersion {
  version: string;
  date: string;
  description: string;
  data: WikiPage[];
}

export interface SearchResult {
  answer: string;
  relevantSectionId?: string;
}
