import React, { useState } from 'react';
import { Point, GridSettings, LinearEquation } from '../types';
import {
  Plus,
  Trash2,
  Sliders,
  RefreshCw,
  Layers,
  Compass,
  Ruler,
  HelpCircle,
  Eye,
  EyeOff,
  Download,
  FileText,
  Image,
  Sparkles
} from 'lucide-react';

interface PlotterTabProps {
  points: Point[];
  settings: GridSettings;
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  setSettings: React.Dispatch<React.SetStateAction<GridSettings>>;
  onAddPoint: (x: number, y: number) => void;
  onClearPoints: () => void;
  onLoadPreset: (presetName: string) => void;
  equations: LinearEquation[];
  setEquations: React.Dispatch<React.SetStateAction<LinearEquation[]>>;
}

export default function PlotterTab({
  points,
  settings,
  setPoints,
  setSettings,
  onAddPoint,
  onClearPoints,
  onLoadPreset,
  equations,
  setEquations,
}: PlotterTabProps) {
  const [newX, setNewX] = useState<string>('');
  const [newY, setNewY] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#6366f1'); // Indigo

  // Linear Equation states
  const [eqType, setEqType] = useState<'slope-intercept' | 'vertical'>('slope-intercept');
  const [eqM, setEqM] = useState<string>('1');
  const [eqC, setEqC] = useState<string>('0');
  const [eqXVal, setEqXVal] = useState<string>('0');
  const [eqColor, setEqColor] = useState<string>('#10b981'); // default Emerald

  // Exporter utilities
  const exportAsSVG = () => {
    const svgEl = document.getElementById('cartesian-grid-svg');
    if (!svgEl) return;
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
    const serializer = new XMLSerializer();
    let svgSource = serializer.serializeToString(svgClone);
    if (!svgSource.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgSource = svgSource.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([svgSource], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cartesian_graph.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = () => {
    const svgEl = document.getElementById('cartesian-grid-svg');
    if (!svgEl) return;
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
    const serializer = new XMLSerializer();
    let svgSource = serializer.serializeToString(svgClone);
    if (!svgSource.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgSource = svgSource.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = document.createElement('img');
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgSource)));
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1000, 1000);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'cartesian_graph.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  const exportAsCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Label/Equation,X / Slope(m),Y / Intercept(c)\n';
    points.forEach(p => {
      csvContent += `Point,${p.label},${p.x},${p.y}\n`;
    });
    equations.forEach(eq => {
      if (eq.type === 'slope-intercept') {
        csvContent += `Linear Equation (y=mx+c),"${eq.label}",${eq.m},${eq.c}\n`;
      } else {
        csvContent += `Linear Equation (x=k),"${eq.label}",${eq.xVal ?? 0},-\n`;
      }
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'cartesian_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsJSON = () => {
    const data = {
      points,
      equations,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cartesian_laboratory.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddEquation = (e: React.FormEvent) => {
    e.preventDefault();
    if (eqType === 'slope-intercept') {
      const m = parseFloat(eqM);
      const c = parseFloat(eqC);
      if (isNaN(m) || isNaN(c)) return;

      let label = 'y = ';
      if (m === 0) {
        label += `${c}`;
      } else {
        const mStr = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`;
        if (c === 0) {
          label += mStr;
        } else if (c > 0) {
          label += `${mStr} + ${c}`;
        } else {
          label += `${mStr} - ${Math.abs(c)}`;
        }
      }

      const newEq: LinearEquation = {
        id: crypto.randomUUID(),
        type: 'slope-intercept',
        m,
        c,
        color: eqColor,
        visible: true,
        label,
      };
      setEquations(prev => [...prev, newEq]);
    } else {
      const xVal = parseFloat(eqXVal);
      if (isNaN(xVal)) return;

      const newEq: LinearEquation = {
        id: crypto.randomUUID(),
        type: 'vertical',
        m: 0,
        c: 0,
        xVal,
        color: eqColor,
        visible: true,
        label: `x = ${xVal}`,
      };
      setEquations(prev => [...prev, newEq]);
    }
  };

  const handleDeleteEquation = (id: string) => {
    setEquations(prev => prev.filter(eq => eq.id !== id));
  };

  const toggleEquationVisibility = (id: string) => {
    setEquations(prev => prev.map(eq => eq.id === id ? { ...eq, visible: !eq.visible } : eq));
  };

  const PRESET_COLORS = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ef4444', // Red
  ];

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseFloat(newX);
    const y = parseFloat(newY);

    if (isNaN(x) || isNaN(y)) return;

    // Check bounds
    if (Math.abs(x) > settings.range || Math.abs(y) > settings.range) {
      alert(`Coordinates must be between -${settings.range} and ${settings.range}`);
      return;
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextLabel = customLabel.trim() || alphabet[points.length % 26] + (points.length >= 26 ? Math.floor(points.length / 26) : '');

    const newPoint: Point = {
      id: crypto.randomUUID(),
      label: nextLabel,
      x,
      y,
      color: selectedColor,
    };

    setPoints(prev => [...prev, newPoint]);
    setNewX('');
    setNewY('');
    setCustomLabel('');
  };

  const handleUpdatePoint = (id: string, field: 'x' | 'y' | 'label', val: string) => {
    setPoints(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (field === 'label') {
          return { ...p, label: val };
        } else {
          const num = parseFloat(val);
          if (isNaN(num)) return p; // keep old or let typing continue
          // Clamp to grid range
          const clamped = Math.max(-settings.range, Math.min(settings.range, num));
          return { ...p, [field]: clamped };
        }
      })
    );
  };

  const handleDeletePoint = (id: string) => {
    setPoints(prev => prev.filter(p => p.id !== id));
  };

  // Grid Settings Toggles
  const toggleSetting = (key: keyof GridSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      range: parseInt(e.target.value, 10),
    }));
  };

  const handleSnapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      snap: e.target.value as any,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration & Preset Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">Grid Options & Presets</h2>
        </div>

        {/* Form elements for Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
              Grid Range (Axes Max)
            </label>
            <select
              id="grid-range-select"
              value={settings.range}
              onChange={handleRangeChange}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="5">± 5 units (Large)</option>
              <option value="10">± 10 units (Standard)</option>
              <option value="15">± 15 units</option>
              <option value="20">± 20 units (Dense)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
              Grid Alignment / Snapping
            </label>
            <select
              id="grid-snap-select"
              value={settings.snap}
              onChange={handleSnapChange}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">No Snapping (Continuous)</option>
              <option value="half">Snap to Half Units (0.5)</option>
              <option value="integer">Snap to Whole Units (1.0)</option>
            </select>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
            <input
              id="show-axes-toggle"
              type="checkbox"
              checked={settings.showAxes}
              onChange={() => toggleSetting('showAxes')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Show Axes</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
            <input
              id="show-grid-lines-toggle"
              type="checkbox"
              checked={settings.showGridLines}
              onChange={() => toggleSetting('showGridLines')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Grid Lines</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
            <input
              id="show-quadrants-toggle"
              type="checkbox"
              checked={settings.showQuadrantLabels}
              onChange={() => toggleSetting('showQuadrantLabels')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 font-sans">Quadrant Titles</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
            <input
              id="polar-guide-toggle"
              type="checkbox"
              checked={settings.showPolarGuidelines}
              onChange={() => toggleSetting('showPolarGuidelines')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Polar Rings</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
            <input
              id="connect-points-toggle"
              type="checkbox"
              checked={settings.connectPoints}
              onChange={() => toggleSetting('connectPoints')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Connect Points</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
            <input
              id="fill-shape-toggle"
              type="checkbox"
              checked={settings.fillShape}
              disabled={!settings.connectPoints}
              onChange={() => toggleSetting('fillShape')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 disabled:opacity-50"
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50">Fill Polygons</span>
          </label>
        </div>

        {/* Presets Quick-Load */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono">
            Load Quick Math Presets
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              id="btn-preset-triangle"
              onClick={() => onLoadPreset('triangle')}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 rounded-xl transition-colors border border-indigo-100/50 dark:border-indigo-900/40"
            >
              Right Triangle
            </button>
            <button
              id="btn-preset-square"
              onClick={() => onLoadPreset('square')}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 rounded-xl transition-colors border border-emerald-100/50 dark:border-emerald-900/40"
            >
              Rectangle
            </button>
            <button
              id="btn-preset-linear"
              onClick={() => onLoadPreset('linear')}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-400 rounded-xl transition-colors border border-amber-100/50 dark:border-amber-900/40"
            >
              Linear Line (y = 2x - 1)
            </button>
            <button
              id="btn-preset-parabola"
              onClick={() => onLoadPreset('parabola')}
              className="px-3 py-1.5 text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:hover:bg-pink-900/60 dark:text-pink-400 rounded-xl transition-colors border border-pink-100/50 dark:border-pink-900/40"
            >
              Parabola (Quadratic)
            </button>
          </div>
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleManualAdd} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">Plot Precise Coordinate</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-mono">Label</label>
            <input
              id="input-point-label"
              type="text"
              placeholder="e.g. A"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value.toUpperCase().slice(0, 3))}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-mono">X Coordinate</label>
            <input
              id="input-point-x"
              type="number"
              step="any"
              required
              placeholder={`-${settings.range} to ${settings.range}`}
              value={newX}
              onChange={e => setNewX(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-mono">Y Coordinate</label>
            <input
              id="input-point-y"
              type="number"
              step="any"
              required
              placeholder={`-${settings.range} to ${settings.range}`}
              value={newY}
              onChange={e => setNewY(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Color selection row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">Point Color:</span>
            <div className="flex gap-1.5 ml-1">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent scale-100 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            id="btn-add-precise-point"
            type="submit"
            className="px-4 py-2.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Plot Point
          </button>
        </div>
      </form>

      {/* Linear Equations Graph Builder */}
      <form onSubmit={handleAddEquation} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">Graph Linear Equation</h2>
        </div>

        <div className="flex items-center gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            type="button"
            onClick={() => setEqType('slope-intercept')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              eqType === 'slope-intercept'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            y = mx + c (Slope-Intercept)
          </button>
          <button
            type="button"
            onClick={() => setEqType('vertical')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              eqType === 'vertical'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            x = k (Vertical Line)
          </button>
        </div>

        {eqType === 'slope-intercept' ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-mono">Slope (m)</label>
              <input
                id="eq-input-m"
                type="number"
                step="any"
                value={eqM}
                onChange={e => setEqM(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-mono">Y-Intercept (c)</label>
              <input
                id="eq-input-c"
                type="number"
                step="any"
                value={eqC}
                onChange={e => setEqC(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. -1"
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-mono">X Constant value (k)</label>
            <input
              id="eq-input-xval"
              type="number"
              step="any"
              value={eqXVal}
              onChange={e => setEqXVal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`-${settings.range} to ${settings.range}`}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">Line Color:</span>
            <div className="flex gap-1.5 ml-1">
              {PRESET_COLORS.map(color => (
                <button
                  key={`eq-color-${color}`}
                  type="button"
                  onClick={() => setEqColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    eqColor === color ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent scale-100 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            id="btn-add-equation-line"
            type="submit"
            className="px-4 py-2.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Graph Line
          </button>
        </div>
      </form>

      {/* Point List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
              Active Plotted Points ({points.length})
            </h2>
          </div>
          {points.length > 0 && (
            <button
              id="btn-clear-all-points"
              onClick={onClearPoints}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-100 dark:border-rose-900/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {points.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 mb-1.5">No points plotted on the coordinate system yet.</p>
            <p className="text-[11px] text-slate-400 font-mono">
              💡 Hint: Click directly on the grid above to drop coordinate markers instantly!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {points.map((point) => (
              <div
                key={point.id}
                id={`point-row-${point.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: point.color }}
                  />
                  <input
                    id={`pt-lbl-${point.id}`}
                    type="text"
                    value={point.label}
                    onChange={e => handleUpdatePoint(point.id, 'label', e.target.value.toUpperCase().slice(0, 3))}
                    className="w-10 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-center font-bold text-xs py-1 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-400">X:</span>
                    <input
                      id={`pt-x-${point.id}`}
                      type="number"
                      step="any"
                      value={point.x}
                      onChange={e => handleUpdatePoint(point.id, 'x', e.target.value)}
                      className="w-14 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-center font-mono text-xs py-1 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-400">Y:</span>
                    <input
                      id={`pt-y-${point.id}`}
                      type="number"
                      step="any"
                      value={point.y}
                      onChange={e => handleUpdatePoint(point.id, 'y', e.target.value)}
                      className="w-14 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-center font-mono text-xs py-1 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  id={`btn-del-point-${point.id}`}
                  onClick={() => handleDeletePoint(point.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Delete point"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Linear Equations List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
            Plotted Equations ({equations.length})
          </h2>
        </div>

        {equations.length === 0 ? (
          <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">No custom equation lines plotted on the graph yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
            {equations.map(eq => (
              <div
                key={eq.id}
                id={`eq-row-${eq.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-750 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-1.5 rounded-full"
                    style={{ backgroundColor: eq.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {eq.label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`btn-toggle-vis-eq-${eq.id}`}
                    type="button"
                    onClick={() => toggleEquationVisibility(eq.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors"
                    title={eq.visible ? 'Hide line' : 'Show line'}
                  >
                    {eq.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    id={`btn-del-eq-${eq.id}`}
                    type="button"
                    onClick={() => handleDeleteEquation(eq.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Delete equation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Cartesian Work Suite */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2.5 mb-3">
          <Download className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-white">Export & Download Lab Work</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Save your plotted coordinate graph canvas and math datasets offline.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            id="btn-export-png"
            onClick={exportAsPNG}
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all hover:scale-[1.02] shadow-sm"
            title="Download visual graph as an offline PNG image file"
          >
            <Image className="w-4 h-4 text-emerald-400" />
            <span>Download PNG</span>
          </button>

          <button
            id="btn-export-svg"
            onClick={exportAsSVG}
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all hover:scale-[1.02] shadow-sm"
            title="Download pure SVG vector element file"
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Download SVG</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={exportAsCSV}
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all hover:scale-[1.02] shadow-sm"
            title="Download all active points and lines table as CSV"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Export CSV Data</span>
          </button>

          <button
            id="btn-export-json"
            onClick={exportAsJSON}
            className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all hover:scale-[1.02] shadow-sm"
            title="Save entire lab sandbox state as JSON file"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Export JSON Lab</span>
          </button>
        </div>
      </div>
    </div>
  );
}
