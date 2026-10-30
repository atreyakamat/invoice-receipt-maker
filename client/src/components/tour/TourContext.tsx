import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../contexts/AuthContext';
import { TOUR_STEPS } from './steps';

interface TourContextType {
  start: () => void;
  active: boolean;
}

const TourContext = createContext<TourContextType>({ start: () => {}, active: false });

const PAD = 8;
const CARD_W = 340;
const storageKey = (userId: string) => `im.tour.done.${userId}`;

type Rect = { x: number; y: number; w: number; h: number };

const measure = (target?: string): Rect | null => {
  if (!target) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0 || r.right < 0 || r.left > window.innerWidth) return null;
  return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [index, setIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(180);

  const step = index === null ? null : TOUR_STEPS[index];

  const finish = useCallback(() => {
    if (user) {
      try {
        localStorage.setItem(storageKey(user.id), '1');
      } catch {
        /* storage unavailable */
      }
    }
    setIndex(null);
    setRect(null);
  }, [user]);

  const start = useCallback(() => setIndex(0), []);

  // First visit: start automatically.
  useEffect(() => {
    if (!user) return;
    let done = false;
    try {
      done = Boolean(localStorage.getItem(storageKey(user.id)));
    } catch {
      done = true;
    }
    if (!done) {
      const t = setTimeout(() => setIndex(i => i ?? 0), 700);
      return () => clearTimeout(t);
    }
  }, [user]);

  // Move to the step's page, then follow the target element while it exists.
  useEffect(() => {
    if (!step) return;
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
      return;
    }
    let frame = 0;
    let scrolled = false;
    const startedAt = performance.now();
    const tick = () => {
      if (step.target && !scrolled) {
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (el) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          scrolled = true;
        }
      }
      const next = measure(step.target);
      setRect(prev =>
        prev && next && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) < 0.5 && Math.abs(prev.w - next.w) < 0.5 && Math.abs(prev.h - next.h) < 0.5
          ? prev
          : next,
      );
      // Keep tracking (layout shifts, data loading); stop polling eventually for target-less steps.
      if (step.target || performance.now() - startedAt < 300) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step, location.pathname, navigate]);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [index, viewport]);

  const go = useCallback(
    (delta: number) => {
      setIndex(i => {
        if (i === null) return i;
        const next = i + delta;
        if (next < 0) return 0;
        if (next >= TOUR_STEPS.length) {
          queueMicrotask(finish);
          return i;
        }
        return next;
      });
    },
    [finish],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go, finish]);

  // Card placement: below the target, else above, else beside; clamped to the viewport.
  const cardW = Math.min(CARD_W, viewport.w - 32);
  let cardX = (viewport.w - cardW) / 2;
  let cardY = (viewport.h - cardH) / 2;
  if (rect) {
    const gap = 14;
    cardX = Math.min(Math.max(16, rect.x + rect.w / 2 - cardW / 2), viewport.w - cardW - 16);
    if (rect.y + rect.h + gap + cardH < viewport.h - 16) cardY = rect.y + rect.h + gap;
    else if (rect.y - gap - cardH > 16) cardY = rect.y - gap - cardH;
    else if (rect.x + rect.w + gap + cardW < viewport.w - 16) {
      cardX = rect.x + rect.w + gap;
      cardY = Math.min(Math.max(16, rect.y), viewport.h - cardH - 16);
    } else cardY = viewport.h - cardH - 16;
  }

  const spring = { type: 'spring' as const, stiffness: 260, damping: 30 };
  const hole = rect ?? { x: viewport.w / 2, y: viewport.h / 2, w: 0, h: 0 };
  const isLast = index === TOUR_STEPS.length - 1;

  return (
    <TourContext.Provider value={{ start, active: index !== null }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {step && (
            <motion.div
              key="tour"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ position: 'fixed', inset: 0, zIndex: 1500 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-title"
            >
              <svg width={viewport.w} height={viewport.h} style={{ position: 'absolute', inset: 0 }} onClick={finish}>
                <defs>
                  <mask id="tour-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <motion.rect
                      initial={false}
                      animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
                      transition={spring}
                      rx={12}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(8, 12, 18, 0.62)" mask="url(#tour-mask)" />
                {rect && (
                  <motion.rect
                    initial={false}
                    animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
                    transition={spring}
                    rx={12}
                    fill="none"
                    strokeWidth={2}
                    style={{ pointerEvents: 'none', stroke: theme.vars?.palette.primary.light }}
                  />
                )}
              </svg>

              <motion.div
                initial={false}
                animate={{ x: cardX, y: cardY }}
                transition={spring}
                style={{ position: 'absolute', top: 0, left: 0, width: cardW }}
              >
                <Paper ref={cardRef} elevation={8} sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="overline" color="primary">
                      {index! + 1} / {TOUR_STEPS.length}
                    </Typography>
                    <IconButton size="small" onClick={finish} aria-label="Close tour" sx={{ mr: -1 }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                      <Typography id="tour-title" variant="h6" sx={{ mb: 0.5 }}>{step.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{step.body}</Typography>
                    </motion.div>
                  </AnimatePresence>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2.5, gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
                      {TOUR_STEPS.map((_, i) => (
                        <Box
                          key={i}
                          component={motion.div}
                          animate={{ width: i === index ? 18 : 6 }}
                          sx={{ height: 6, borderRadius: 3, bgcolor: i <= index! ? 'primary.main' : 'divider' }}
                        />
                      ))}
                    </Box>
                    {index! > 0 && (
                      <Button size="small" color="inherit" onClick={() => go(-1)}>Back</Button>
                    )}
                    <Button size="small" variant="contained" onClick={() => go(1)} autoFocus>
                      {isLast ? 'Done' : index === 0 ? 'Start' : 'Next'}
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
