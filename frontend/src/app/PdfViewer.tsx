'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export interface FormField {
  id: string;
  pageIndex: number;
  type: 'text' | 'checkbox' | 'image' | 'date';
  x: number;
  y: number;
  width: number;
  height: number;
  value: string | boolean;
  color?: string; // Text color
}

interface PdfViewerProps {
  fileUrl: string;
  numPages: number | null;
  setNumPages: (n: number) => void;
  formFields: FormField[];
  setFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  zoom: number;
  currentTool: 'text' | 'date' | 'checkbox' | 'signature';
  currentColor: string;
  onSignatureRequest: (pageIndex: number, x: number, y: number, width: number, height: number) => void;
}

// Inline SVGs for PdfViewer
const IconMove = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function PdfViewer({
  fileUrl, numPages, setNumPages, formFields, setFormFields, zoom, currentTool, currentColor, onSignatureRequest
}: PdfViewerProps) {

  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const [drawingField, setDrawingField] = useState<FormField | null>(null);
  const drawStartRef = useRef({ x: 0, y: 0, pageIndex: -1 });

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handlePagePointerDown = (e: React.PointerEvent<HTMLDivElement>, pageIndex: number) => {
    if ((e.target as HTMLElement).closest('.field-container')) return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    drawStartRef.current = { x, y, pageIndex };
    
    const today = new Date().toISOString().split('T')[0];
    
    setDrawingField({
      id: `manual_${Date.now()}`,
      pageIndex,
      type: currentTool === 'signature' ? 'image' : currentTool as any,
      x, y,
      width: 0, height: 0,
      value: currentTool === 'date' ? today : currentTool === 'checkbox' ? true : '',
      color: currentColor
    });
  };

  const handlePagePointerMove = (e: React.PointerEvent<HTMLDivElement>, pageIndex: number) => {
    if (!drawingField || drawingField.pageIndex !== pageIndex) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const { x: startX, y: startY } = drawStartRef.current;
    
    setDrawingField(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY)
      };
    });
  };

  const handlePagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (drawingField) {
      const finalField = { ...drawingField };
      if (finalField.width < 2 && finalField.height < 2) {
        // Default size on simple click
        if (currentTool === 'checkbox') {
           finalField.width = 3; finalField.height = 3;
        } else if (currentTool === 'date') {
           finalField.width = 15; finalField.height = 3;
        } else if (currentTool === 'signature') {
           finalField.width = 20; finalField.height = 8;
        } else {
           finalField.width = 25; finalField.height = 3;
        }
      }
      
      if (currentTool === 'signature') {
        onSignatureRequest(finalField.pageIndex, finalField.x, finalField.y, finalField.width, finalField.height);
      } else {
        setFormFields(prev => [...prev, finalField]);
      }
      
      setDrawingField(null);
    }
  };

  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string, pageIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    
    let lastX = e.clientX;
    let lastY = e.clientY;
    
    const pageElement = pagesRef.current[pageIndex];
    if (!pageElement) return;
    
    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - lastX;
      const dy = moveEvent.clientY - lastY;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      
      const rect = pageElement.getBoundingClientRect();
      const pctX = (dx / rect.width) * 100;
      const pctY = (dy / rect.height) * 100;
      
      setFormFields(prev => prev.map(f => {
        if (f.id === id) {
          return { ...f, x: f.x + pctX, y: f.y + pctY };
        }
        return f;
      }));
    };
    
    const onPointerUp = () => {
      target.releasePointerCapture(e.pointerId);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);
    };
    
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
  };

  const handleFieldChange = (id: string, value: string | boolean) => {
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleDeleteField = (id: string) => {
    setFormFields(prev => prev.filter(f => f.id !== id));
  };

  // Custom SVG cursor for signature placement – encoded as data URI
  const SIGNATURE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23f59e0b' fill-opacity='0.15' stroke='%23f59e0b' stroke-width='1.5'/%3E%3Cg transform='translate(8,7)'%3E%3Cpath d='M12 2l2 2-10 10-2 0 0-2z' fill='%23f59e0b'/%3E%3Cpath d='M0 14l0.5-2 1.5 1.5z' fill='%23d97706'/%3E%3Cpath d='M13 1l2 2' stroke='%23d97706' stroke-width='1' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E") 16 16, crosshair`;

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      className="flex flex-col gap-8 select-none my-4 items-center"
    >
      {Array.from(new Array(numPages || 0), (el, index) => (
        <div
          key={`page_${index}`}
          ref={el => { pagesRef.current[index] = el; }}
          className={`relative shadow-2xl rounded-sm border bg-white transition-all duration-300 origin-top ${
            currentTool === 'signature'
              ? 'border-amber-400 ring-2 ring-amber-300/60'
              : 'border-slate-300 cursor-crosshair hover:shadow-blue-900/10'
          }`}
          style={{
            width: `${800 * zoom}px`,
            cursor: currentTool === 'signature' ? SIGNATURE_CURSOR : 'crosshair',
          }}
          onPointerDown={(e) => handlePagePointerDown(e, index)}
          onPointerMove={(e) => handlePagePointerMove(e, index)}
          onPointerUp={handlePagePointerUp}
          onPointerCancel={handlePagePointerUp}
        >

          <Page 
            pageNumber={index + 1} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={800 * zoom}
          />
          
          {drawingField && drawingField.pageIndex === index && (
            <div 
              className="absolute border-2 border-blue-500 bg-blue-500/30 z-30 rounded-sm"
              style={{
                left: `${drawingField.x}%`,
                top: `${drawingField.y}%`,
                width: `${drawingField.width}%`,
                height: `${drawingField.height}%`,
              }}
            />
          )}

          {formFields.filter(f => f.pageIndex === index).map((field) => (
            <div 
              key={field.id}
              className="absolute flex items-center justify-center group field-container transition-opacity"
              style={{
                left: `${field.x}%`,
                top: `${field.y}%`,
                width: `${field.width}%`,
                height: `${field.height}%`,
              }}
            >
              <div 
                className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-10 hidden group-hover:flex items-center justify-center z-30 cursor-move"
                onPointerDown={(e) => handleDragPointerDown(e, field.id, index)}
              >
                <div className="bg-slate-700 hover:bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                  <IconMove />
                </div>
              </div>

              {field.type === 'text' ? (
                <input
                  type="text"
                  value={field.value as string}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  style={{ color: field.color || '#000000' }}
                  className="w-full h-full bg-blue-500/10 border border-transparent hover:border-blue-400 focus:border-blue-500 px-1 py-0 focus:bg-blue-500/5 focus:outline-none font-sans text-sm transition-all rounded-sm shadow-sm"
                />
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={field.value as string}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  style={{ color: field.color || '#000000' }}
                  className="w-full h-full bg-emerald-500/10 border border-transparent hover:border-emerald-400 focus:border-emerald-500 px-1 py-0 focus:bg-emerald-500/5 focus:outline-none font-sans text-sm transition-all rounded-sm shadow-sm"
                />
              ) : field.type === 'checkbox' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-blue-500/10 border border-transparent hover:border-blue-400 rounded-sm shadow-sm transition-all overflow-hidden">
                   <input
                    type="checkbox"
                    checked={field.value as boolean}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                  />
                  {field.value && <IconCheck />}
                </div>
              ) : field.type === 'image' && typeof field.value === 'string' ? (
                 <div className="w-full h-full bg-slate-100/50 border border-transparent hover:border-blue-400 rounded-md p-1">
                   <img 
                     src={field.value} 
                     alt="signature" 
                     className="w-full h-full object-contain pointer-events-none opacity-90 drop-shadow-sm"
                   />
                 </div>
              ) : null}
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-10 hidden group-hover:flex items-center justify-center z-30"
                title="Supprimer"
              >
                <div className="bg-rose-500 hover:bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                  <IconTrash />
                </div>
              </button>
            </div>
          ))}
        </div>
      ))}
    </Document>
  );
}
