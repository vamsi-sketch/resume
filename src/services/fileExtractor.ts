import mammoth from 'mammoth';

export async function extractTextFromFileBuffer(buffer: Buffer, originalName: string): Promise<string> {
  const ext = originalName.split('.').pop()?.toLowerCase();

  if (ext === 'docx') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch (err) {
      console.warn('Mammoth docx parse failed, falling back to string extraction:', err);
    }
  }

  if (ext === 'pdf') {
    try {
      // Dynamic import to avoid CJS/ESM quirks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule: any = await import('pdf-parse');
      if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const textResult = await parser.getText();
        if (typeof textResult === 'string' && textResult.trim().length > 0) {
          await parser.destroy?.();
          return textResult;
        } else if (textResult?.text && textResult.text.trim().length > 0) {
          await parser.destroy?.();
          return textResult.text;
        }
        await parser.destroy?.();
      } else if (typeof pdfModule.default === 'function') {
        const parsed = await pdfModule.default(buffer);
        if (parsed.text) return parsed.text;
      } else if (typeof pdfModule === 'function') {
        const parsed = await (pdfModule as unknown as (b: Buffer) => Promise<{ text: string }>)(buffer);
        if (parsed.text) return parsed.text;
      }
    } catch (err) {
      console.warn('PDF parser error, attempting text stream fallback:', err);
    }

    // Fallback PDF text stream scan
    const raw = buffer.toString('latin1');
    const textMatches: string[] = [];
    const streamRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const tjMatches = match[0].match(/\((.*?)\)\s*Tj/g);
      if (tjMatches) {
        tjMatches.forEach(t => {
          const content = t.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
          textMatches.push(content);
        });
      }
    }
    if (textMatches.length > 5) {
      return textMatches.join(' ');
    }
  }

  // Fallback: UTF-8 conversion with cleanup
  const text = buffer.toString('utf-8');
  // Remove non-printable characters
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
}
