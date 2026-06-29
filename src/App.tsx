import React, { useState } from 'react';
import { Point, GridSettings, ActiveTab, LinearEquation } from './types';
import CartesianGrid from './components/CartesianGrid';
import PlotterTab from './components/PlotterTab';
import ChallengesTab from './components/ChallengesTab';
import SolverTab from './components/SolverTab';
import GanitaManjariTab from './components/GanitaManjariTab';
import {
  Compass,
  HelpCircle,
  Calculator,
  Target,
  BookOpen,
  Sparkles,
  X,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';

export default function App() {
  const [points, setPoints] = useState<Point[]>([
    { id: '1', label: 'A', x: 3, y: 4, color: '#6366f1' },
    { id: '2', label: 'B', x: -5, y: -2, color: '#ec4899' },
  ]);

  const [equations, setEquations] = useState<LinearEquation[]>([
    { id: 'eq-1', type: 'slope-intercept', m: 1, c: 1, color: '#10b981', visible: true, label: 'y = 1x + 1' },
    { id: 'eq-2', type: 'slope-intercept', m: -2, c: 4, color: '#f59e0b', visible: false, label: 'y = -2x + 4' },
  ]);

  const [settings, setSettings] = useState<GridSettings>({
    range: 10,
    snap: 'integer',
    showAxes: true,
    showGridLines: true,
    showQuadrantLabels: true,
    showPolarGuidelines: false,
    connectPoints: false,
    fillShape: false,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('plotter');
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number; label: string; color: string } | null>(null);
  const [showTargetOnly, setShowTargetOnly] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [distanceP1Id, setDistanceP1Id] = useState<string>('');
  const [distanceP2Id, setDistanceP2Id] = useState<string>('');

  const handleGridClick = (x: number, y: number) => {
    // If in challenge mode, handle point checking differently or skip adding points depending on type
    if (activeTab === 'challenges') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const label = alphabet[points.length % 26];
      const newPoint: Point = {
        id: crypto.randomUUID(),
        label,
        x,
        y,
        color: '#6366f1',
      };
      setPoints([newPoint]); // Only record the single latest clicked point for plot challenge verification
      return;
    }

    // Standard mode: check duplicate coordinate
    if (points.some(p => p.x === x && p.y === y)) return;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const label = alphabet[points.length % 26] + (points.length >= 26 ? Math.floor(points.length / 26) : '');
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
    const color = colors[points.length % colors.length];

    const newPoint: Point = {
      id: crypto.randomUUID(),
      label,
      x,
      y,
      color,
    };
    setPoints(prev => [...prev, newPoint]);
  };

  const handlePointDrag = (id: string, newX: number, newY: number) => {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, x: newX, y: newY } : p));
  };

  const handleClearPoints = () => {
    setPoints([]);
  };

  const handleLoadPreset = (presetName: string) => {
    if (presetName === 'triangle') {
      setPoints([
        { id: 't1', label: 'A', x: -4, y: -2, color: '#6366f1' },
        { id: 't2', label: 'B', x: 2, y: -2, color: '#ec4899' },
        { id: 't3', label: 'C', x: -4, y: 3, color: '#f59e0b' },
      ]);
      setSettings(prev => ({ ...prev, connectPoints: true, fillShape: true, range: 10 }));
    } else if (presetName === 'square') {
      setPoints([
        { id: 's1', label: 'A', x: -3, y: -3, color: '#6366f1' },
        { id: 's2', label: 'B', x: 5, y: -3, color: '#ec4899' },
        { id: 's3', label: 'C', x: 5, y: 3, color: '#f59e0b' },
        { id: 's4', label: 'D', x: -3, y: 3, color: '#10b981' },
      ]);
      setSettings(prev => ({ ...prev, connectPoints: true, fillShape: true, range: 10 }));
    } else if (presetName === 'linear') {
      setPoints([
        { id: 'l1', label: 'A', x: -2, y: -5, color: '#3b82f6' },
        { id: 'l2', label: 'B', x: 0, y: -1, color: '#8b5cf6' },
        { id: 'l3', label: 'C', x: 2, y: 3, color: '#f59e0b' },
        { id: 'l4', label: 'D', x: 4, y: 7, color: '#ec4899' },
      ]);
      setSettings(prev => ({ ...prev, connectPoints: true, fillShape: false, range: 10 }));
    } else if (presetName === 'parabola') {
      setPoints([
        { id: 'p1', label: 'A', x: -3, y: 5, color: '#ef4444' },
        { id: 'p2', label: 'B', x: -2, y: 0, color: '#f59e0b' },
        { id: 'p3', label: 'C', x: -1, y: -3, color: '#10b981' },
        { id: 'p4', label: 'D', x: 0, y: -4, color: '#3b82f6' },
        { id: 'p5', label: 'E', x: 1, y: -3, color: '#6366f1' },
        { id: 'p6', label: 'F', x: 2, y: 0, color: '#8b5cf6' },
        { id: 'p7', label: 'G', x: 3, y: 5, color: '#ec4899' },
      ]);
      setSettings(prev => ({ ...prev, connectPoints: true, fillShape: false, range: 10 }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/85 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              Math Coordinate Plotter
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded-md">
                v2.1
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Interactive 2D Cartesian Coordinate Laboratory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-coordinate-guide-toggle"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-850 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Guide</span>
          </button>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Cartesian Plane */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-sans">
                {activeTab === 'challenges'
                  ? '🎯 Challenge Arena: Solve coordinate objectives using the grid below'
                  : '💡 Interactive Grid: Click on the coordinate plane to plot custom points'}
              </p>
            </div>
          </div>

          <CartesianGrid
            points={points}
            settings={settings}
            equations={equations}
            onGridClick={handleGridClick}
            onPointDrag={handlePointDrag}
            targetPoint={targetPoint}
            showTargetOnly={showTargetOnly}
            distanceP1Id={distanceP1Id}
            distanceP2Id={distanceP2Id}
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span>Grid Origin: (0, 0)</span>
            <span>Interval Step: 1.0</span>
            <span>Visual Snapping: {settings.snap === 'none' ? 'None' : settings.snap === 'half' ? '0.5 Units' : '1.0 Unit'}</span>
          </div>
        </section>

        {/* Right Column: Tab Panels & Solvers */}
        <section className="lg:col-span-6 flex flex-col gap-6">
          {/* Tab Selection */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              id="tab-btn-plotter"
              onClick={() => {
                setActiveTab('plotter');
                setTargetPoint(null);
                setShowTargetOnly(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'plotter'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Free Plotter</span>
            </button>

            <button
              id="tab-btn-challenges"
              onClick={() => {
                setActiveTab('challenges');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'challenges'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Challenges</span>
            </button>

            <button
              id="tab-btn-solver"
              onClick={() => {
                setActiveTab('solver');
                setTargetPoint(null);
                setShowTargetOnly(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'solver'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Step Solver</span>
            </button>

            <button
              id="tab-btn-ganita-manjari"
              onClick={() => {
                setActiveTab('ganita-manjari');
                setTargetPoint(null);
                setShowTargetOnly(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'ganita-manjari'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ganita Manjari</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white dark:bg-slate-900/40 rounded-2xl border-0">
            {activeTab === 'plotter' && (
              <PlotterTab
                points={points}
                settings={settings}
                setPoints={setPoints}
                setSettings={setSettings}
                onAddPoint={handleGridClick}
                onClearPoints={handleClearPoints}
                onLoadPreset={handleLoadPreset}
                equations={equations}
                setEquations={setEquations}
              />
            )}

            {activeTab === 'challenges' && (
              <ChallengesTab
                gridPoints={points}
                setPoints={setPoints}
                settings={settings}
                setSettings={setSettings}
                onSetTargetPoint={setTargetPoint}
                onSetShowTargetOnly={setShowTargetOnly}
              />
            )}

            {activeTab === 'solver' && (
              <SolverTab
                points={points}
                point1Id={distanceP1Id}
                setPoint1Id={setDistanceP1Id}
                point2Id={distanceP2Id}
                setPoint2Id={setDistanceP2Id}
              />
            )}

            {activeTab === 'ganita-manjari' && (
              <GanitaManjariTab />
            )}
          </div>
        </section>
      </main>

      {/* Coordinate Plane Educational Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              id="btn-close-help-modal"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-sans">
                Cartesian Coordinates Tutorial
              </h3>
            </div>

            <div className="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              <p>
                The **Cartesian Coordinate System** is a branch of mathematics developed by the French philosopher and mathematician **René Descartes** in 1637. It bridges the gap between algebra and geometry by using a pair of numbers to represent exact positions on a flat 2D surface.
              </p>

              <div className="border-l-2 border-indigo-500 pl-3 py-1 bg-indigo-500/5 rounded-r-xl">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Ordered Pairs (x, y)</span>
                Every point on the coordinate grid is defined by an ordered pair written inside parenthesis: `(x, y)`.
                - **X Coordinate (Abscissa)**: The horizontal distance from the center. Left is negative, right is positive.
                - **Y Coordinate (Ordinate)**: The vertical distance from the center. Down is negative, up is positive.
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">How to Plot a Point Step-by-Step:</span>
                <ol className="list-decimal pl-4 flex flex-col gap-1">
                  <li>Start at the **Origin** `(0,0)`, where the bold axes cross.</li>
                  <li>Look at the first number (**X**). If it is `3`, move `3` units to the right. If `-3`, move `3` units left.</li>
                  <li>From that position, look at the second number (**Y**). If it is `4`, move `4` units straight up. If `-4`, move `4` units straight down.</li>
                  <li>Mark the spot with a coordinate marker!</li>
                </ol>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold mb-1">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <span>Pro Tip: Quadrant Signs</span>
                </div>
                <ul className="list-disc pl-4 grid grid-cols-2 gap-0.5 font-mono text-[11px]">
                  <li>Quadrant I: (+, +)</li>
                  <li>Quadrant II: (-, +)</li>
                  <li>Quadrant III: (-, -)</li>
                  <li>Quadrant IV: (+, -)</li>
                </ul>
              </div>

              <button
                id="btn-dismiss-help-modal"
                onClick={() => setShowHelpModal(false)}
                className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10"
              >
                Let's Plot!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto py-4 text-center text-xs text-slate-400 font-mono">
        Made with ❤️ for Math Explorers everywhere
      </footer>
    </div>
  );
}
