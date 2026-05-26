import { useRef, useState, useEffect } from "react";
import { Trash2, RotateCcw } from "lucide-react";

export default function SafeZoneEditor({ imageUrl, initialPoints = [], onChange }) {
  const imgRef = useRef(null);
  const [points, setPoints] = useState(initialPoints);
  const [imgDims, setImgDims] = useState({ w: 1, h: 1, naturalW: 1, naturalH: 1 });

  useEffect(() => {
    setPoints(initialPoints);
  }, [JSON.stringify(initialPoints)]);

  useEffect(() => {
    onChange?.(points);
  }, [JSON.stringify(points)]);

  const handleImgLoad = () => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setImgDims({
      w: rect.width,
      h: rect.height,
      naturalW: imgRef.current.naturalWidth,
      naturalH: imgRef.current.naturalHeight,
    });
  };

  const handleClick = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imgDims.naturalW / rect.width;
    const scaleY = imgDims.naturalH / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    setPoints(prev => [...prev, [x, y]]);
  };

  const toSvgCoord = (p) => {
    const rect = imgRef.current?.getBoundingClientRect() || { width: 1, height: 1 };
    return {
      cx: p[0] * (rect.width / imgDims.naturalW),
      cy: p[1] * (rect.height / imgDims.naturalH),
    };
  };

  const svgPoints = points.map(p => {
    const { cx, cy } = toSvgCoord(p);
    return `${cx},${cy}`;
  }).join(" ");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">คลิกบนภาพเพื่อวาดพื้นที่ปลอดภัย (Safe Zone) — ต้องมีอย่างน้อย 3 จุด</p>
        <div className="flex gap-1">
          {points.length > 0 && (
            <button
              type="button"
              onClick={() => setPoints(prev => prev.slice(0, -1))}
              className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md hover:bg-secondary transition-colors"
            >
              <RotateCcw size={11} /> ย้อนกลับ
            </button>
          )}
          <button
            type="button"
            onClick={() => setPoints([])}
            className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 size={11} /> ล้างทั้งหมด
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-border cursor-crosshair bg-slate-900" style={{ userSelect: "none" }}>
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Camera view"
          className="w-full object-contain"
          onLoad={handleImgLoad}
          onClick={handleClick}
          draggable={false}
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {points.length >= 3 && (
            <polygon
              points={svgPoints}
              fill="rgba(79, 124, 255, 0.15)"
              stroke="#4F7CFF"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )}
          {points.length >= 2 && (
            <polyline
              points={svgPoints}
              fill="none"
              stroke="#4F7CFF"
              strokeWidth="2"
            />
          )}
          {points.map((p, i) => {
            const { cx, cy } = toSvgCoord(p);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={7} fill="#4F7CFF" stroke="white" strokeWidth={2} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">{i + 1}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground">
        {points.length < 3
          ? `เพิ่มอีก ${3 - points.length} จุด เพื่อสร้าง Safe Zone`
          : `✓ Safe Zone พร้อมใช้งาน (${points.length} จุด)`}
      </p>
    </div>
  );
}