import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { videoApi } from '../services/api';
import { generateMarkdown, downloadMarkdown } from '../utils/markdown';
import confetti from 'canvas-confetti';
import Magnetic from './Magnetic';

export default function ExportButtons({ data }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const handlePdf = async () => {
    setPdfLoading(true);
    setPdfError('');
    try {
      await videoApi.exportPdf(data);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setPdfError('PDF export failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleMarkdown = () => {
    const md = generateMarkdown(data.notes, data.video);
    const safeName = (data.notes?.title || 'notes').replace(/[^a-z0-9]/gi, '_').slice(0, 50);
    downloadMarkdown(md, `NoteTube_${safeName}.md`);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Magnetic strength={0.15}>
        <button
          onClick={handlePdf}
          disabled={pdfLoading}
          className="btn-primary"
          style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}
        >
          {pdfLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={15} />}
          Download PDF
        </button>
      </Magnetic>

      <Magnetic strength={0.15}>
        <button
          onClick={handleMarkdown}
          className="btn-secondary"
          style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}
        >
          <FileText size={15} />
          Export Markdown
        </button>
      </Magnetic>

      {pdfError && (
        <span style={{ color: 'var(--error)', fontSize: '0.82rem' }}>{pdfError}</span>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
