import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [scannedData, setScannedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      aspectRatio: 1.0
    });

    const onSuccess = async (decodedText) => {
      if (status === 'success' || status === 'loading') return;
      
      setStatus('loading');
      try {
        await onScanSuccess(decodedText);
        setScannedData(decodedText);
        setStatus('success');
        // Reset after 3 seconds for next scan
        setTimeout(() => {
          setStatus('idle');
          setScannedData(null);
        }, 3000);
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Check-in failed');
        setTimeout(() => setStatus('idle'), 3000);
      }
    };

    const onError = (error) => {
      // Quietly log errors as most are "No QR code found" frames
      if (onScanError) onScanError(error);
    };

    scanner.render(onSuccess, onError);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="relative rounded-3xl overflow-hidden border-2 border-white/5 bg-slate-900 shadow-2xl">
        {/* Success Overlay */}
        {status === 'success' && (
          <div className="absolute inset-0 z-10 bg-emerald-500/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
            <CheckCircle2 size={80} className="text-white mb-4 animate-bounce" />
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Verified!</h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2">{scannedData?.slice(0, 8)}...</p>
          </div>
        )}

        {/* Error Overlay */}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 bg-red-600/90 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 backdrop-blur-sm p-6 text-center">
            <XCircle size={80} className="text-white mb-4" />
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Check-in Error</h3>
            <p className="text-white text-xs font-bold uppercase tracking-widest">{errorMsg}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 bg-slate-900/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 size={48} className="text-red-600 animate-spin mb-4" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Validating Pass...</p>
          </div>
        )}

        <div id="qr-reader" className="qr-scanner-frame border-none"></div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-red-600/10 rounded-xl text-red-500">
           <ShieldCheck size={24} />
        </div>
        <div>
           <p className="text-white font-black italic uppercase tracking-tighter">Status Ready</p>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mt-1 italic">Align QR code within the focus area</p>
        </div>
      </div>
      
      {/* Custom styles for html5-qrcode */}
      <style dangerouslySetInnerHTML={{ __html: `
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: #020617 !important; }
        #qr-reader__dashboard { padding: 20px !important; color: #94a3b8 !important; }
        #qr-reader__dashboard_section_csr button { 
          background: #dc2626 !important; 
          color: white !important; 
          border: none !important; 
          padding: 8px 16px !important; 
          border-radius: 8px !important; 
          font-weight: 900 !important; 
          text-transform: uppercase !important; 
          letter-spacing: 0.1em !important; 
          font-style: italic !important;
          cursor: pointer !important;
        }
        #qr-reader__camera_selection {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          padding: 8px !important;
          border-radius: 8px !important;
          margin-bottom: 10px !important;
        }
      `}} />
    </div>
  );
};

export default QRScanner;
