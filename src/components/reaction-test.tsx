"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Play, RefreshCw, Hand, BarChart, AlertTriangle, ScreenShare, ScreenShareOff, TestTube } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AttemptDetail } from '@/app/page';

type TestState = 'idle' | 'ready' | 'waiting' | 'react' | 'result' | 'too-soon' | 'invalid-time' | 'disabled' | 'summary';

const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 5000;
const TOTAL_ATTEMPTS = 5;
const MIN_VALID_REACTION_MS = 80;
const MAX_VALID_REACTION_MS = 2000;

type TestResultData = { 
  attempts: AttemptDetail[], 
  average: number, 
  faults: number 
};

type ReactionTestProps = {
  onTestComplete: (data: TestResultData) => void;
  onNewTest: () => void;
  disabled?: boolean;
};

export function ReactionTest({ onTestComplete, onNewTest, disabled = false }: ReactionTestProps) {
  const [state, setState] = useState<TestState>(disabled ? 'disabled' : 'idle');
  const [lastReactionTime, setLastReactionTime] = useState<number>(0);
  const [attemptDetails, setAttemptDetails] = useState<AttemptDetail[]>([]);
  const [currentAttemptNumber, setCurrentAttemptNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentDelayRef = useRef(0);
  const userReactedRef = useRef(false);
  const testCompletedRef = useRef(false);
  const { toast } = useToast();

  const cleanupTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupTimers();
  }, [cleanupTimers]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (disabled) {
      cleanupTimers();
      resetTest(true);
    } else if (state === 'disabled') {
      setState('idle');
    }
  }, [disabled, cleanupTimers]);
  
  const resetTest = useCallback((forceDisabled = false) => {
    cleanupTimers();
    setState(forceDisabled ? 'disabled' : 'idle');
    setLastReactionTime(0);
    setAttemptDetails([]);
    setCurrentAttemptNumber(1);
    testCompletedRef.current = false;
    userReactedRef.current = false;
  }, [cleanupTimers]);
  
  const showSummary = useCallback(() => {
    if (testCompletedRef.current) return;
    testCompletedRef.current = true;
    setState('summary');
  }, []);

  useEffect(() => {
    if (state === 'summary') {
      const validAttempts = attemptDetails.filter(a => !a.wasFault);
      const validTimes = validAttempts.map(a => a.time);
      const average = validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;
      const faults = attemptDetails.filter(a => a.wasFault).length;

      onTestComplete({
        attempts: attemptDetails,
        average: isNaN(average) ? 0 : Math.round(average),
        faults: faults,
      });
    }
  }, [state, attemptDetails, onTestComplete]);


  const startAttempt = useCallback(() => {
    userReactedRef.current = false;
    setState('ready');
    timeoutRef.current = setTimeout(() => {
      setState('waiting');
      const randomDelay = Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS;
      currentDelayRef.current = randomDelay;

      timeoutRef.current = setTimeout(() => {
        if (!userReactedRef.current) {
          setState('react');
          startTimeRef.current = performance.now();
        }
      }, randomDelay);
    }, 1000);
  }, []);
  
  const handleUserAction = useCallback(() => {
    if (state === 'disabled' || state === 'summary') return;
    
    if (state === 'idle') {
      resetTest();
      setTimeout(startAttempt, 100);
      return;
    }
    
    if (state === 'ready' || state === 'waiting') {
      userReactedRef.current = true;
      cleanupTimers();
      setAttemptDetails(prev => [...prev, { time: 0, wasFault: true, delayUsed: currentDelayRef.current }]);
      setState('too-soon');
      toast({ title: 'Too soon!', description: 'Wait for the screen to turn green.', variant: 'destructive' });
      
      if (currentAttemptNumber < TOTAL_ATTEMPTS) {
        setTimeout(() => {
          setCurrentAttemptNumber(prev => prev + 1);
          startAttempt();
        }, 1500);
      } else {
        setTimeout(showSummary, 1500);
      }
      return;
    }

    if (state === 'react') {
      const endTime = performance.now();
      const time = endTime - startTimeRef.current;
      setLastReactionTime(time);

      const isFault = time < MIN_VALID_REACTION_MS || time > MAX_VALID_REACTION_MS;
      setAttemptDetails(prev => [...prev, { time, wasFault: isFault, delayUsed: currentDelayRef.current }]);
      
      const nextState = isFault ? 'invalid-time' : 'result';
      setState(nextState);

      if (currentAttemptNumber < TOTAL_ATTEMPTS) {
        setTimeout(() => {
          setCurrentAttemptNumber(prev => prev + 1);
          startAttempt();
        }, 1500);
      } else {
        setTimeout(showSummary, 1500);
      }
    }
  }, [state, startAttempt, toast, resetTest, cleanupTimers, showSummary, currentAttemptNumber]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserAction();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleUserAction]);

  const handleNewTestClick = useCallback(() => {
    onNewTest();
    resetTest();
  }, [onNewTest, resetTest]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast({ variant: 'destructive', title: 'Fullscreen Error', description: `Could not enter fullscreen mode: ${err.message}` });
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getDisplay = () => {
    switch (state) {
      case 'disabled':
        return { bgColor: 'bg-muted/50', textColor: 'text-muted-foreground', icon: <Hand className="w-16 h-16" />, text: 'Test Disabled', subtext: 'Please enter all your user data to begin.' };
      case 'idle':
        return { bgColor: 'bg-muted', textColor: 'text-muted-foreground', icon: <Play className="w-16 h-16" />, text: 'Press Space or Click to Start', subtext: `A test consists of ${TOTAL_ATTEMPTS} attempts.` };
      case 'ready':
        return { bgColor: 'bg-red-500', textColor: 'text-white', icon: <div className="text-3xl font-bold">Ready...</div>, text: '', subtext: '' };
      case 'waiting':
        return { bgColor: 'bg-yellow-400', textColor: 'text-black', icon: <div className="text-3xl font-bold">Set...</div>, text: '', subtext: '' };
      case 'react':
        return { bgColor: 'bg-green-500', textColor: 'text-white', glow: true, icon: <div className="text-3xl font-bold">Go!</div>, text: '', subtext: '' };
      case 'too-soon':
        return { bgColor: 'bg-purple-600', textColor: 'text-white', icon: <AlertTriangle className="w-16 h-16" />, text: 'Too Soon!', subtext: `Attempt ${currentAttemptNumber} of ${TOTAL_ATTEMPTS} failed.` };
      case 'invalid-time':
        const reason = lastReactionTime < MIN_VALID_REACTION_MS ? 'too fast' : 'too slow';
        return { 
          bgColor: 'bg-orange-600', 
          textColor: 'text-white', 
          icon: <AlertTriangle className="w-16 h-16" />, 
          text: 'Invalid Time!', 
          subtext: `Reaction of ${Math.round(lastReactionTime)}ms is ${reason}. Marked as a fault.` 
        };
      case 'result':
        return { 
          bgColor: 'bg-primary', 
          textColor: 'text-primary-foreground', 
          icon: <div className="text-6xl font-bold">{Math.round(lastReactionTime)}<span className="text-2xl">ms</span></div>, 
          text: `Attempt ${currentAttemptNumber} successful!`, 
          subtext: currentAttemptNumber < TOTAL_ATTEMPTS ? 'Preparing next attempt...' : 'Finishing test...'
        };
      case 'summary':
         const validAttempts = attemptDetails.filter(a => !a.wasFault);
         const sumOfValidTimes = validAttempts.reduce((acc, current) => acc + current.time, 0);
         const average = validAttempts.length > 0 ? sumOfValidTimes / validAttempts.length : NaN;
         const faults = attemptDetails.filter(a => a.wasFault).length;
        return {
          bgColor: 'bg-card',
          textColor: 'text-card-foreground',
          icon: <BarChart className="w-16 h-16 text-primary" />,
          text: 'Test Complete!',
          subtext: 'Your results have been saved.',
          summaryData: { average: isNaN(average) ? 0 : Math.round(average), hits: validAttempts.length, faults }
        };
    }
  };

  const display = getDisplay();
  const progressPercentage = ((currentAttemptNumber -1) / TOTAL_ATTEMPTS) * 100;
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn(
          'w-full h-96 rounded-lg flex flex-col items-center justify-center text-center p-6 select-none relative',
          display.bgColor,
          display.textColor,
          (state === 'disabled' || state === 'summary') ? 'cursor-default' : 'cursor-pointer',
        )}
        onClick={handleUserAction}
        role="button"
        tabIndex={0}
        aria-label={display.text || 'Reaction Test Area'}
      >
        <Button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} variant="ghost" size="icon" className="absolute top-2 right-2 text-white/80 hover:bg-white/20 hover:text-white z-20">
          {isFullscreen ? <ScreenShareOff className="w-5 h-5"/> : <ScreenShare className="w-5 h-5"/>}
          <span className="sr-only">Toggle Fullscreen</span>
        </Button>
        {display.glow && <div className="absolute inset-0 bg-green-400/75 animate-ping rounded-lg opacity-75"></div>}
        
        <div className="absolute top-4 left-4 right-4">
          {(state !== 'idle' && state !== 'disabled' && state !== 'summary') && (
            <>
              <p className="text-center mb-2 font-medium">Attempt {currentAttemptNumber} of {TOTAL_ATTEMPTS}</p>
              <Progress value={progressPercentage} className="w-full" />
            </>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          {display.icon}
          {display.text && <p className="text-2xl font-semibold">{display.text}</p>}
          {display.summaryData ? (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center w-full max-w-sm">
              <div><p className="text-3xl font-bold">{display.summaryData.average}ms</p><p className="text-sm text-muted-foreground">Average</p></div>
              <div className="text-green-500"><p className="text-3xl font-bold">{display.summaryData.hits}</p><p className="text-sm text-muted-foreground">Hits</p></div>
              <div className="text-red-500"><p className="text-3xl font-bold">{display.summaryData.faults}</p><p className="text-sm text-muted-foreground">Faults</p></div>
            </div>
          ) : (
            display.subtext && <p className={cn('text-sm', state === 'idle' || state === 'disabled' ? 'text-muted-foreground' : 'text-white/90')}>{display.subtext}</p>
          )}
        </div>
      </div>
      
      {state === 'summary' ? (
        <Button onClick={handleNewTestClick} size="lg">
          <TestTube className="w-4 h-4 mr-2" />
          New Test
        </Button>
      ) : (
        <Button onClick={() => resetTest()} variant="outline" className={cn(state === 'idle' || state === 'disabled' || state === 'summary' ? 'invisible' : 'visible')}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Test
        </Button>
      )}
    </div>
  );
}
