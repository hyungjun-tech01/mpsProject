import React, { useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface IAuditLogPdfViewer {
    pdfUrl: string | undefined,
    auditPdfContent: Blob|null,
    // onClose : (value:boolean) => void,
  };
  
const AuditLogPdfViewer = ({pdfUrl, auditPdfContent}: IAuditLogPdfViewer) => {
  const [numPages, setNumPages] = useState<number|null>(null);

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
  };

  return(
    <div style={{ height: '75vh', overflow: 'auto' }}>
    { auditPdfContent &&   
    (<Document
        // file={auditPdfContent}
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        renderMode="canvas"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${pdfUrl}${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>)}
  </div>
  )
};

export default AuditLogPdfViewer;