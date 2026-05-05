import { persistBreak, persistContraction } from '../../services/mydatahelps.service';
import { AppState } from '../root.reducer';
import { Middleware } from '@reduxjs/toolkit';
import { timerActions } from './timer.slice';

/**
 * Redux middleware that persists contraction data to MyDataHelps
 * whenever a contraction is completed or a break is taken.
 */
export const mdhPersistMiddleware: Middleware<{}, AppState> = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  // When toggleContraction completes a contraction (sets duration on the last one)
  if (action.type === timerActions.toggleContraction.type) {
    const prevContractions = prevState.timer.contractions;
    const nextContractions = nextState.timer.contractions;

    // A contraction was completed if the last contraction in prev state had no duration,
    // and now it does (meaning we just ended it)
    if (prevContractions.length > 0) {
      const prevLast = prevContractions[prevContractions.length - 1];

      // Find the contraction that just got its duration set
      if (prevLast && !prevLast.duration) {
        const completedContraction = nextContractions.find(
          (c) => c.start === prevLast.start && c.duration
        );

        if (completedContraction) {
          // Calculate interval: time from previous contraction's start to this one's start
          const completedIndex = nextContractions.findIndex((c) => c.start === completedContraction.start);
          const previousContraction = completedIndex > 0 ? nextContractions[completedIndex - 1] : undefined;
          const interval = previousContraction && !previousContraction.lastInGroup
            ? completedContraction.start - previousContraction.start
            : undefined;

          persistContraction(completedContraction, interval);
        }
      }
    }
  }

  // When stop is called, it may complete the current contraction and mark it as lastInGroup
  if (action.type === timerActions.stop.type) {
    const prevContractions = prevState.timer.contractions;
    const nextContractions = nextState.timer.contractions;

    if (prevState.timer.running && !nextState.timer.running && nextContractions.length > 0) {
      const lastContraction = nextContractions[nextContractions.length - 1];

      // If the stop action completed a contraction (gave it a duration)
      if (lastContraction.duration) {
        const prevLast = prevContractions[prevContractions.length - 1];

        // Only persist if the duration was just set (wasn't there before)
        if (prevLast && !prevLast.duration) {
          const completedIndex = nextContractions.length - 1;
          const previousContraction = completedIndex > 0 ? nextContractions[completedIndex - 1] : undefined;
          const interval = previousContraction && !previousContraction.lastInGroup
            ? lastContraction.start - previousContraction.start
            : undefined;

          persistContraction(lastContraction, interval);
        }
      }

      // Persist the break event
      persistBreak(action.payload as number);
    }
  }

  return result;
};
