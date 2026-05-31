import React, { useRef, useState, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CropperProps {
    imageFile: File;
    onCropped: (blob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number; // default 3/4 (portrait)
}

export const ImageCropper: React.FC<CropperProps> = ({
    imageFile,
    onCropped,
    onCancel,
    aspectRatio = 3 / 4,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [imageUrl] = useState(() => URL.createObjectURL(imageFile));
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

    // Container display size
    const DISPLAY_W = 300;
    const DISPLAY_H = Math.round(DISPLAY_W / aspectRatio);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setDragging(true);
        dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        setDragging(true);
        dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;
        setOffset({
            x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
            y: dragStart.current.oy + (e.clientY - dragStart.current.my),
        });
    }, [dragging]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!dragging) return;
        const t = e.touches[0];
        setOffset({
            x: dragStart.current.ox + (t.clientX - dragStart.current.mx),
            y: dragStart.current.oy + (t.clientY - dragStart.current.my),
        });
    }, [dragging]);

    const stopDrag = () => setDragging(false);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        imgRef.current = e.currentTarget;
        // Auto-fit scale so image fills the crop box
        const img = e.currentTarget;
        const scaleX = DISPLAY_W / img.naturalWidth;
        const scaleY = DISPLAY_H / img.naturalHeight;
        const fitScale = Math.max(scaleX, scaleY);
        setScale(fitScale);
        setOffset({ x: 0, y: 0 });
    };

    const handleCrop = () => {
        const img = imgRef.current;
        if (!img || !canvasRef.current) return;

        // OUTPUT resolution: 900x1200 (3:4 portrait, high quality)
        const OUT_W = 900;
        const OUT_H = 1200;

        const canvas = canvasRef.current;
        canvas.width = OUT_W;
        canvas.height = OUT_H;
        const ctx = canvas.getContext('2d')!;

        // Map display-space offset to canvas-space
        const scaleRatio = OUT_W / DISPLAY_W;
        const drawW = img.naturalWidth * scale * scaleRatio;
        const drawH = img.naturalHeight * scale * scaleRatio;
        const drawX = offset.x * scaleRatio + (OUT_W - drawW) / 2;
        const drawY = offset.y * scaleRatio + (OUT_H - drawH) / 2;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, OUT_W, OUT_H);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        canvas.toBlob(
            (blob) => {
                if (blob) onCropped(blob);
            },
            'image/jpeg',
            0.92
        );
    };

    const imgStyle: React.CSSProperties = {
        width: imgRef.current ? imgRef.current.naturalWidth * scale : 'auto',
        height: imgRef.current ? imgRef.current.naturalHeight * scale : 'auto',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: imgRef.current ? -(imgRef.current.naturalHeight * scale) / 2 : 0,
        marginLeft: imgRef.current ? -(imgRef.current.naturalWidth * scale) / 2 : 0,
        userSelect: 'none',
        pointerEvents: 'none',
        maxWidth: 'none',
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-bold text-maroon">Crop Image</h3>
                        <p className="text-xs text-gray-400">Drag to reposition · Scroll to zoom</p>
                    </div>
                    <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Crop Area */}
                <div className="flex flex-col items-center p-6 gap-4">
                    <div
                        ref={containerRef}
                        className="relative overflow-hidden rounded-lg border-2 border-dashed border-maroon/40 bg-gray-100 cursor-grab active:cursor-grabbing select-none"
                        style={{ width: DISPLAY_W, height: DISPLAY_H }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={stopDrag}
                        onMouseLeave={stopDrag}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={stopDrag}
                        onWheel={(e) => {
                            e.preventDefault();
                            setScale(s => Math.max(0.01, Math.min(5, s - e.deltaY * 0.0002)));
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt="crop"
                            style={imgStyle}
                            onLoad={handleImageLoad}
                            draggable={false}
                        />
                        {/* Crop overlay guides */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-maroon rounded-tl-sm" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-maroon rounded-tr-sm" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-maroon rounded-bl-sm" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-maroon rounded-br-sm" />
                        </div>
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setScale(s => Math.max(0.01, s - 0.1))}
                            className="p-2 border rounded-lg hover:bg-gray-50 text-maroon"
                            title="Zoom out"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </button>
                        <input
                            type="range"
                            min="0.01"
                            max="4"
                            step="0.01"
                            value={scale}
                            onChange={e => setScale(parseFloat(e.target.value))}
                            className="w-36 accent-maroon"
                        />
                        <button
                            onClick={() => setScale(s => Math.min(5, s + 0.1))}
                            className="p-2 border rounded-lg hover:bg-gray-50 text-maroon"
                            title="Zoom in"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
                            className="p-2 border rounded-lg hover:bg-gray-50 text-gray-500"
                            title="Reset"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>

                    <p className="text-xs text-gray-400">Output: 900 × 1200 px — 3:4 portrait</p>
                </div>

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Footer buttons */}
                <div className="flex gap-3 p-4 border-t">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCrop}
                        className="flex-1 py-2.5 bg-maroon text-white rounded-xl text-sm font-semibold hover:bg-maroon-dark flex items-center justify-center gap-2"
                    >
                        <Check className="h-4 w-4" /> Apply Crop & Upload
                    </button>
                </div>
            </div>
        </div>
    );
};
