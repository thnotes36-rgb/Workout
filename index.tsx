
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
  Hand,
  Triangle,
  PenTool,
  Eye,
  X,
  Info,
  Volume2,
  Square,
  ArrowLeft
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
  [WORKOUT_TYPES.PULL]: ['Pull-ups', 'One-hand shrugs (backpack)', 'Hammer curls (backpack)', 'Neck curls', 'Flat leg raises'],
  [WORKOUT_TYPES.LEGS]: ['Squats', 'Bulgarian split squats', 'Nordic curls', 'Neck curls', 'Flat leg raises'],
  [WORKOUT_TYPES.REST]: ['Optional rest', 'Full body stretch', 'Meditation']
};

const EXERCISE_GUIDES: Record<string, { steps: string[] }> = {
  'Push-ups': { steps: ['Plank position, hands shoulder-width.', 'Lower chest to floor, elbows at 45°.', 'Push back up, locking core.'] },
  'Bench dips': { steps: ['Hands on edge, feet out.', 'Lower hips toward floor by bending elbows.', 'Push back up to full extension.'] },
  'Lateral raises (backpack)': { steps: ['Hold backpack by top handle.', 'Raise arms to side until shoulder level.', 'Lower slowly with control.'] },
  'Neck curls': { steps: ['Lie flat on back, neck slightly off.', 'Curl chin toward chest.', 'Return to start without resting head.'] },
  'Flat leg raises': { steps: ['Lie on back, hands under glutes.', 'Lift legs to 90° while keeping straight.', 'Lower slowly, don\'t touch floor.'] },
  'Pull-ups': { steps: ['Overhand grip, slightly wider than shoulders.', 'Pull chest toward bar, squeeze lats.', 'Lower with full control.'] },
  'One-hand shrugs (backpack)': { steps: ['Hold backpack by top handle at your side.', 'Raise your shoulder toward your ear as high as possible.', 'Squeeze for a second and lower with control.'] },
  'Hammer curls (backpack)': { steps: ['Hold backpack straps vertically.', 'Curl toward shoulders without swinging.', 'Full extension at the bottom.'] },
  'Squats': { steps: ['Feet shoulder-width, chest up.', 'Lower hips as if sitting back.', 'Drive through heels to stand.'] },
  'Bulgarian split squats': { steps: ['One foot back on chair/bench.', 'Lower front knee to 90° angle.', 'Keep torso upright, push through front foot.'] },
  'Nordic curls': { steps: ['Kneel on a soft surface with ankles secured by a heavy object or partner.', 'Slowly lower your torso toward the ground, using your hamstrings to resist.', 'Use your hands to catch yourself and push back to start.'] },
  'Optional rest': { steps: ['Breathe deeply.', 'Hydrate and recover.', 'Prepare for next session.'] },
  'Full body stretch': { steps: ['Reach for toes.', 'Overhead tricep stretch.', 'Child\'s pose for 60 seconds.'] },
  'Meditation': { steps: ['Cross legs, back straight.', 'Close eyes, focus on breath.', 'Observe thoughts without judgment.'] }
};

// Stable and highly compatible Indian Flute track from Pixabay CDN
const KRISHNA_FLUTE_URL = 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e02f9.mp3';

const STROOP_COLORS = [
  { name: 'RED', value: '#EF4444' },
  { name: 'GREEN', value: '#10B981' },
  { name: 'BLUE', value: '#3B82F6' },
  { name: 'YELLOW', value: '#F59E0B' },
  { name: 'PURPLE', value: '#8B5CF6' }
];

const getTodayString = () => {
  const dayIndex = new Date().getDay();
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS[adjustedIndex];
};

const App = () => {
  const [activeTab, setActiveTab] = useState<'Body' | 'Mind'>('Body');
  const [selectedDay, setSelectedDay] = useState<string>(getTodayString());
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeMindGame, setActiveMindGame] = useState<string | null>(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const today = getTodayString();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.src = KRISHNA_FLUTE_URL;
    audio.loop = true;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous'; // Help with CORS issues
    
    // Explicitly load the audio
    audio.load();

    audio.onerror = (e) => {
      console.error("Audio Load Error:", e);
      // Fallback or retry if needed
    };

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Sync state with physical playback
  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay was prevented:", error);
          setIsMusicPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  // Combined Back Button Handler
  const handleUniversalBack = () => {
    if (workoutStarted) {
      resetWorkout();
    } else if (activeMindGame) {
      setActiveMindGame(null);
    }
  };

  // Popstate for hardware back button
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      handleUniversalBack();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [workoutStarted, activeMindGame]);

  // Manage history stack
  useEffect(() => {
    if (workoutStarted || activeMindGame) {
      window.history.pushState({ inView: true }, "");
    }
  }, [workoutStarted, activeMindGame]);

  const resetWorkout = () => {
    setWorkoutStarted(false);
    setIsTimerActive(false);
    setIsMusicPlaying(false);
    setTimeLeft(1800);
    setShowSuccess(false);
    setShowSteps(false);
    setShowMusic(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStartWorkout = () => {
    // Immediate playback start to capture user intent and unlock audio context
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(e => {
          console.error("Manual play start failed:", e);
          setIsMusicPlaying(false);
        });
    }
    setWorkoutStarted(true);
    setIsTimerActive(true);
    setCompletedExercises([]);
    setActiveExerciseIdx(0);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(err => console.error("Toggle play failed:", err));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: any;
    if (workoutStarted && isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    if (timeLeft === 0 && workoutStarted) {
      setWorkoutStarted(false);
      setIsTimerActive(false);
      setIsMusicPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      setShowSuccess(true);
    }

    return () => clearInterval(interval);
  }, [workoutStarted, isTimerActive, timeLeft]);

  const currentExercises = EXERCISES[PPL_SCHEDULE[selectedDay]];
  const activeExerciseName = currentExercises[activeExerciseIdx] || currentExercises[0];
  const activeGuide = EXERCISE_GUIDES[activeExerciseName] || EXERCISE_GUIDES['Optional rest'];

  const toggleExercise = (ex: string, index: number) => {
    setCompletedExercises(prev => 
      prev.includes(ex) ? prev.filter(e => e !== ex) : [...prev, ex]
    );
    if (activeExerciseIdx !== index) {
      setActiveExerciseIdx(index);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 border-4 border-amber-500 rounded-full animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 border-2 border-slate-400 rounded-full" />
      </div>

      {!workoutStarted && !showSuccess && (
        <div className="relative z-10 p-6 max-w-md mx-auto">
          <header className="mb-8 pt-4 text-center">
            <p className="text-amber-400 text-xs font-black tracking-[0.2em] uppercase mb-2">Morning Mastery 4:00 - 6:00</p>
            <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">Rise & Conquer</h1>
            <div className="bg-slate-800/50 backdrop-blur p-4 rounded-2xl border border-slate-700 shadow-inner">
              <p className="italic text-slate-300 text-sm leading-relaxed">"Master the mind, sharpen the iron."</p>
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative px-5 py-3 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                  selectedDay === day 
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/50' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {day.substring(0, 3)}
                {day === today && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                   </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-900/50 p-1.5 rounded-[24px] mb-8 border border-slate-800 shadow-2xl">
            <button
              onClick={() => setActiveTab('Body')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] transition-all duration-300 ${
                activeTab === 'Body' ? 'bg-amber-500 text-slate-900 font-black shadow-xl' : 'text-slate-500 font-bold'
              }`}
            >
              <Dumbbell size={18} strokeWidth={3} />
              <span className="text-xs tracking-widest uppercase">BODY</span>
            </button>
            <button
              onClick={() => setActiveTab('Mind')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] transition-all duration-300 ${
                activeTab === 'Mind' ? 'bg-amber-500 text-slate-900 font-black shadow-xl' : 'text-slate-500 font-bold'
              }`}
            >
              <Brain size={18} strokeWidth={3} />
              <span className="text-xs tracking-widest uppercase">MIND</span>
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'Body' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{PPL_SCHEDULE[selectedDay]} DAY</h2>
                    <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">Step-by-Step Training</p>
                  </div>
                  <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl border border-amber-500/20 shadow-xl">
                    <Clock size={24} />
                  </div>
                </div>

                <div className="space-y-3">
                  {currentExercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors group">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700/50 text-amber-500 font-black text-sm border border-slate-600/50 group-hover:border-amber-500/30 transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block tracking-tight">{ex}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Absolute Form</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartWorkout}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-5 rounded-[24px] shadow-2xl shadow-amber-500/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 text-lg mt-4 border-b-4 border-amber-600 uppercase tracking-widest"
                >
                  <Play fill="currentColor" size={24} />
                  ACTIVATE TRAINING
                </button>
              </div>
            ) : (
              <MindControlSection setActiveMindGame={setActiveMindGame} />
            )}
          </div>
        </div>
      )}

      {workoutStarted && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
            <button 
              onClick={() => {
                resetWorkout();
                // If history was pushed, go back
                if (window.history.length > 1) window.history.back();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-slate-900 active:scale-95 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              BACK
            </button>
            <div className="flex items-center gap-3 text-right">
               <div>
                 <p className="text-amber-500 font-black tracking-[0.2em] text-[10px] uppercase">{PPL_SCHEDULE[selectedDay]} DAY</p>
                 <h2 className="text-lg font-black tracking-tight text-white uppercase">{activeExerciseName}</h2>
               </div>
               <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                 <Dumbbell size={18} className="text-amber-500" />
               </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center px-4 w-full">
            <div className="absolute inset-0 bg-amber-500/5 blur-[120px] rounded-full scale-150 animate-pulse pointer-events-none" />
            <p className="text-amber-500/60 text-xs font-black tracking-[0.6em] uppercase mb-4 z-10 animate-pulse">Session Intensity</p>
            <div className="text-[22vw] font-black font-mono leading-none tracking-tighter text-white tabular-nums drop-shadow-[0_20px_50px_rgba(245,158,11,0.15)] z-10 transition-all duration-500 ease-out">
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-12 mt-16 z-10 items-center">
              <button onClick={() => { setTimeLeft(1800); setIsTimerActive(false); }} className="w-16 h-16 rounded-3xl flex items-center justify-center bg-slate-900/50 text-slate-500 active:scale-90 border border-slate-800 hover:text-white transition-all shadow-xl">
                <RotateCcw size={28} />
              </button>
              <button onClick={() => setIsTimerActive(!isTimerActive)} className={`w-32 h-32 rounded-[48px] flex items-center justify-center shadow-2xl active:scale-95 transition-all transform ${isTimerActive ? 'bg-slate-800 text-amber-500 border border-amber-500/20' : 'bg-amber-500 text-slate-900 shadow-amber-500/40'}`}>
                {isTimerActive ? <Pause size={56} strokeWidth={3} /> : <Play size={56} fill="currentColor" />}
              </button>
              <button onClick={() => setShowMusic(true)} className={`w-16 h-16 rounded-3xl flex items-center justify-center bg-slate-900/50 text-slate-500 active:scale-90 border border-slate-800 hover:text-white transition-all shadow-xl ${isMusicPlaying ? 'text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : ''}`}>
                <Music size={28} />
              </button>
            </div>

            {isMusicPlaying && (
              <div className="mt-12 bg-slate-900/40 backdrop-blur-xl border border-slate-800 px-6 py-3 rounded-full flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 z-10">
                <div className="flex gap-1 items-end h-3">
                  <div className="w-1 bg-amber-500 animate-bounce h-2" />
                  <div className="w-1 bg-amber-500 animate-bounce h-3 delay-75" />
                  <div className="w-1 bg-amber-500 animate-bounce h-1 delay-150" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">DIVINE KRISHNA BANSURI</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-10 left-0 right-0 px-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-4 scroll-smooth">
               <button onClick={() => setShowSteps(true)} className="px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest bg-slate-800 border-2 border-slate-700 text-slate-400 shrink-0 flex items-center gap-3">
                  <Info size={14} /> Guide
               </button>
              {currentExercises.map((ex, i) => (
                <button key={i} onClick={() => toggleExercise(ex, i)} className={`px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 shrink-0 flex items-center gap-3 ${activeExerciseIdx === i ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-xl shadow-amber-500/20' : (completedExercises.includes(ex) ? 'bg-slate-900/80 border-slate-800 text-slate-600' : 'bg-slate-900/40 border-slate-800/50 text-slate-400')}`}>
                  {completedExercises.includes(ex) ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {showMusic && <MusicSheet onClose={() => setShowMusic(false)} isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic} />}
          {showSteps && (
            <div className="absolute inset-0 z-[60] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSteps(false)} />
              <div className="bg-slate-900 rounded-t-[48px] p-8 border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-10 animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-slate-800 mx-auto mb-8 rounded-full" />
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3"><Info className="text-amber-500" size={24} /> Execution Guide</h3>
                <div className="space-y-4">
                  {activeGuide.steps.map((step, idx) => (
                    <div key={idx} className="bg-slate-950 p-5 rounded-3xl flex items-start gap-4 border border-slate-800/50">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 font-black text-sm border border-slate-800 shrink-0">{idx + 1}</div>
                      <p className="text-slate-300 font-bold leading-relaxed text-sm pt-2">{step}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowSteps(false)} className="w-full mt-8 bg-slate-800 py-5 rounded-[24px] font-black text-slate-400 uppercase tracking-widest active:scale-95 transition-all">Return to Focus</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[60] bg-slate-950/98 flex items-center justify-center p-8 backdrop-blur-3xl">
          <div className="bg-slate-900/50 p-12 rounded-[56px] border border-slate-800 text-center shadow-2xl animate-in zoom-in-95 duration-500 max-w-sm relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500 rounded-[32px] flex items-center justify-center shadow-2xl">
              <CheckCircle2 size={48} className="text-slate-900" strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter mt-4 uppercase">Victory</h2>
            <div className="h-1 w-12 bg-amber-500 mx-auto mb-6 rounded-full" />
            <p className="text-slate-400 mb-10 text-xs font-black uppercase tracking-widest leading-loose text-center">Morning Discipline Complete.<br/>Iron Sharpened Iron.</p>
            <button onClick={resetWorkout} className="w-full bg-amber-500 text-slate-900 font-black py-5 rounded-[28px] shadow-2xl shadow-amber-500/30 text-lg uppercase tracking-widest">OWN THE DAY</button>
          </div>
        </div>
      )}

      {activeMindGame === 'Stroop' && <StroopGame onClose={() => { setActiveMindGame(null); window.history.back(); }} />}
      {activeMindGame && activeMindGame !== 'Stroop' && <GenericMindTool name={activeMindGame} onClose={() => { setActiveMindGame(null); window.history.back(); }} />}
    </div>
  );
};

const MusicSheet = ({ onClose, isMusicPlaying, toggleMusic }: any) => {
  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-slate-900 rounded-t-[56px] p-8 border-t border-slate-800 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-10 animate-in slide-in-from-bottom duration-300 flex flex-col">
        <div className="w-16 h-1.5 bg-slate-800 mx-auto mb-8 rounded-full" />
        <div className="bg-slate-950 p-10 rounded-[40px] border border-amber-500/20 mb-8 flex flex-col items-center text-center shadow-2xl">
           <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 relative">
             <Music size={40} className={`transition-transform duration-500 ${isMusicPlaying ? 'text-amber-500 scale-110' : 'text-slate-600'}`} />
             {isMusicPlaying && <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping" />}
           </div>
           <h4 className="text-2xl font-black text-white uppercase tracking-tight">DIVINE KRISHNA BANSURI</h4>
           <p className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase mt-3">Sacred Focus Channel</p>
           <div className="flex items-center gap-8 mt-12">
             <button onClick={() => toggleMusic()} className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${isMusicPlaying ? 'bg-amber-500 text-slate-900 shadow-amber-500/30' : 'bg-slate-700 text-white'}`}>
               {isMusicPlaying ? <Pause size={48} strokeWidth={3} /> : <Play size={48} fill="currentColor" />}
             </button>
             <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Deep Presence</span>
                <Volume2 className="text-amber-500" size={24} />
             </div>
           </div>
        </div>
        <div className="flex flex-col gap-4 mb-4">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] text-center">Premium Mind Relax Stream</p>
           <button onClick={onClose} className="w-full py-6 rounded-[28px] font-black bg-amber-500 text-slate-900 uppercase tracking-widest active:scale-95 transition-all shadow-xl">CLOSE SETTINGS</button>
        </div>
      </div>
    </div>
  );
};

const MindControlSection = ({ setActiveMindGame }: { setActiveMindGame: (game: string) => void }) => {
  const tools = [
    { name: 'Stroop Effect', icon: <Eye size={22} />, desc: 'Cognitive Interference Master' },
    { name: 'Dhyan Meditation', icon: <Moon size={22} />, desc: 'Deep Void Awareness' },
    { name: 'Hand Focus', icon: <Hand size={22} />, desc: 'Isometric Pure Stillness' },
    { name: 'Inverted Reading', icon: <RotateCcw size={22} />, desc: 'Perspective Re-Wiring' },
    { name: 'Visual Focus', icon: <Triangle size={22} />, desc: 'Extreme Concentration' },
    { name: 'Left-Hand Practice', icon: <PenTool size={22} />, desc: 'Neuroplasticity Trigger' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 pb-24">
      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-amber-500/10 mb-4 shadow-inner">
        <div className="flex items-center gap-3 mb-2"><Brain className="text-amber-500" size={18} /><h3 className="text-amber-500 font-black text-xs tracking-[0.3em] uppercase">Mind Architect</h3></div>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide leading-relaxed">Cognitive drills to enforce neuroplasticity and absolute focus.</p>
      </div>
      {tools.map((tool, i) => (
        <button key={i} onClick={() => setActiveMindGame(tool.name === 'Stroop Effect' ? 'Stroop' : tool.name)} className="flex items-center gap-6 bg-slate-900/30 p-5 rounded-[32px] border border-slate-800/50 hover:bg-slate-800/40 hover:border-amber-500/20 transition-all text-left group active:scale-[0.98]">
          <div className="p-4 bg-slate-950 rounded-2xl text-amber-500 border border-slate-800 shadow-xl group-hover:scale-110 transition-all">{tool.icon}</div>
          <div className="flex-1">
            <h4 className="font-black text-slate-100 tracking-tight text-lg uppercase">{tool.name}</h4>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.1em] mt-0.5">{tool.desc}</p>
          </div>
          <ChevronLeft className="text-slate-800 group-hover:text-amber-500 transition-colors rotate-180" size={18} />
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
    } while (colorIndex === wordIndex && Math.random() > 0.3);
    setCurrent({ word: STROOP_COLORS[wordIndex].name, color: STROOP_COLORS[colorIndex].value });
  };

  const handleChoice = (colorValue: string) => {
    if (colorValue === current.color) { setScore(s => s + 1); nextChallenge(); } 
    else { setScore(s => Math.max(0, s - 1)); nextChallenge(); }
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('end');
    }
  }, [gameState, timeLeft]);

  const start = () => { setGameState('playing'); setScore(0); setTimeLeft(30); nextChallenge(); };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 backdrop-blur-3xl overflow-hidden">
      <button onClick={onClose} className="absolute top-10 left-10 flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-full active:scale-95 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
        <ArrowLeft size={18} strokeWidth={3} /> BACK
      </button>

      {gameState === 'start' && (
        <div className="text-center max-w-sm">
          <div className="w-28 h-28 bg-amber-500/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-amber-500/20 shadow-2xl"><Eye size={48} className="text-amber-500" strokeWidth={3} /></div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">Stroop Effect</h2>
          <div className="h-1 w-12 bg-amber-500 mx-auto mb-8 rounded-full" />
          <p className="text-slate-500 mb-12 text-sm leading-relaxed font-bold uppercase tracking-widest">Select the button matching the <span className="text-amber-500 underline font-black">COLOR</span> of the text. Ignore the literal word.</p>
          <button onClick={start} className="w-full bg-amber-500 text-slate-900 font-black py-6 rounded-[32px] shadow-2xl shadow-amber-500/30 text-lg uppercase tracking-widest">Initiate Training</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex justify-between w-full mb-16 bg-slate-900/30 p-8 rounded-[40px] border border-slate-800/50 backdrop-blur-xl">
            <div className="space-y-1"><p className="text-slate-600 text-[10px] font-black tracking-[0.3em] uppercase">Focus Points</p><span className="text-white text-3xl font-mono font-black">{score}</span></div>
            <div className="text-right space-y-1"><p className="text-slate-600 text-[10px] font-black tracking-[0.3em] uppercase">Window Remaining</p><span className="text-amber-500 text-3xl font-mono font-black">{timeLeft}s</span></div>
          </div>
          <div className="h-64 flex items-center justify-center mb-16 animate-in fade-in zoom-in duration-300"><h1 className="text-8xl font-black tracking-tighter drop-shadow-2xl transition-all duration-100 uppercase text-center leading-none" style={{ color: current.color }}>{current.word}</h1></div>
          <div className="grid grid-cols-2 gap-5 w-full">
            {STROOP_COLORS.map((c) => (<button key={c.name} onClick={() => handleChoice(c.value)} className="py-8 rounded-[32px] border-2 border-transparent bg-slate-900 shadow-xl active:scale-95 transition-all text-xs font-black tracking-[0.3em] uppercase" style={{ backgroundColor: c.value + '10', color: c.value, borderColor: c.value + '15' }}>{c.name}</button>))}
          </div>
        </div>
      )}

      {gameState === 'end' && (
        <div className="text-center bg-slate-900/50 p-14 rounded-[56px] border border-slate-800 shadow-2xl backdrop-blur-xl relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-500 rounded-[24px] flex items-center justify-center shadow-2xl"><Brain size={36} className="text-slate-900" strokeWidth={3} /></div>
          <p className="text-slate-500 font-black text-xs tracking-[0.4em] uppercase mb-4 mt-6">Focus Score</p>
          <h2 className="text-8xl font-black text-amber-500 mb-6 tracking-tighter">{score}</h2>
          <div className="flex flex-col gap-4">
            <button onClick={start} className="bg-amber-500 text-slate-900 font-black py-5 px-20 rounded-[28px] shadow-2xl shadow-amber-500/30 text-sm uppercase tracking-widest">Try Again</button>
            <button onClick={onClose} className="text-slate-600 font-black text-[10px] tracking-[0.4em] uppercase py-4">Return to Base</button>
          </div>
        </div>
      )}
    </div>
  );
};

const GenericMindTool = ({ name, onClose }: { name: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 backdrop-blur-3xl overflow-hidden">
      <button onClick={onClose} className="absolute top-10 left-10 flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-full active:scale-95 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
        <ArrowLeft size={18} strokeWidth={3} /> BACK
      </button>
      <div className="text-center max-w-sm">
        <div className="w-28 h-28 bg-slate-900 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-slate-800 shadow-2xl"><Brain size={48} className="text-amber-500" strokeWidth={3} /></div>
        <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{name}</h2>
        <div className="h-1 w-12 bg-amber-500 mx-auto mb-10 rounded-full" />
        <p className="text-slate-500 mb-14 text-sm leading-relaxed font-bold uppercase tracking-widest">
          {name === 'Dhyan Meditation' ? 'Connect with the divine stillness of the Bansuri. Focus on the void. Let reality dissolve into golden light.' : 'Elite cognitive discipline for the morning warrior. Execute with absolute presence.'}
        </p>
        <button onClick={onClose} className="w-full bg-amber-500 text-slate-900 font-black py-6 rounded-[32px] shadow-2xl shadow-amber-500/30 text-lg uppercase tracking-widest">Complete Practice</button>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
