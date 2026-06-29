import React, { useState, useEffect } from 'react';
import { Point, Challenge, ChallengeType, GridSettings } from '../types';
import { Target, Award, CheckCircle, AlertCircle, RefreshCw, Trophy, HelpCircle, Star } from 'lucide-react';

interface ChallengesTabProps {
  gridPoints: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  settings: GridSettings;
  setSettings: React.Dispatch<React.SetStateAction<GridSettings>>;
  onSetTargetPoint: (pt: { x: number; y: number; label: string; color: string } | null) => void;
  onSetShowTargetOnly: (show: boolean) => void;
}

export default function ChallengesTab({
  gridPoints,
  setPoints,
  settings,
  setSettings,
  onSetTargetPoint,
  onSetShowTargetOnly,
}: ChallengesTabProps) {
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [challengeType, setChallengeType] = useState<ChallengeType>('plot');

  // Input for 'read' mode
  const [readInputX, setReadInputX] = useState<string>('');
  const [readInputY, setReadInputY] = useState<string>('');

  // Status message
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'failure' | 'hint';
    message: string;
  }>({ status: 'idle', message: '' });

  // Generate a random coordinate based on range and snapping
  const getRandomCoordinate = (rangeLimit: number, diff: 'easy' | 'medium' | 'hard') => {
    let multiplier = 1;
    if (diff === 'easy') {
      // Small integer coordinates, Quadrant I or axes
      const x = Math.floor(Math.random() * 6); // 0 to 5
      const y = Math.floor(Math.random() * 6); // 0 to 5
      return { x, y };
    } else if (diff === 'medium') {
      // Full coordinate plane integers
      const x = Math.floor(Math.random() * (rangeLimit * 2 + 1)) - rangeLimit;
      const y = Math.floor(Math.random() * (rangeLimit * 2 + 1)) - rangeLimit;
      return { x, y };
    } else {
      // Decimals (halves) in full coordinate plane
      const x = (Math.floor(Math.random() * (rangeLimit * 4 + 1)) - rangeLimit * 2) / 2;
      const y = (Math.floor(Math.random() * (rangeLimit * 4 + 1)) - rangeLimit * 2) / 2;
      return { x, y };
    }
  };

  const startNewChallenge = (type = challengeType, diff = difficulty) => {
    setFeedback({ status: 'idle', message: '' });
    setReadInputX('');
    setReadInputY('');
    setPoints([]); // Clear standard grid points so the canvas is clean

    const rangeLimit = Math.min(settings.range, 10); // Standardize on 10 for game play

    if (type === 'plot') {
      onSetShowTargetOnly(false);
      const target = getRandomCoordinate(rangeLimit, diff);
      const id = crypto.randomUUID();

      const alphabet = 'PQRSTUVW';
      const label = alphabet[Math.floor(Math.random() * alphabet.length)];

      const chal: Challenge = {
        id,
        type: 'plot',
        instructions: `Click exactly on the grid to plot the point: ${label}(${target.x}, ${target.y})`,
        target,
        difficulty: diff,
        pointsReward: diff === 'easy' ? 10 : diff === 'medium' ? 20 : 35,
      };

      setCurrentChallenge(chal);
      onSetTargetPoint(null); // No target indicator shown, user has to find it!
    } else if (type === 'read') {
      // Place a target point on the grid first, which the user must identify
      onSetShowTargetOnly(true);
      const target = getRandomCoordinate(rangeLimit, diff);
      const id = crypto.randomUUID();

      const chal: Challenge = {
        id,
        type: 'read',
        instructions: 'Read the coordinate values of the highlighted green marker:',
        pointsToIdentify: target,
        difficulty: diff,
        pointsReward: diff === 'easy' ? 10 : diff === 'medium' ? 20 : 35,
      };

      setCurrentChallenge(chal);
      // Highlight the target point for them to read
      onSetTargetPoint({ x: target.x, y: target.y, label: '?', color: '#10b981' });
    } else if (type === 'shape') {
      onSetShowTargetOnly(false);
      onSetTargetPoint(null);

      const shapes = [
        { name: 'Square', desc: 'Create a closed square using 4 plotted vertices. Ensure all side lengths are equal and orthogonal.' },
        { name: 'Right Triangle', desc: 'Create a closed right-angled triangle using exactly 3 plotted vertices.' },
        { name: 'Rectangle', desc: 'Create a closed rectangle using 4 vertices (sides should align with grid lines).' }
      ];

      const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
      const id = crypto.randomUUID();

      const chal: Challenge = {
        id,
        type: 'shape',
        instructions: `Plot vertices on the grid to build a ${selectedShape.name}. Make sure "Connect Points" is enabled in settings to close the shape!`,
        targetShape: selectedShape.name.toLowerCase().replace(' ', '_'),
        difficulty: 'medium',
        pointsReward: 40,
      };

      setCurrentChallenge(chal);
      setSettings(prev => ({ ...prev, connectPoints: true, fillShape: true }));
    }
  };

  // Run when user clicks on grid (ONLY relevant in 'plot' challenge mode)
  useEffect(() => {
    if (!currentChallenge || currentChallenge.type !== 'plot' || gridPoints.length === 0) return;

    const latestPoint = gridPoints[gridPoints.length - 1];
    const target = currentChallenge.target!;

    if (latestPoint.x === target.x && latestPoint.y === target.y) {
      // Correct!
      const reward = currentChallenge.pointsReward;
      setScore(prev => prev + reward);
      setStreak(prev => prev + 1);
      setFeedback({
        status: 'success',
        message: `🌟 Excellent job! You successfully plotted (${target.x}, ${target.y})! +${reward} points.`,
      });
      // Show actual target marker in green
      onSetTargetPoint({ x: target.x, y: target.y, label: 'Correct!', color: '#10b981' });
    } else {
      // Incorrect - provide educational guidance
      const diffX = target.x - latestPoint.x;
      const diffY = target.y - latestPoint.y;

      let guideMsg = `You clicked at (${latestPoint.x}, ${latestPoint.y}). `;
      if (diffX > 0) guideMsg += `Move right by ${diffX} ${diffX === 1 ? 'unit' : 'units'}. `;
      if (diffX < 0) guideMsg += `Move left by ${Math.abs(diffX)} ${Math.abs(diffX) === 1 ? 'unit' : 'units'}. `;
      if (diffY > 0) guideMsg += `Move up by ${diffY} ${diffY === 1 ? 'unit' : 'units'}. `;
      if (diffY < 0) guideMsg += `Move down by ${Math.abs(diffY)} ${Math.abs(diffY) === 1 ? 'unit' : 'units'}. `;

      setStreak(0);
      setFeedback({
        status: 'hint',
        message: `🔍 Not quite! ${guideMsg} Try clicking again!`,
      });
      // Clear their incorrect point to allow retry
      setTimeout(() => {
        setPoints([]);
      }, 2000);
    }
  }, [gridPoints, currentChallenge]);

  // Handle read input validation
  const handleReadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChallenge || !currentChallenge.pointsToIdentify) return;

    const ansX = parseFloat(readInputX);
    const ansY = parseFloat(readInputY);
    const target = currentChallenge.pointsToIdentify;

    if (ansX === target.x && ansY === target.y) {
      const reward = currentChallenge.pointsReward;
      setScore(prev => prev + reward);
      setStreak(prev => prev + 1);
      setFeedback({
        status: 'success',
        message: `🎉 Spot on! The coordinates of the green point are indeed (${target.x}, ${target.y})! +${reward} points.`,
      });
    } else {
      setStreak(0);
      let quadrantTip = '';
      if (target.x > 0 && target.y > 0) quadrantTip = 'Hint: The point is in Quadrant I, so both coordinates are positive.';
      else if (target.x < 0 && target.y > 0) quadrantTip = 'Hint: The point is in Quadrant II, so X is negative and Y is positive.';
      else if (target.x < 0 && target.y < 0) quadrantTip = 'Hint: The point is in Quadrant III, so both coordinates are negative.';
      else if (target.x > 0 && target.y < 0) quadrantTip = 'Hint: The point is in Quadrant IV, so X is positive and Y is negative.';

      setFeedback({
        status: 'failure',
        message: `❌ Incorrect. You entered (${ansX || 0}, ${ansY || 0}). Keep trying! ${quadrantTip}`,
      });
    }
  };

  // Shape validation formula
  const handleVerifyShape = () => {
    if (!currentChallenge || currentChallenge.type !== 'shape') return;

    const pts = gridPoints;
    const targetShape = currentChallenge.targetShape;

    if (targetShape === 'right_triangle') {
      if (pts.length !== 3) {
        setFeedback({ status: 'failure', message: '❌ A triangle must have exactly 3 vertices. Plot 3 points!' });
        return;
      }
      // Check if it's a right triangle using Pythagorean theorem
      // Calculate squared side lengths
      const d1_sq = Math.pow(pts[0].x - pts[1].x, 2) + Math.pow(pts[0].y - pts[1].y, 2);
      const d2_sq = Math.pow(pts[1].x - pts[2].x, 2) + Math.pow(pts[1].y - pts[2].y, 2);
      const d3_sq = Math.pow(pts[2].x - pts[0].x, 2) + Math.pow(pts[2].y - pts[0].y, 2);

      const sides = [d1_sq, d2_sq, d3_sq].sort((a, b) => a - b);
      const errorThreshold = 0.01;

      if (Math.abs(sides[0] + sides[1] - sides[2]) < errorThreshold) {
        const reward = currentChallenge.pointsReward;
        setScore(prev => prev + reward);
        setStreak(prev => prev + 1);
        setFeedback({
          status: 'success',
          message: `🎉 Fantastic! You drew a right triangle with vertices at (${pts[0].x}, ${pts[0].y}), (${pts[1].x}, ${pts[1].y}), and (${pts[2].x}, ${pts[2].y})! +${reward} points!`,
        });
      } else {
        setStreak(0);
        setFeedback({
          status: 'failure',
          message: `❌ Not a right triangle. The squared distances of your sides are ${sides[0].toFixed(1)}, ${sides[1].toFixed(1)}, and ${sides[2].toFixed(1)}. They do not satisfy a² + b² = c²!`,
        });
      }
    } else if (targetShape === 'square' || targetShape === 'rectangle') {
      if (pts.length !== 4) {
        setFeedback({ status: 'failure', message: `❌ A ${targetShape} must have exactly 4 vertices. Plot 4 points!` });
        return;
      }

      // Check if it forms a rectangle/square
      // Let's sort the vertices. We can sort them polar-wise relative to their centroid so we traverse in clockwise order
      const cx = pts.reduce((sum, p) => sum + p.x, 0) / 4;
      const cy = pts.reduce((sum, p) => sum + p.y, 0) / 4;

      const sortedPts = [...pts].sort((a, b) => {
        const angleA = Math.atan2(a.y - cy, a.x - cx);
        const angleB = Math.atan2(b.y - cy, b.x - cx);
        return angleA - angleB;
      });

      // Side vectors
      const d01_sq = Math.pow(sortedPts[0].x - sortedPts[1].x, 2) + Math.pow(sortedPts[0].y - sortedPts[1].y, 2);
      const d12_sq = Math.pow(sortedPts[1].x - sortedPts[2].x, 2) + Math.pow(sortedPts[1].y - sortedPts[2].y, 2);
      const d23_sq = Math.pow(sortedPts[2].x - sortedPts[3].x, 2) + Math.pow(sortedPts[2].y - sortedPts[3].y, 2);
      const d30_sq = Math.pow(sortedPts[3].x - sortedPts[0].x, 2) + Math.pow(sortedPts[3].y - sortedPts[0].y, 2);

      // Diagonals
      const diag1_sq = Math.pow(sortedPts[0].x - sortedPts[2].x, 2) + Math.pow(sortedPts[0].y - sortedPts[2].y, 2);
      const diag2_sq = Math.pow(sortedPts[1].x - sortedPts[3].x, 2) + Math.pow(sortedPts[1].y - sortedPts[3].y, 2);

      const threshold = 0.05;
      const isRectangle =
        Math.abs(d01_sq - d23_sq) < threshold &&
        Math.abs(d12_sq - d30_sq) < threshold &&
        Math.abs(diag1_sq - diag2_sq) < threshold;

      if (isRectangle) {
        if (targetShape === 'square') {
          // Check if all sides are equal length
          const isSquare = Math.abs(d01_sq - d12_sq) < threshold;
          if (isSquare) {
            const reward = currentChallenge.pointsReward;
            setScore(prev => prev + reward);
            setStreak(prev => prev + 1);
            setFeedback({
              status: 'success',
              message: `🌟 Awesome! You plotted a perfect square with equal sides of length ${(Math.sqrt(d01_sq)).toFixed(1)} units! +${reward} points!`,
            });
          } else {
            setStreak(0);
            setFeedback({
              status: 'failure',
              message: `❌ Close, but that is a rectangle, not a square! The sides are not equal length (lengths: ${(Math.sqrt(d01_sq)).toFixed(1)} and ${(Math.sqrt(d12_sq)).toFixed(1)}).`,
            });
          }
        } else {
          // Rectangle correct
          const reward = currentChallenge.pointsReward;
          setScore(prev => prev + reward);
          setStreak(prev => prev + 1);
          setFeedback({
            status: 'success',
            message: `🌟 Superb! You successfully plotted a rectangle with dimensions ${(Math.sqrt(d01_sq)).toFixed(1)} x ${(Math.sqrt(d12_sq)).toFixed(1)} units! +${reward} points!`,
          });
        }
      } else {
        setStreak(0);
        setFeedback({
          status: 'failure',
          message: '❌ This shape is not rectangular. Verify that all opposite sides are equal, and internal angles are 90 degrees.',
        });
      }
    }
  };

  // Start initial challenge on component mount or settings change
  useEffect(() => {
    startNewChallenge(challengeType, difficulty);
  }, [challengeType, difficulty]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onSetTargetPoint(null);
      onSetShowTargetOnly(false);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Score and Stats Display Banner */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex items-center justify-between shadow-md relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              MATHS CHALLENGE CORNER
            </div>
            <div className="text-lg font-bold font-sans flex items-center gap-1.5">
              Current Score: <span className="text-indigo-400 font-mono text-xl">{score}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
          <div className="text-center">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Streak</div>
            <div className="text-lg font-extrabold text-amber-400 font-mono flex items-center gap-1 justify-center">
              🔥 {streak}
            </div>
          </div>
        </div>
      </div>

      {/* Select Mode & Difficulty */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono">
          Challenge Mode Settings
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider font-sans">
              Select Challenge Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['plot', 'read', 'shape'] as ChallengeType[]).map(type => (
                <button
                  key={type}
                  id={`btn-challenge-type-${type}`}
                  onClick={() => setChallengeType(type)}
                  className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                    challengeType === type
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-800 dark:border-slate-800 shadow-sm'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type === 'plot' ? 'Plot Point' : type === 'read' ? 'Identify Point' : 'Draw Shape'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider font-sans">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  id={`btn-difficulty-${diff}`}
                  disabled={challengeType === 'shape'}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all border disabled:opacity-50 ${
                    difficulty === diff && challengeType !== 'shape'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Challenge Prompt */}
      {currentChallenge && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active Mission
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 font-sans leading-snug">
                  {currentChallenge.instructions}
                </h3>
              </div>
            </div>

            <button
              id="btn-skip-mission"
              onClick={() => startNewChallenge(challengeType, difficulty)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent"
              title="Generate new coordinate mission"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive UI specific to Challenge Type */}
          {currentChallenge.type === 'read' && (
            <form onSubmit={handleReadSubmit} className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
              <div className="flex items-end gap-3 max-w-sm">
                <div className="flex-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Enter X Value
                  </label>
                  <input
                    id="read-input-x"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. -4"
                    value={readInputX}
                    onChange={e => setReadInputX(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Enter Y Value
                  </label>
                  <input
                    id="read-input-y"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5"
                    value={readInputY}
                    onChange={e => setReadInputY(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                </div>
                <button
                  id="btn-submit-read-coord"
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm"
                >
                  Verify Coordinates
                </button>
              </div>
            </form>
          )}

          {currentChallenge.type === 'shape' && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-mono font-bold text-indigo-500">Current Vertices Plotted:</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold">
                  {gridPoints.length === 0
                    ? 'No points plotted yet'
                    : gridPoints.map(p => `${p.label}(${p.x}, ${p.y})`).join(' → ')}
                </span>
              </div>
              <button
                id="btn-verify-shape-geometry"
                onClick={handleVerifyShape}
                disabled={gridPoints.length < 3}
                className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Verify Constructed Shape
              </button>
            </div>
          )}

          {/* Feedback Section */}
          {feedback.message && (
            <div
              id="challenge-feedback-box"
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 transition-all animate-fade-in ${
                feedback.status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400'
                  : feedback.status === 'failure'
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-400'
              }`}
            >
              {feedback.status === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold leading-relaxed">{feedback.message}</p>
                {feedback.status === 'success' && (
                  <button
                    id="btn-next-mission"
                    onClick={() => startNewChallenge(challengeType, difficulty)}
                    className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Next Mission →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coordinate Quad Rules & Cheatsheet Helper */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
            Coordinate Plane Reference Rules
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] font-sans text-slate-500 dark:text-slate-400">
          <div className="bg-white dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Quadrant I (+, +)</span>
            Both coordinates are positive numbers. Located in the upper right.
          </div>
          <div className="bg-white dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Quadrant II (-, +)</span>
            X is negative, Y is positive. Located in the upper left.
          </div>
          <div className="bg-white dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Quadrant III (-, -)</span>
            Both coordinates are negative numbers. Located in the lower left.
          </div>
          <div className="bg-white dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Quadrant IV (+, -)</span>
            X is positive, Y is negative. Located in the lower right.
          </div>
        </div>
      </div>
    </div>
  );
}
