import React, { useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface IAuditLogPdfViewer {
    pdfUrl: string | undefined,
    auditPdfContent: Blob|null,
    onClose : (value:boolean) => void,
  };
const AuditLogPdfViewer = ({pdfUrl, auditPdfContent, onClose}: IAuditLogPdfViewer) => {
  const [numPages, setNumPages] = useState<number|null>(null);

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
  };

 console.log(pdfUrl);
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