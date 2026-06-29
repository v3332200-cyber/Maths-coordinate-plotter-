import React, { useRef, useState, useEffect } from 'react';
import { Point, GridSettings, LinearEquation } from '../types';

interface CartesianGridProps {
  points: Point[];
  settings: GridSettings;
  equations?: LinearEquation[];
  onGridClick?: (x: number, y: number) => void;
  onPointDrag?: (id: string, x: number, y: number) => void;
  onPointDragEnd?: (id: string) => void;
  targetPoint?: { x: number; y: number; label?: string; color?: string }; // For game modes
  showTargetOnly?: boolean;
  distanceP1Id?: string;
  distanceP2Id?: string;
}

export default function CartesianGrid({
  points,
  settings,
  equations = [],
  onGridClick,
  onPointDrag,
  onPointDragEnd,
  targetPoint,
  showTargetOnly = false,
  distanceP1Id = '',
  distanceP2Id = '',
}: CartesianGridProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; svgX: number; svgY: number } | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);

  const SVG_SIZE = 500;
  const HALF_SIZE = SVG_SIZE / 2;
  const range = settings.range;
  const scale = HALF_SIZE / range;

  const distanceP1 = points.find(p => p.id === distanceP1Id);
  const distanceP2 = points.find(p => p.id === distanceP2Id);

  // Convert Cartesian to SVG coordinates
  const toSvgX = (x: number) => HALF_SIZE + x * scale;
  const toSvgY = (y: number) => HALF_SIZE - y * scale;

  // Calculate the endpoints of a linear equation to render on the SVG
  const getLineEndpoints = (eq: LinearEquation, R: number): { x1: number; y1: number; x2: number; y2: number } | null => {
    if (eq.type === 'vertical') {
      const x = eq.xVal ?? 0;
      if (x < -R || x > R) return null;
      return { x1: x, y1: -R, x2: x, y2: R };
    }

    const m = eq.m;
    const c = eq.c;

    const candidates: { x: number; y: number }[] = [];

    // Left edge: x = -R
    const yLeft = m * (-R) + c;
    if (yLeft >= -R && yLeft <= R) {
      candidates.push({ x: -R, y: yLeft });
    }

    // Right edge: x = R
    const yRight = m * R + c;
    if (yRight >= -R && yRight <= R) {
      candidates.push({ x: R, y: yRight });
    }

    // Bottom edge: y = -R
    if (m !== 0) {
      const xBottom = (-R - c) / m;
      if (xBottom >= -R && xBottom <= R) {
        candidates.push({ x: xBottom, y: -R });
      }
    }

    // Top edge: y = R
    if (m !== 0) {
      const xTop = (R - c) / m;
      if (xTop >= -R && xTop <= R) {
        candidates.push({ x: xTop, y: R });
      }
    }

    // Remove duplicates
    const unique: { x: number; y: number }[] = [];
    for (const p of candidates) {
      if (!unique.some(u => Math.abs(u.x - p.x) < 1e-5 && Math.abs(u.y - p.y) < 1e-5)) {
        unique.push(p);
      }
    }

    if (unique.length >= 2) {
      return { x1: unique[0].x, y1: unique[0].y, x2: unique[1].x, y2: unique[1].y };
    } else if (unique.length === 1 && m === 0) {
      return { x1: -R, y1: c, x2: R, y2: c };
    }

    return null;
  };

  // Convert SVG to Cartesian coordinates
  const toCartesianX = (svgX: number) => (svgX - HALF_SIZE) / scale;
  const toCartesianY = (svgY: number) => (HALF_SIZE - svgY) / scale;

  const snapValue = (val: number) => {
    if (settings.snap === 'integer') {
      return Math.round(val);
    }
    if (settings.snap === 'half') {
      return Math.round(val * 2) / 2;
    }
    return Math.round(val * 100) / 100; // default to 2 decimal places if none
  };

  const handlePointerDown = (e: React.PointerEvent<SVGCircleElement>, pointId: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveDragId(pointId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const svgX = (clientX / rect.width) * SVG_SIZE;
    const svgY = (clientY / rect.height) * SVG_SIZE;

    // Boundary check
    if (svgX < 0 || svgX > SVG_SIZE || svgY < 0 || svgY > SVG_SIZE) {
      setHoverCoord(null);
      setIsHoveringGrid(false);
      return;
    }

    const rawX = toCartesianX(svgX);
    const rawY = toCartesianY(svgY);

    const snappedX = snapValue(rawX);
    const snappedY = snapValue(rawY);

    // Clamp coordinates to range
    const clampedX = Math.max(-range, Math.min(range, snappedX));
    const clampedY = Math.max(-range, Math.min(range, snappedY));

    setHoverCoord({
      x: clampedX,
      y: clampedY,
      svgX: toSvgX(clampedX),
      svgY: toSvgY(clampedY),
    });
    setIsHoveringGrid(true);

    if (activeDragId && onPointDrag) {
      onPointDrag(activeDragId, clampedX, clampedY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeDragId) {
      if (onPointDragEnd) {
        onPointDragEnd(activeDragId);
      }
      setActiveDragId(null);
    } else if (isHoveringGrid && hoverCoord && onGridClick) {
      // Prevent clicking when we just finished dragging
      onGridClick(hoverCoord.x, hoverCoord.y);
    }
  };

  const handlePointerLeave = () => {
    setHoverCoord(null);
    setIsHoveringGrid(false);
    if (activeDragId) {
      if (onPointDragEnd) {
        onPointDragEnd(activeDragId);
      }
      setActiveDragId(null);
    }
  };

  // Generate grid line elements
  const gridLines: React.ReactNode[] = [];
  const gridLabels: React.ReactNode[] = [];

  // Determine tick interval based on range
  let step = 1;
  if (range > 15) step = 2;
  if (range > 30) step = 5;

  for (let i = -range; i <= range; i += step) {
    if (i === 0) continue; // Skip axis line itself

    const pos = toSvgX(i);

    // Vertical lines & ticks
    if (settings.showGridLines) {
      gridLines.push(
        <line
          key={`v-${i}`}
          id={`grid-v-${i}`}
          x1={pos}
          y1={0}
          x2={pos}
          y2={SVG_SIZE}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
        />
      );
    }

    // Horizontal lines
    if (settings.showGridLines) {
      const hPos = toSvgY(i);
      gridLines.push(
        <line
          key={`h-${i}`}
          id={`grid-h-${i}`}
          x1={0}
          y1={hPos}
          x2={SVG_SIZE}
          y2={hPos}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
        />
      );
    }

    // Tick labels along the X axis
    gridLabels.push(
      <text
        key={`lbl-x-${i}`}
        id={`lbl-x-${i}`}
        x={pos}
        y={HALF_SIZE + 16}
        className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
        textAnchor="middle"
      >
        {i}
      </text>
    );

    // Tick labels along the Y axis
    gridLabels.push(
      <text
        key={`lbl-y-${i}`}
        id={`lbl-y-${i}`}
        x={HALF_SIZE - 8}
        y={toSvgY(i) + 4}
        className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
        textAnchor="end"
      >
        {i}
      </text>
    );
  }

  // Identify active quadrant
  let hoveredQuadrant = '';
  if (hoverCoord) {
    const { x, y } = hoverCoord;
    if (x > 0 && y > 0) hoveredQuadrant = 'I';
    else if (x < 0 && y > 0) hoveredQuadrant = 'II';
    else if (x < 0 && y < 0) hoveredQuadrant = 'III';
    else if (x > 0 && y < 0) hoveredQuadrant = 'IV';
    else if (x === 0 && y !== 0) hoveredQuadrant = 'Y-Axis';
    else if (y === 0 && x !== 0) hoveredQuadrant = 'X-Axis';
    else hoveredQuadrant = 'Origin';
  }

  const activePoints = showTargetOnly ? [] : points;

  // Form shape path if connecting points
  const shapePointsStr = activePoints.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');

  return (
    <div className="relative w-full aspect-square bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm select-none">
      {/* Quadrant labels overlay */}
      {settings.showQuadrantLabels && (
        <div className="absolute inset-0 pointer-events-none flex flex-wrap text-slate-300/40 dark:text-slate-700/30 text-2xl font-bold font-sans p-8">
          <div className="w-1/2 h-1/2 flex items-start justify-end pr-4 pt-4">Quadrant II (-, +)</div>
          <div className="w-1/2 h-1/2 flex items-start justify-start pl-4 pt-4">Quadrant I (+, +)</div>
          <div className="w-1/2 h-1/2 flex items-end justify-end pr-4 pb-4">Quadrant III (-, -)</div>
          <div className="w-1/2 h-1/2 flex items-end justify-start pl-4 pb-4">Quadrant IV (+, -)</div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        id="cartesian-grid-svg"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-full cursor-crosshair overflow-visible touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={e => {
          // Prevent drag trigger if we click directly on a circle (handled by circle)
          if ((e.target as Element).tagName === 'circle') return;
          handlePointerMove(e);
        }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Background grid lines */}
        {gridLines}

        {/* Polar guidelines if enabled */}
        {settings.showPolarGuidelines && (
          <g className="pointer-events-none opacity-40 dark:opacity-30">
            {[0.25, 0.5, 0.75, 1.0].map((multiplier, idx) => {
              const radius = HALF_SIZE * multiplier;
              return (
                <circle
                  key={`polar-${idx}`}
                  cx={HALF_SIZE}
                  cy={HALF_SIZE}
                  r={radius}
                  fill="none"
                  className="stroke-indigo-200 dark:stroke-indigo-800"
                  strokeWidth="0.75"
                  strokeDasharray="4,4"
                />
              );
            })}
            {/* 45-degree guide lines */}
            <line x1={0} y1={0} x2={SVG_SIZE} y2={SVG_SIZE} className="stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1={0} y1={SVG_SIZE} x2={SVG_SIZE} y2={0} className="stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="0.5" strokeDasharray="4,4" />
          </g>
        )}

        {/* Primary Axes */}
        {settings.showAxes && (
          <g id="grid-axes">
            {/* X Axis */}
            <line
              x1={0}
              y1={HALF_SIZE}
              x2={SVG_SIZE}
              y2={HALF_SIZE}
              className="stroke-[#475569] dark:stroke-slate-500"
              strokeWidth="2.5"
            />
            {/* Y Axis */}
            <line
              x1={HALF_SIZE}
              y1={0}
              x2={HALF_SIZE}
              y2={SVG_SIZE}
              className="stroke-[#475569] dark:stroke-slate-500"
              strokeWidth="2.5"
            />
            {/* Origin indicator */}
            <circle
              cx={HALF_SIZE}
              cy={HALF_SIZE}
              r="4.5"
              className="fill-[#475569] dark:fill-slate-400"
            />
          </g>
        )}

        {/* Labels along X and Y axes */}
        {settings.showAxes && gridLabels}

        {/* Linear Equations Graph Layers */}
        {equations.filter(eq => eq.visible).map(eq => {
          const endpoints = getLineEndpoints(eq, range);
          if (!endpoints) return null;
          return (
            <g key={eq.id} id={`linear-eq-layer-${eq.id}`}>
              <line
                x1={toSvgX(endpoints.x1)}
                y1={toSvgY(endpoints.y1)}
                x2={toSvgX(endpoints.x2)}
                y2={toSvgY(endpoints.y2)}
                stroke={eq.color}
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-150 shadow-sm"
              />
              {/* Equation Label */}
              <text
                x={toSvgX(endpoints.x2) - (endpoints.x2 === range ? 10 : -10)}
                y={toSvgY(endpoints.y2) + (endpoints.y2 === range ? 14 : -6)}
                fill={eq.color}
                className="text-[10px] font-mono font-extrabold select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_1px_2px_rgba(15,23,42,0.9)]"
                textAnchor={endpoints.x2 === range ? "end" : "start"}
              >
                {eq.label}
              </text>
            </g>
          );
        })}

        {/* Closed Polygon Shape */}
        {settings.connectPoints && activePoints.length > 2 && (
          <polygon
            points={shapePointsStr}
            className={`transition-all duration-200 stroke-2 ${
              settings.fillShape
                ? 'fill-indigo-500/10 dark:fill-indigo-500/15 stroke-indigo-500'
                : 'fill-none stroke-indigo-500'
            }`}
            strokeDasharray={settings.fillShape ? "0" : "4,4"}
          />
        )}

        {/* Connected Path Lines (if exactly 2 points, or disabled polygon fill but connect is true) */}
        {settings.connectPoints && activePoints.length === 2 && (
          <line
            x1={toSvgX(activePoints[0].x)}
            y1={toSvgY(activePoints[0].y)}
            x2={toSvgX(activePoints[1].x)}
            y2={toSvgY(activePoints[1].y)}
            className="stroke-indigo-500 stroke-2"
          />
        )}

        {/* Euclidean Distance Highlight Line */}
        {distanceP1 && distanceP2 && distanceP1.id !== distanceP2.id && (
          <g id="euclidean-distance-highlight" className="pointer-events-none">
            <line
              x1={toSvgX(distanceP1.x)}
              y1={toSvgY(distanceP1.y)}
              x2={toSvgX(distanceP2.x)}
              y2={toSvgY(distanceP2.y)}
              className="stroke-amber-500 dark:stroke-amber-400"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            {/* Small subtle pulses */}
            <circle cx={toSvgX(distanceP1.x)} cy={toSvgY(distanceP1.y)} r="10" className="fill-amber-500/20 animate-ping" />
            <circle cx={toSvgX(distanceP2.x)} cy={toSvgY(distanceP2.y)} r="10" className="fill-amber-500/20 animate-ping" />

            {/* Middle distance badge text */}
            {(() => {
              const midX = (toSvgX(distanceP1.x) + toSvgX(distanceP2.x)) / 2;
              const midY = (toSvgY(distanceP1.y) + toSvgY(distanceP2.y)) / 2;
              const d = Math.sqrt(Math.pow(distanceP2.x - distanceP1.x, 2) + Math.pow(distanceP2.y - distanceP1.y, 2));
              return (
                <g className="select-none pointer-events-none">
                  {/* Badge background */}
                  <rect
                    x={midX - 35}
                    y={midY - 10}
                    width="70"
                    height="18"
                    rx="4"
                    className="fill-slate-900/95 dark:fill-slate-800/95 stroke-amber-500/40 dark:stroke-amber-400/40"
                    strokeWidth="1"
                  />
                  {/* Badge text */}
                  <text
                    x={midX}
                    y={midY + 3}
                    className="text-[9px] font-mono font-extrabold fill-amber-300 dark:fill-amber-400"
                    textAnchor="middle"
                  >
                    d ≈ {d.toFixed(2)}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* Connected path if more than 2 but not forming closed polygon */}
        {settings.connectPoints && activePoints.length > 2 && !settings.fillShape && (
          <polyline
            points={shapePointsStr}
            className="fill-none stroke-indigo-500 stroke-2"
          />
        )}

        {/* Active hovered coordinate crosshair helper */}
        {hoverCoord && isHoveringGrid && (
          <g className="pointer-events-none opacity-60">
            {/* Vertical crosshair tracker */}
            <line
              x1={hoverCoord.svgX}
              y1={0}
              x2={hoverCoord.svgX}
              y2={SVG_SIZE}
              className="stroke-dashed stroke-indigo-300 dark:stroke-indigo-700"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            {/* Horizontal crosshair tracker */}
            <line
              x1={0}
              y1={hoverCoord.svgY}
              x2={SVG_SIZE}
              y2={hoverCoord.svgY}
              className="stroke-dashed stroke-indigo-300 dark:stroke-indigo-700"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            {/* Hover dot */}
            <circle
              cx={hoverCoord.svgX}
              cy={hoverCoord.svgY}
              r="5"
              className="fill-indigo-500 dark:fill-indigo-400"
            />
          </g>
        )}

        {/* Render target point if in Challenge Mode */}
        {targetPoint && (
          <g id="target-point-marker">
            <circle
              cx={toSvgX(targetPoint.x)}
              cy={toSvgY(targetPoint.y)}
              r="12"
              className="fill-none stroke-emerald-500 dark:stroke-emerald-400 animate-ping"
              strokeWidth="1.5"
            />
            {/* Outer ring */}
            <circle
              cx={toSvgX(targetPoint.x)}
              cy={toSvgY(targetPoint.y)}
              r="8"
              fill={targetPoint.color || '#10b981'}
            />
            {/* Middle white ring */}
            <circle
              cx={toSvgX(targetPoint.x)}
              cy={toSvgY(targetPoint.y)}
              r="6"
              fill="#ffffff"
            />
            {/* Inner center */}
            <circle
              cx={toSvgX(targetPoint.x)}
              cy={toSvgY(targetPoint.y)}
              r="4"
              fill={targetPoint.color || '#10b981'}
            />
            {targetPoint.label && (
              <text
                x={toSvgX(targetPoint.x)}
                y={toSvgY(targetPoint.y) - 14}
                className="text-xs font-bold fill-emerald-600 dark:fill-emerald-400 font-sans"
                textAnchor="middle"
              >
                {targetPoint.label}
              </text>
            )}
          </g>
        )}

        {/* Render standard plotted points */}
        <g id="plotted-points">
          {activePoints.map((point) => {
            const px = toSvgX(point.x);
            const py = toSvgY(point.y);
            const isDragging = activeDragId === point.id;

            return (
              <g key={point.id} className="cursor-grab active:cursor-grabbing">
                {/* Glow during drag */}
                {isDragging && (
                  <circle
                    cx={px}
                    cy={py}
                    r="16"
                    className="fill-indigo-400/20 dark:fill-indigo-500/20 animate-pulse"
                  />
                )}
                {/* Outer interactive ring */}
                <circle
                  cx={px}
                  cy={py}
                  r="14"
                  fill="transparent"
                  onPointerDown={(e) => handlePointerDown(e, point.id)}
                  className="hover:fill-slate-400/10 dark:hover:fill-slate-500/10 transition-colors"
                />
                
                {/* Outer concentric stroke (the box-shadow look) */}
                <circle
                  cx={px}
                  cy={py}
                  r="8"
                  fill={point.color}
                  className="transition-all duration-75"
                  onPointerDown={(e) => handlePointerDown(e, point.id)}
                />
                
                {/* Middle white border ring */}
                <circle
                  cx={px}
                  cy={py}
                  r="6"
                  fill="#ffffff"
                  className="transition-all duration-75"
                  onPointerDown={(e) => handlePointerDown(e, point.id)}
                />
                
                {/* Inner main point */}
                <circle
                  cx={px}
                  cy={py}
                  r="4"
                  fill={point.color}
                  className="transition-all duration-75"
                  onPointerDown={(e) => handlePointerDown(e, point.id)}
                />

                {/* Coordinate text label near the point */}
                <g className="pointer-events-none select-none">
                  {/* Subtle background rect for perfect readability */}
                  <rect
                    x={px + 10}
                    y={py - 22}
                    width={56}
                    height={16}
                    rx="3"
                    className="fill-white/85 dark:fill-slate-900/85 stroke-slate-200/50 dark:stroke-slate-800/50"
                    strokeWidth="0.5"
                  />
                  <text
                    x={px + 14}
                    y={py - 10}
                    className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans"
                  >
                    {point.label}({point.x},{point.y})
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Real-time Coordinate Overlay under cursor */}
      {hoverCoord && isHoveringGrid && (
        <div
          id="coordinate-tooltip-overlay"
          className="absolute bottom-6 left-6 bg-slate-900/90 dark:bg-slate-950/95 text-white backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex flex-col gap-0.5 border border-slate-700/50 shadow-md animate-fade-in pointer-events-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Position:</span>
            <span className="text-indigo-300 font-bold">({hoverCoord.x}, {hoverCoord.y})</span>
          </div>
          {hoveredQuadrant && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Location:</span>
              <span className="text-emerald-400">{hoveredQuadrant}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
