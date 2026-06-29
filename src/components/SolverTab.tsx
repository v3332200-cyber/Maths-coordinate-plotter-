import React, { useState } from 'react';
import { Point } from '../types';
import { Calculator, Ruler, Hash, Compass, ArrowRight, CornerDownRight } from 'lucide-react';

interface SolverTabProps {
  points: Point[];
  point1Id: string;
  setPoint1Id: (id: string) => void;
  point2Id: string;
  setPoint2Id: (id: string) => void;
}

export default function SolverTab({
  points,
  point1Id,
  setPoint1Id,
  point2Id,
  setPoint2Id,
}: SolverTabProps) {
  // Auto-initialize selected IDs if they are empty
  React.useEffect(() => {
    if (!point1Id && points[0]) {
      setPoint1Id(points[0].id);
    }
    if (!point2Id && points[1]) {
      const secondPt = points[1] || points[0];
      setPoint2Id(secondPt.id);
    }
  }, [points, point1Id, point2Id, setPoint1Id, setPoint2Id]);

  // Find selected points
  const p1 = points.find(p => p.id === point1Id) || points[0];
  const p2 = points.find(p => p.id === point2Id) || points[1];

  const [calcMode, setCalcMode] = useState<'plotted' | 'custom'>(points.length >= 2 ? 'plotted' : 'custom');
  const [customX1, setCustomX1] = useState<string>('0');
  const [customY1, setCustomY1] = useState<string>('0');
  const [customX2, setCustomX2] = useState<string>('3');
  const [customY2, setCustomY2] = useState<string>('4');

  const activeP1 = calcMode === 'plotted' && p1
    ? p1
    : { id: 'c1', label: 'Custom P₁', x: parseFloat(customX1) || 0, y: parseFloat(customY1) || 0, color: '#6366f1' };

  const activeP2 = calcMode === 'plotted' && p2
    ? p2
    : { id: 'c2', label: 'Custom P₂', x: parseFloat(customX2) || 0, y: parseFloat(customY2) || 0, color: '#ec4899' };

  // Calculations for Single Point (A)
  const calculateSinglePointStats = (p: Point) => {
    const distFromOrigin = Math.sqrt(p.x * p.x + p.y * p.y);
    const rad = Math.atan2(p.y, p.x);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;

    let quadrant = '';
    if (p.x > 0 && p.y > 0) quadrant = 'Quadrant I (+, +)';
    else if (p.x < 0 && p.y > 0) quadrant = 'Quadrant II (-, +)';
    else if (p.x < 0 && p.y < 0) quadrant = 'Quadrant III (-, -)';
    else if (p.x > 0 && p.y < 0) quadrant = 'Quadrant IV (+, -)';
    else if (p.x === 0 && p.y !== 0) quadrant = 'Y-Axis Line';
    else if (p.y === 0 && p.x !== 0) quadrant = 'X-Axis Line';
    else quadrant = 'Origin Point (0, 0)';

    return {
      distFromOrigin,
      quadrant,
      polar: { r: distFromOrigin, thetaDeg: deg, thetaRad: rad },
    };
  };

  // Calculations for Double Points (A & B)
  const calculateDoublePointStats = (pt1: Point, pt2: Point) => {
    if (!pt1 || !pt2) return null;

    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const midpoint = {
      x: (pt1.x + pt2.x) / 2,
      y: (pt1.y + pt2.y) / 2,
    };

    const isVertical = dx === 0;
    const isHorizontal = dy === 0;

    let slope = 0;
    let equation = '';
    let stepByStepSlope = '';

    if (isVertical) {
      equation = `x = ${pt1.x}`;
      stepByStepSlope = 'Slope m is undefined (division by zero, vertical line).';
    } else {
      slope = dy / dx;
      const c = pt1.y - slope * pt1.x;

      const formatNum = (num: number) => {
        const rounded = Math.round(num * 100) / 100;
        return rounded === 0 ? '0' : rounded.toString();
      };

      const mStr = slope === 1 ? 'x' : slope === -1 ? '-x' : slope === 0 ? '' : `${formatNum(slope)}x`;
      const cStr = c > 0 ? ` + ${formatNum(c)}` : c < 0 ? ` - ${formatNum(Math.abs(c))}` : '';

      if (slope === 0) {
        equation = `y = ${formatNum(c)}`;
      } else {
        equation = `y = ${mStr}${cStr}`;
      }

      stepByStepSlope = `m = (y₂ - y₁) / (x₂ - x₁) = (${pt2.y} - ${pt1.y}) / (${pt2.x} - ${pt1.x}) = ${dy} / ${dx} = ${Math.round(slope * 100) / 100}`;
    }

    return {
      distance,
      midpoint,
      slope: isVertical ? 'Undefined' : Math.round(slope * 100) / 100,
      equation,
      stepByStepSlope,
      dx,
      dy,
    };
  };

  // Shoelace Area & Polygon Perimeter calculations
  const calculatePolygonStats = (pts: Point[]) => {
    if (pts.length < 3) return null;

    // Sort points counter-clockwise around centroid to ensure clean shoelace calculations & bounding perimeter
    const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
    const cy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;

    const sortedPts = [...pts].sort((a, b) => {
      const angleA = Math.atan2(a.y - cy, a.x - cx);
      const angleB = Math.atan2(b.y - cy, b.x - cx);
      return angleA - angleB;
    });

    let perimeter = 0;
    let shoelaceSum = 0;

    for (let i = 0; i < sortedPts.length; i++) {
      const current = sortedPts[i];
      const next = sortedPts[(i + 1) % sortedPts.length];

      // Distance
      const sideDist = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
      perimeter += sideDist;

      // Shoelace term: x_i * y_{i+1} - y_i * x_{i+1}
      shoelaceSum += (current.x * next.y) - (current.y * next.x);
    }

    const area = Math.abs(shoelaceSum) / 2;

    let shapeClass = 'Polygon';
    if (pts.length === 3) shapeClass = 'Triangle';
    else if (pts.length === 4) shapeClass = 'Quadrilateral';
    else if (pts.length === 5) shapeClass = 'Pentagon';
    else if (pts.length === 6) shapeClass = 'Hexagon';

    return {
      area,
      perimeter,
      centroid: { x: cx, y: cy },
      sortedVertices: sortedPts,
      shapeClass,
    };
  };

  const polyStats = calculatePolygonStats(points);

  return (
    <div className="flex flex-col gap-6">
      {/* Intro Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider font-sans">Step-by-Step Cartesian Math Solver</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            The math engine automatically computes distances, line equations, midpoint positions, and polygon areas from your plotted points.
          </p>
        </div>
      </div>

      {/* Quick Select Panel for 2 Points (Euclidean Distance & Line Calculator) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            Euclidean Distance & Line Calculator
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setCalcMode('plotted')}
              disabled={points.length < 2}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                calcMode === 'plotted'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50'
              }`}
            >
              Plotted Points
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('custom')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                calcMode === 'custom'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Custom coordinates
            </button>
          </div>
        </div>

        {calcMode === 'plotted' ? (
          points.length >= 2 ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  First Point (A)
                </label>
                <select
                  id="select-p1"
                  value={point1Id || (points[0]?.id ?? '')}
                  onChange={e => setPoint1Id(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {points.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.x}, {p.y})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Second Point (B)
                </label>
                <select
                  id="select-p2"
                  value={point2Id || (points[1]?.id ?? '')}
                  onChange={e => setPoint2Id(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {points.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.x}, {p.y})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-xs text-center py-4 text-slate-400 font-mono">
              ⚠️ Please plot at least 2 points on the Free Plotter to use Plotted mode, or switch to Custom Coordinates above.
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850">
              <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 font-mono">First Coordinate (P₁)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400">X₁</label>
                  <input
                    type="number"
                    value={customX1}
                    onChange={e => setCustomX1(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400">Y₁</label>
                  <input
                    type="number"
                    value={customY1}
                    onChange={e => setCustomY1(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850">
              <span className="block text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-2 font-mono">Second Coordinate (P₂)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400">X₂</label>
                  <input
                    type="number"
                    value={customX2}
                    onChange={e => setCustomX2(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400">Y₂</label>
                  <input
                    type="number"
                    value={customY2}
                    onChange={e => setCustomY2(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeP1 && activeP2 && activeP1.id !== activeP2.id ? (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
            {/* Distance formula */}
            <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Ruler className="w-4 h-4 text-amber-500" />
                <span>Euclidean Distance between {activeP1.label} and {activeP2.label}</span>
              </div>
              <div className="font-mono text-xs text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/85 leading-relaxed">
                <div className="text-slate-800 dark:text-slate-200 font-extrabold mb-1">
                  d = √[(x₂ - x₁)² + (y₂ - y₁)²]
                </div>
                <div>
                  d = √[({activeP2.x} - {activeP1.x})² + ({activeP2.y} - {activeP1.y})²]
                </div>
                <div>
                  d = √[({activeP2.x - activeP1.x})² + ({activeP2.y - activeP1.y})²]
                </div>
                <div>
                  d = √[{Math.pow(activeP2.x - activeP1.x, 2)} + {Math.pow(activeP2.y - activeP1.y, 2)}] = √{Math.pow(activeP2.x - activeP1.x, 2) + Math.pow(activeP2.y - activeP1.y, 2)}
                </div>
                <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-2 bg-amber-500/5 dark:bg-amber-400/5 p-2 rounded-lg border border-amber-500/15 inline-block">
                  Calculated Distance: ≈ {Math.sqrt(Math.pow(activeP2.x - activeP1.x, 2) + Math.pow(activeP2.y - activeP1.y, 2)).toFixed(4)} units
                </div>
              </div>
            </div>

            {/* Midpoint formula */}
            <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Midpoint of line {activeP1.label}{activeP2.label}</span>
              </div>
              <div className="font-mono text-xs text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/85 leading-relaxed">
                <div className="text-slate-800 dark:text-slate-200 font-bold mb-1">
                  M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)
                </div>
                <div>
                  M = (({activeP1.x} + {activeP2.x}) / 2, ({activeP1.y} + {activeP2.y}) / 2)
                </div>
                <div>
                  M = ({activeP1.x + activeP2.x} / 2, {activeP1.y + activeP2.y} / 2)
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                  Result: M ({(activeP1.x + activeP2.x) / 2}, {(activeP1.y + activeP2.y) / 2})
                </div>
              </div>
            </div>

            {/* Equation of line formula */}
            {(() => {
              const stats = calculateDoublePointStats(activeP1, activeP2);
              if (!stats) return null;
              return (
                <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Hash className="w-4 h-4 text-slate-500" />
                    <span>Line Equation & Slope</span>
                  </div>
                  <div className="font-mono text-xs text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/85 leading-relaxed">
                    <div className="text-slate-800 dark:text-slate-200 font-bold mb-1">
                      Formula: {stats.stepByStepSlope}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <span>Gradient (m):</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{stats.slope}</span>
                    </div>
                    <div className="mt-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
                      <div className="text-slate-500 mb-0.5">Slope-Intercept Form (y = mx + c):</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Equation: {stats.equation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-xs text-center py-4 text-slate-400 font-mono">
            ⚠️ Select two different points to inspect lines, distances, slopes, and linear equations.
          </div>
        )}
      </div>

      {/* Multi-point Polygon Stats (Shoelace formula!) */}
      {polyStats && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              {polyStats.shapeClass} Geometric Calculations
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Boundary Perimeter</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {polyStats.perimeter.toFixed(4)} <span className="text-xs font-sans text-slate-500">units</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-sans">
                Sum of distance segments between successive sorted vertices:
                <span className="font-mono block text-slate-600 dark:text-slate-400 font-bold mt-1">
                  {polyStats.sortedVertices.map(v => v.label).join(' → ')} → {polyStats.sortedVertices[0].label}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Internal Area (Shoelace Method)</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {polyStats.area.toFixed(4)} <span className="text-xs font-sans text-slate-500">units²</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-sans">
                Calculated using Gauss's Area formula (Shoelace theorem):
                <span className="font-mono block text-[10px] bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-850/80 text-emerald-600 dark:text-emerald-400 mt-1">
                  A = ½ | ∑ (x_i·y_(i+1) - x_(i+1)·y_i) |
                </span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 mt-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Centroid Coordinates (C)</span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
              <div className="w-2.5 h-2.5 bg-slate-600 dark:bg-slate-400 rounded-full" />
              <span>C ({polyStats.centroid.x.toFixed(2)}, {polyStats.centroid.y.toFixed(2)})</span>
            </div>
          </div>
        </div>
      )}

      {/* Single Point Stats Fallback */}
      {points.length === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              Point {points[0].label}({points[0].x}, {points[0].y}) Properties
            </h4>
          </div>

          {(() => {
            const stats = calculateSinglePointStats(points[0]);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Cartesian Location</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{stats.quadrant}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Distance from Origin: <span className="font-mono font-bold">{stats.distFromOrigin.toFixed(4)}</span> units
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/65 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Polar Coordinate Conversion</div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-1">
                    (r, θ) = ({stats.polar.r.toFixed(2)}, {stats.polar.thetaDeg.toFixed(1)}°)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    θ = {stats.polar.thetaRad.toFixed(3)} rad
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* No points plotted helper */}
      {points.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400">Plot points on the main grid first to load real-time math solvers.</p>
        </div>
      )}
    </div>
  );
}
