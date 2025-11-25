import { WikiPage } from '../types';

const escapeCsv = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  // If the value contains quotes, commas, or newlines, wrap it in quotes and escape existing quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportTablesToCSV = (wikiData: WikiPage[], version: string) => {
  const rows: string[] = [];

  rows.push(`AirVibe Wiki Tables Export - Version ${version}`);
  rows.push(`Export Date,${new Date().toISOString().split('T')[0]}`);
  rows.push(''); // Empty line

  wikiData.forEach((page) => {
    // 1. Handle Packet Tables
    if (page.packetTable) {
      const { packetType, port, fields } = page.packetTable;
      const typeStr = packetType !== undefined ? `Type: ${packetType}` : '';
      const portStr = port !== undefined ? `Port: ${port}` : '';
      const meta = [typeStr, portStr].filter(Boolean).join(' | ');

      rows.push(`TABLE: ${page.title} [${meta}]`);
      
      // Header
      const hasDefault = fields.some(f => f.default);
      const headers = ['Byte #', 'Field Name', 'Description'];
      if (hasDefault) headers.push('Default');
      
      rows.push(headers.map(escapeCsv).join(','));

      // Rows
      fields.forEach(field => {
        const row = [field.byte, field.name, field.description];
        if (hasDefault) row.push(field.default || '');
        rows.push(row.map(escapeCsv).join(','));
      });
      
      rows.push(''); // Empty line between tables
    }

    // 2. Handle Extra Technical Tables
    if (page.extraTable) {
      rows.push(`TABLE: ${page.title} - ${page.extraTable.title}`);
      
      // Header
      rows.push(page.extraTable.headers.map(escapeCsv).join(','));

      // Rows
      page.extraTable.rows.forEach(row => {
        rows.push(row.map(escapeCsv).join(','));
      });

      rows.push(''); // Empty line between tables
    }
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AirVibe_Wiki_Tables_v${version}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};