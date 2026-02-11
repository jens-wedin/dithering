import { useState, useRef, useEffect, useCallback } from 'react';
import { DitherEngine, hexToRgb } from './utils/DitherEngine';
import type { DitherSettings, DitherAlgorithm } from './utils/DitherEngine';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<Omit<DitherSettings, 'fgColor' | 'bgColor'> & { fgColor: string, bgColor: string }>({
    brightness: 0,
    contrast: 0,
    levels: 2,
    algorithm: 'floyd-steinberg',
    bgColor: '#000000',
    fgColor: '#00ff00'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const processImage = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use offscreen canvas to keep original pixels
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = offscreenCanvasRef.current;
    offCanvas.width = imgRef.current.naturalWidth;
    offCanvas.height = imgRef.current.naturalHeight;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Draw original
    offCtx.drawImage(imgRef.current, 0, 0);

    // Apply dithering
    const ditherSettings: DitherSettings = {
      ...settings,
      fgColor: hexToRgb(settings.fgColor),
      bgColor: hexToRgb(settings.bgColor)
    };

    DitherEngine.process(offCanvas, ditherSettings);

    // Scaling for preview
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / offCanvas.width);
    canvas.width = offCanvas.width * scale;
    canvas.height = offCanvas.height * scale;
    ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
  }, [settings]);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        processImage();
      };
      img.src = image;
    }
  }, [image, processImage]);

  const handleDownload = () => {
    if (!offscreenCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `dithered_${Date.now()}.png`;
    link.href = offscreenCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="app-container crt-flicker">
      <div className="crt-overlay"></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>DITHER_OS v1.0</h2>
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '[ CLOSE ]' : '[ MENU ]'}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="sidebar-content">
            <div className="control-group">
              <label>ALGORITHM:</label>
              <select
                value={settings.algorithm}
                onChange={(e) => setSettings({ ...settings, algorithm: e.target.value as DitherAlgorithm })}
              >
                <option value="floyd-steinberg">FLOYD-STEINBERG</option>
                <option value="atkinson">ATKINSON</option>
                <option value="bayer">BAYER (ORDERED)</option>
              </select>
            </div>

            <div className="control-group">
              <label>BRIGHTNESS: {settings.brightness}</label>
              <input
                type="range" min="-100" max="100"
                value={settings.brightness}
                onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>CONTRAST: {settings.contrast}</label>
              <input
                type="range" min="-100" max="100"
                value={settings.contrast}
                onChange={(e) => setSettings({ ...settings, contrast: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>DITHER LEVELS: {settings.levels}</label>
              <input
                type="range" min="2" max="16"
                value={settings.levels}
                onChange={(e) => setSettings({ ...settings, levels: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>FG_COLOR:</label>
              <input
                type="color"
                value={settings.fgColor}
                onChange={(e) => setSettings({ ...settings, fgColor: e.target.value })}
              />
            </div>

            <div className="control-group">
              <label>BG_COLOR:</label>
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
              />
            </div>

            <button className="action-btn download-btn" onClick={handleDownload}>DOWNLOAD_PNG</button>
          </div>
        )}
      </aside>

      <main className="main-content">
        {!image ? (
          <div className="upload-area">
            <p>READY_FOR_INPUT...</p>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (re) => setImage(re.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="action-btn">UPLOAD_IMAGE</label>
          </div>
        ) : (
          <div className="preview-container">
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} />
            </div>
            <button className="action-btn reset-btn" onClick={() => setImage(null)}>CLEAR_INPUT</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
