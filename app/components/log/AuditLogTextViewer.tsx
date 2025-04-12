import React, { useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface IAuditLogTextViewer {
    Url: string | undefined,
    auditContent: string|null,
    onClose : (value:boolean) => void,
  };
const AuditLogTextViewer = ({Url, auditContent, onClose}: IAuditLogTextViewer) => {
  const [numPages, setNumPages] = useState<number|null>(null);

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
  };

 console.log('pdfUrl', Url);
  return(
    <Box sx={{ position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          width: '75%',
          p: 4, }}>
            <h2>Document Processing</h2>
          {auditContent&&(
            <pre style={{ maxHeight: '250px', overflowY: 'auto', userSelect: 'none' }}>
              {
                // 개행문자를 기준으로 문자를 잘라(split) 배열로 만들고 
                //배열 사이사이 <br />태그를 넣어 뿌려줘서 개행을 넣은 효과를 내준다.
                auditContent.split("\n").map((line, index) => {
                  if( line.length <= 1){
                      return (
                            ''
                    );
                  }else{
                    return (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                    );
                }

                })
              }
            </pre>
          )}
    </Box>
  )
};

export default AuditLogTextViewer;