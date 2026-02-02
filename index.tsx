
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Dumbbell, 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronLeft, 
  Clock, 
  Music,
  Moon,
  Sun,
  Hand,
  Triangle,
  PenTool,
  Eye,
  Menu,
  X
} from 'lucide-react';

// --- Constants & Types ---

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WORKOUT_TYPES = {
  PUSH: 'PUSH',
  PULL: 'PULL',
  LEGS: 'LEGS',
  REST: 'REST'
};

const PPL_SCHEDULE = {
  Monday: WORKOUT_TYPES.PUSH,
  Tuesday: WORKOUT_TYPES.PULL,
  Wednesday: WORKOUT_TYPES.LEGS,
  Thursday: WORKOUT_TYPES.PUSH,
  Friday: WORKOUT_TYPES.PULL,
  Saturday: WORKOUT_TYPES.LEGS,
  Sunday: WORKOUT_TYPES.REST
};

const EXERCISES = {
  [WORKOUT_TYPES.PUSH]: ['Push-ups', 'Bench dips', 'Lateral raises (backpack)', 'Neck curls', 'Flat leg raises'],
  [WORKOUT_TYPES.PULL]: ['Pull-ups', 'One-hand rows (backpack)', 'Hammer curls (backpack)', 'Neck curls', 'Flat leg raises'],
  [WORKOUT_TYPES.LEGS]: ['Squats', 'Bulgarian split squats', 'Neck curls', 'Flat leg raises'],
  [WORKOUT_TYPES.REST]: ['Optional rest', 'Full body stretch', 'Meditation']
};

const STROOP_COLORS = [
  { name: 'RED', value: '#EF4444' },
  { name: 'GREEN', value: '#10B981' },
  { name: 'BLUE', value: '#3B82F6' },
  { name: 'YELLOW', value: '#F59E0B' },
  { name: 'PURPLE', value: '#8B5CF6' }
];

const RELAXING_MUSIC_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Placeholder for flute-like music, in production use a specific asset.

// --- Components ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'Body' | 'Mind'>('Body');
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeMindGame, setActiveMindGame] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=meditation-flute-11100.mp3");
    audioRef.current.loop = true;
  }, []);

  useEffect(() => {
    let interval: any;
    if (workoutStarted && isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      audioRef.current?.play().catch(() => {});
    } else {
      clearInterval(interval);
      audioRef.current?.pause();
    }

    if (timeLeft === 0 && workoutStarted) {
      setWorkoutStarted(false);
      setIsTimerActive(false);
      setShowSuccess(true);
    }

    return () => clearInterval(interval);
  }, [workoutStarted, isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setIsTimerActive(true);
    setCompletedExercises([]);
  };

  const toggleExercise = (ex: string) => {
    setCompletedExercises(prev => 
      prev.includes(ex) ? prev.filter(e => e !== ex) : [...prev, ex]
    );
  };

  const resetWorkout = () => {
    setWorkoutStarted(false);
    setIsTimerActive(false);
    setTimeLeft(1800);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Background Zen Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 border-4 border-amber-500 rounded-full animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 border-2 border-slate-400 rounded-full" />
      </div>

      {/* Main UI */}
      {!workoutStarted && !showSuccess && (
        <div className="relative z-10 p-6 max-w-md mx-auto">
          {/* Header */}
          <header className="mb-8 pt-4">
            <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-2">4:00 AM – 6:00 AM Focus</p>
            <h1 className="text-3xl font-bold mb-4">Rise & Conquer</h1>
            <div className="bg-slate-800/50 backdrop-blur p-4 rounded-2xl border border-slate-700">
              <p className="italic text-slate-300 text-sm">"The only way to master your mind is to first conquer your body."</p>
            </div>
          </header>

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedDay === day 
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-8 border border-slate-700 shadow-xl">
            <button
              onClick={() => setActiveTab('Body')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                activeTab === 'Body' ? 'bg-slate-700 text-amber-400 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Dumbbell size={20} />
              <span className="font-bold">Body</span>
            </button>
            <button
              onClick={() => setActiveTab('Mind')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                activeTab === 'Mind' ? 'bg-slate-700 text-amber-400 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Brain size={20} />
              <span className="font-bold">Mind</span>
            </button>
          </div>

          {/* Section Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'Body' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{PPL_SCHEDULE[selectedDay]} Day</h2>
                    <p className="text-slate-400 text-sm">30 Minute High Intensity Focus</p>
                  </div>
                  <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl border border-amber-500/20">
                    <Clock size={24} />
                  </div>
                </div>

                <div className="space-y-3">
                  {EXERCISES[PPL_SCHEDULE[selectedDay]].map((ex, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-amber-500 font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="font-medium">{ex}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartWorkout}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Play fill="currentColor" size={24} />
                  START WORKOUT
                </button>
              </div>
            ) : (
              <MindControlSection setActiveMindGame={setActiveMindGame} />
            )}
          </div>
        </div>
      )}

      {/* Full Screen Workout Timer Overlay */}
      {workoutStarted && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <p className="text-amber-500 font-bold tracking-widest text-sm uppercase">{PPL_SCHEDULE[selectedDay]} SESSION</p>
              <h2 className="text-xl font-bold">Body Control Active</h2>
            </div>
            <button 
              onClick={() => { if(confirm('Cancel session?')) resetWorkout(); }}
              className="p-3 rounded-full bg-slate-800 text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center mb-12">
            <div className={`relative flex items-center justify-center mb-8`}>
               {/* Pulse effect */}
               {isTimerActive && (
                 <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping" />
               )}
               <div className="text-8xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-2xl">
                 {formatTime(timeLeft)}
               </div>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-amber-500 text-slate-900 shadow-2xl shadow-amber-500/20 active:scale-95 transition-transform"
              >
                {isTimerActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
              </button>
              <button 
                onClick={() => setTimeLeft(1800)}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 active:scale-95 transition-transform"
              >
                <RotateCcw size={32} />
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-slate-400">
               <Music size={16} className={isTimerActive ? "animate-bounce" : ""} />
               <span className="text-xs font-medium tracking-widest uppercase">Ancient Flute Mastery playing...</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-6 border border-slate-700/50">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-500" />
              Progress Checklist
            </h3>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600">
              {EXERCISES[PPL_SCHEDULE[selectedDay]].map((ex, i) => (
                <div 
                  key={i} 
                  onClick={() => toggleExercise(ex)}
                  className={`flex items-center gap-4 transition-all cursor-pointer group`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    completedExercises.includes(ex) ? 'bg-amber-500 border-amber-500' : 'border-slate-600 group-hover:border-slate-400'
                  }`}>
                    {completedExercises.includes(ex) && <CheckCircle2 size={14} className="text-slate-900" />}
                  </div>
                  <span className={`text-lg font-medium transition-all ${
                    completedExercises.includes(ex) ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}>
                    {ex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="bg-slate-800 p-8 rounded-[40px] border border-slate-700 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-amber-500" />
            </div>
            <h2 className="text-3xl font-black mb-2">Victory!</h2>
            <p className="text-slate-400 mb-8">You've successfully completed your morning discipline.</p>
            <button
              onClick={resetWorkout}
              className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl"
            >
              CONTINUE JOURNEY
            </button>
          </div>
        </div>
      )}

      {/* Mind Game Overlay */}
      {activeMindGame === 'Stroop' && (
        <StroopGame onClose={() => setActiveMindGame(null)} />
      )}
      {activeMindGame && activeMindGame !== 'Stroop' && (
        <GenericMindTool name={activeMindGame} onClose={() => setActiveMindGame(null)} />
      )}
    </div>
  );
};

// --- Sub-Components ---

const MindControlSection = ({ setActiveMindGame }: { setActiveMindGame: (game: string) => void }) => {
  const tools = [
    { name: 'Stroop Effect', icon: <Eye size={24} />, desc: 'Identify color, ignore word' },
    { name: 'Multicolour Text', icon: <Sun size={24} />, desc: 'Cognitive load reading' },
    { name: 'Hand Focus', icon: <Hand size={24} />, desc: 'Isometric hand connection' },
    { name: 'Visual Focus', icon: <Triangle size={24} />, desc: 'Concentration target training' },
    { name: 'Left-Hand Practice', icon: <PenTool size={24} />, desc: 'Non-dominant writing' },
    { name: 'Inverted Reading', icon: <RotateCcw size={24} />, desc: 'Neuroplasticity reading' },
    { name: 'Dhyan Meditation', icon: <Moon size={24} />, desc: 'Pure stillness timer' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 pb-20">
      <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 mb-2">
        <h3 className="text-amber-500 font-bold mb-1">MIND MASTERY</h3>
        <p className="text-slate-400 text-sm">Enhance neuroplasticity and cognitive control daily.</p>
      </div>

      {tools.map((tool, i) => (
        <button
          key={i}
          onClick={() => setActiveMindGame(tool.name === 'Stroop Effect' ? 'Stroop' : tool.name)}
          className="flex items-center gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-700/50 transition-all text-left group"
        >
          <div className="p-3 bg-slate-700 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
            {tool.icon}
          </div>
          <div>
            <h4 className="font-bold text-slate-100">{tool.name}</h4>
            <p className="text-slate-500 text-xs">{tool.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

const StroopGame = ({ onClose }: { onClose: () => void }) => {
  const [current, setCurrent] = useState({ word: '', color: '' });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');

  const nextChallenge = () => {
    const wordIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    let colorIndex;
    do {
      colorIndex = Math.floor(Math.random() * STROOP_COLORS.length);
    } while (colorIndex === wordIndex); // Ensure color is different from word most of the time for difficulty

    setCurrent({
      word: STROOP_COLORS[wordIndex].name,
      color: STROOP_COLORS[colorIndex].value
    });
  };

  const handleChoice = (colorValue: string) => {
    if (colorValue === current.color) {
      setScore(s => s + 1);
      nextChallenge();
    } else {
      setScore(s => Math.max(0, s - 1));
      nextChallenge();
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameState('end');
    }
  }, [gameState, timeLeft]);

  const start = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    nextChallenge();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8 backdrop-blur-3xl">
      <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-800 rounded-full text-slate-400">
        <X size={24} />
      </button>

      {gameState === 'start' && (
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye size={36} className="text-amber-500" />
          </div>
          <h2 className="text-3xl font-black mb-4">Stroop Effect</h2>
          <p className="text-slate-400 mb-8">Tap the button matching the <span className="text-amber-500 font-bold underline">COLOR</span> of the word, ignore what the text says.</p>
          <button onClick={start} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl">START CHALLENGE</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex justify-between w-full mb-12">
            <div className="text-slate-400 font-bold">SCORE: <span className="text-white text-xl">{score}</span></div>
            <div className="text-slate-400 font-bold">TIME: <span className="text-white text-xl">{timeLeft}s</span></div>
          </div>
          
          <div className="h-48 flex items-center justify-center mb-12">
            <h1 className="text-6xl font-black tracking-tighter transition-all duration-75" style={{ color: current.color }}>
              {current.word}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {STROOP_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => handleChoice(c.value)}
                className="py-6 rounded-2xl border-2 border-slate-700 bg-slate-800/50 active:scale-95 transition-all text-sm font-bold tracking-widest"
                style={{ borderColor: 'transparent', backgroundColor: c.value + '20', color: c.value }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'end' && (
        <div className="text-center">
          <h2 className="text-5xl font-black text-amber-500 mb-4">{score}</h2>
          <p className="text-slate-400 mb-8 text-xl font-medium">Cognitive Focus Score</p>
          <div className="flex flex-col gap-4">
            <button onClick={start} className="bg-amber-500 text-slate-900 font-black py-4 px-12 rounded-2xl">TRY AGAIN</button>
            <button onClick={onClose} className="text-slate-400 font-bold">BACK TO LIST</button>
          </div>
        </div>
      )}
    </div>
  );
};

const GenericMindTool = ({ name, onClose }: { name: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8 backdrop-blur-3xl">
      <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-800 rounded-full text-slate-400">
        <X size={24} />
      </button>
      
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain size={36} className="text-amber-500" />
        </div>
        <h2 className="text-3xl font-black mb-4">{name}</h2>
        <p className="text-slate-400 mb-12">
          {name === 'Dhyan Meditation' ? 'Find a comfortable seated position. Focus on the point between your eyebrows. Let thoughts pass like clouds.' : 
           name === 'Inverted Reading' ? 'The brain is being challenged to interpret familiar symbols in unfamiliar orientations. Force your perspective to shift.' : 
           'This practice enhances your mind-body connection. Perform slowly and with absolute intentionality.'}
        </p>
        
        <div className="p-8 bg-slate-800 rounded-[40px] border border-slate-700 w-full mb-8">
           {name === 'Dhyan Meditation' ? (
             <div className="text-6xl font-black text-white font-mono">10:00</div>
           ) : (
             <div className="animate-pulse flex flex-col gap-4">
                <div className="h-4 bg-slate-700 rounded-full w-full"></div>
                <div className="h-4 bg-slate-700 rounded-full w-3/4 mx-auto"></div>
                <div className="h-4 bg-slate-700 rounded-full w-1/2 mx-auto"></div>
             </div>
           )}
        </div>

        <button onClick={onClose} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl">COMPLETE PRACTICE</button>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
