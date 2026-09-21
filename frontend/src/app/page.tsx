'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib';
import dynamic from 'next/dynamic';
import { FormField } from './PdfViewer';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

// --- SVG Icons ---
const IconScan = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const IconCheckSquare = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconHash = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const IconSpinner = () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconType = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>;
const IconPen = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const IconZoomIn = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>;
const IconZoomOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>;
const IconFilePdf = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb(parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255) : rgb(0,0,0);
}

// --- Signature Pad Modal ---
const SignaturePad = ({ onSave, onClose }: { onSave: (dataUrl: string) => void, onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasStrokes(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e293b';
      }
    }
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasStrokes(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Draw Your Signature</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><IconX /></button>
        </div>
        <p className="text-sm text-slate-400">Sign below, then click on the document to place it.</p>
        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 overflow-hidden cursor-crosshair touch-none relative">
          <canvas
            ref={canvasRef}
            width={450}
            height={180}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full"
          />
          {!hasStrokes && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-slate-300 text-lg font-light italic">Sign here…</span>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-1">
          <button onClick={handleClear} className="text-slate-400 hover:text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-all text-sm">
            Clear
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-all text-sm">
              Cancel
            </button>
            <button
              disabled={!hasStrokes}
              onClick={() => {
                if (canvasRef.current) onSave(canvasRef.current.toDataURL('image/png'));
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 shadow-md disabled:bg-slate-200 disabled:text-slate-400 transition-all text-sm"
            >
              Use Signature →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Toolbar button helper ---
const ToolButton = ({ active, color, onClick, title, children }: {
  active: boolean, color: string, onClick: () => void, title: string, children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl w-full transition-all font-medium text-[11px]
      ${active
        ? `${color} bg-white shadow-sm ring-1 ring-slate-200`
        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);

// --- Main Page ---
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentTool, setCurrentTool] = useState<'text' | 'date' | 'checkbox' | 'signature'>('text');
  const [currentColor, setCurrentColor] = useState('#000000');

  // Signature flow: null = no sig, 'drawing' = pad open, string = dataUrl ready to place
  const [sigState, setSigState] = useState<null | 'drawing' | string>(null);

  const handleUploadAndDetect = async (selectedFile: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await axios.post('/api/pdf/upload', formData);
      setResults(response.data.results);
      if (response.data.results.fields) {
        const detectedFields: FormField[] = response.data.results.fields.map((f: any, i: number) => ({
          id: `auto_${i}`, pageIndex: f.pageIndex, type: f.type,
          x: f.x, y: f.y, width: f.width, height: f.height,
          value: f.type === 'checkbox' ? false : '', color: currentColor
        }));
        setFormFields(detectedFields);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && !error.response) {
        alert("Le service d'analyse PDF est indisponible. Lancez l'application avec start.bat puis réessayez.");
      } else if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        alert(detail ? `Impossible d'analyser ce PDF : ${detail}` : "Impossible d'analyser ce PDF.");
      } else {
        alert("Une erreur inattendue est survenue pendant l'analyse du PDF.");
      }
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setResults(null);
    setFormFields([]);
    const buffer = await selectedFile.arrayBuffer();
    setFileBuffer(buffer);
    await handleUploadAndDetect(selectedFile);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'application/pdf') processFile(f);
    else alert('Please drop a valid PDF file.');
  };

  // Called by PdfViewer when user clicks/draws on the PDF in 'signature' mode
  const handleSignatureRequest = (pageIndex: number, x: number, y: number, width: number, height: number) => {
    if (typeof sigState === 'string') {
      // Signature dataUrl is ready — place it
      setFormFields(prev => [...prev, {
        id: `sig_${Date.now()}`, pageIndex, type: 'image',
        x, y, width, height, value: sigState
      }]);
      // Exit signature mode
      setSigState(null);
      setCurrentTool('text');
    }
  };

  const saveAndDownloadPdf = async () => {
    if (!fileBuffer) return;
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      for (const field of formFields) {
        const page = pages[field.pageIndex];
        const { width, height } = page.getSize();
        const pdfX = (field.x / 100) * width;
        const pdfY_bottom = height - (((field.y + field.height) / 100) * height);

        if ((field.type === 'text' || field.type === 'date') && field.value) {
          page.drawText(field.value as string, {
            x: pdfX + 2, y: pdfY_bottom + 2, size: 11,
            color: hexToRgb(field.color || '#000000'),
          });
        } else if (field.type === 'checkbox' && field.value) {
          const boxSize = (field.width / 100) * width;
          page.drawText('X', {
            x: pdfX + boxSize * 0.2, y: pdfY_bottom + boxSize * 0.15,
            size: boxSize * 1.2, color: hexToRgb(field.color || '#000000'),
          });
        } else if (field.type === 'image' && typeof field.value === 'string') {
          const isPng = field.value.startsWith('data:image/png');
          const isJpg = field.value.startsWith('data:image/jpeg') || field.value.startsWith('data:image/jpg');
          const base64Data = field.value.split(',')[1];
          const binaryString = atob(base64Data);
          const imgBytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) imgBytes[i] = binaryString.charCodeAt(i);
          let image;
          if (isPng) image = await pdfDoc.embedPng(imgBytes);
          else if (isJpg) image = await pdfDoc.embedJpg(imgBytes);
          if (image) {
            page.drawImage(image, {
              x: pdfX, y: pdfY_bottom,
              width: (field.width / 100) * width,
              height: (field.height / 100) * height,
            });
          }
        }
      }
      const pdfBytes = await pdfDoc.save();
      // Copy into a browser-owned ArrayBuffer: pdf-lib's byte type may also
      // represent a SharedArrayBuffer, which Blob deliberately rejects.
      const blob = new Blob([Uint8Array.from(pdfBytes).buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `filled_${file?.name || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving the PDF document.');
    }
  };

  const isSignatureReady = typeof sigState === 'string';

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex">

      {/* Signature Pad Modal */}
      {sigState === 'drawing' && (
        <SignaturePad
          onClose={() => { setSigState(null); setCurrentTool('text'); }}
          onSave={(dataUrl) => {
            setSigState(dataUrl); // Ready to place on click
            setCurrentTool('signature');
          }}
        />
      )}

      {/* === LEFT SIDEBAR TOOLBAR === */}
      {fileUrl && (
        <aside className="w-20 flex-shrink-0 sticky top-0 h-screen flex flex-col items-center gap-2 bg-white border-r border-slate-200 shadow-sm py-4 z-30 overflow-y-auto">
          {/* Logo */}
          <div className="bg-blue-600 p-2 rounded-xl mb-3 text-white">
            <IconFilePdf />
          </div>

          <div className="w-10 h-px bg-slate-200 mb-1" />

          {/* Drawing Tools */}
          <ToolButton active={currentTool === 'text'} color="text-blue-600" onClick={() => setCurrentTool('text')} title="Text Field">
            <IconType />
            Text
          </ToolButton>
          <ToolButton active={currentTool === 'date'} color="text-emerald-600" onClick={() => setCurrentTool('date')} title="Date Picker">
            <IconCalendar />
            Date
          </ToolButton>
          <ToolButton active={currentTool === 'checkbox'} color="text-purple-600" onClick={() => setCurrentTool('checkbox')} title="Checkbox">
            <IconCheckSquare />
            Check
          </ToolButton>

          <div className="w-10 h-px bg-slate-200 my-1" />

          {/* Signature tool */}
          <ToolButton
            active={currentTool === 'signature'}
            color={isSignatureReady ? 'text-amber-600' : 'text-indigo-600'}
            onClick={() => {
              if (isSignatureReady) {
                // Already has a sig, just activate placement mode
                setCurrentTool('signature');
              } else {
                setSigState('drawing');
              }
            }}
            title={isSignatureReady ? 'Click on PDF to place' : 'Draw Signature'}
          >
            <div className="relative">
              <IconPen />
              {isSignatureReady && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </div>
            {isSignatureReady ? 'Place' : 'Sign'}
          </ToolButton>

          {isSignatureReady && (
            <button
              onClick={() => { setSigState(null); setCurrentTool('text'); }}
              title="Cancel signature"
              className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors px-1 -mt-1"
            >
              Cancel
            </button>
          )}

          <div className="w-10 h-px bg-slate-200 my-1" />

          {/* Color Picker */}
          <div className="flex flex-col items-center gap-1">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-9 h-9 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5 bg-white"
              title="Text Color"
            />
            <span className="text-[10px] text-slate-400">Color</span>
          </div>

          <div className="w-10 h-px bg-slate-200 my-1" />

          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Zoom In"><IconZoomIn /></button>
          <span className="text-[10px] text-slate-500 font-medium">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Zoom Out"><IconZoomOut /></button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export */}
          <button
            onClick={saveAndDownloadPdf}
            disabled={formFields.length === 0}
            title="Export PDF"
            className="flex flex-col items-center gap-1 p-3 rounded-xl w-full text-[11px] font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-md shadow-blue-600/20"
          >
            <IconDownload />
            Export
          </button>

          {/* Change file */}
          <label className="flex flex-col items-center gap-1 p-2 rounded-xl w-full text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all" title="Open another PDF">
            <IconFilePdf />
            Open
            <input type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
          </label>
        </aside>
      )}

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header — only on landing */}
        {!fileUrl && (
          <header className="flex flex-col items-center justify-center pt-16 pb-8 space-y-2">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20 mb-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">PDF Editor Studio</h1>
            <p className="text-slate-400 font-medium">Analyze, fill, and sign your documents</p>
          </header>
        )}

        {/* Signature placement hint banner */}
        {isSignatureReady && (
          <div className="sticky top-0 z-20 mx-4 mt-4">
            <div className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                <p className="font-semibold text-amber-800 text-sm">
                  Click or draw on the document to place your signature
                </p>
              </div>
              <button onClick={() => { setSigState(null); setCurrentTool('text'); }} className="text-amber-500 hover:text-amber-700 text-sm font-medium px-3 py-1 hover:bg-amber-100 rounded-lg transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 p-4 flex-1">
          {/* PDF Viewer / Dropzone */}
          <div
            className={`flex-[2.5] rounded-2xl border-2 flex flex-col justify-center relative transition-colors duration-300 overflow-auto ${isDragging ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-200 shadow-sm'} ${loading ? 'overflow-hidden' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fileUrl ? (
              <PdfViewer
                fileUrl={fileUrl}
                numPages={numPages}
                setNumPages={setNumPages}
                formFields={formFields}
                setFormFields={setFormFields}
                zoom={zoom}
                currentTool={currentTool}
                currentColor={currentColor}
                onSignatureRequest={handleSignatureRequest}
              />
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full min-h-[560px] border-4 border-dashed border-blue-200 rounded-2xl bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-all group">
                <div className="bg-blue-100 text-blue-500 p-8 rounded-full mb-5 group-hover:scale-110 transition-transform duration-300">
                  <IconUpload />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Drag & Drop a PDF Here</h3>
                <p className="text-slate-400 font-medium mb-8 text-center max-w-sm text-sm">Or click to browse. Fields are auto-detected using AI.</p>
                <div className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 group-hover:bg-blue-700 transition-all">
                  Browse Files
                </div>
                <input type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
              </label>
            )}

            {loading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
                <IconSpinner />
                <h3 className="text-xl font-bold text-slate-800 mt-5">Analyzing Document…</h3>
                <p className="text-slate-400 mt-2 text-sm">Détection des zones de texte et des cases à cocher…</p>
              </div>
            )}
          </div>

          {/* Right Sidebar – Scan Summary */}
          {fileUrl && (
            <div className="w-64 flex-shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-base font-bold mb-5 text-slate-800 flex items-center gap-2">
                <IconScan />
                Scan Summary
              </h2>

              {results ? (
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-semibold flex items-center gap-2 text-xs">
                    ✓ &nbsp;{formFields.length} fields detected
                  </div>

                </div>
              ) : (
                <div className="text-slate-300 text-center py-8 flex flex-col items-center gap-3">
                  <IconSpinner />
                  <p className="text-sm">Processing…</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
