import { MdhDeviceDataPoint, MdhDeviceDataPointsPage } from '../models/mydatahelps.model';
import { Contraction } from '../models/contraction.model';

/**
 * Checks whether the MyDataHelps SDK is available in the current environment.
 */
export const isMdhAvailable = (): boolean => typeof window.MyDataHelps !== 'undefined' && window.MyDataHelps !== null;

/**
 * Generates a unique identifier for a device data point.
 */
const generateIdentifier = (prefix: string): string => `${prefix}-${Date.now()}-${Math.ceil(Math.random() * 10e10)}`;

/**
 * Persists a completed contraction to MyDataHelps as a device data point.
 *
 * Data model:
 * - type: "Contraction"
 * - value: duration in milliseconds (as string)
 * - units: "ms"
 * - startDate: when the contraction began
 * - observationDate: when the contraction ended
 * - properties: includes interval to previous contraction if available
 */
export const persistContraction = async(
  contraction: Contraction,
  interval?: number
): Promise<void> => {
  if (!isMdhAvailable()) {
    console.warn('[MDH] MyDataHelps SDK not available. Skipping data persistence.');
    return;
  }

  if (!contraction.duration) {
    return;
  }

  const startDate = new Date(contraction.start);
  const observationDate = new Date(contraction.start + contraction.duration);

  const properties: Record<string, string> = {
    durationMs: contraction.duration.toString(),
  };

  if (interval) {
    properties.intervalMs = interval.toString();
  }

  if (contraction.lastInGroup) {
    properties.lastInGroup = 'true';
  }

  const dataPoint: MdhDeviceDataPoint = {
    identifier: generateIdentifier('contraction'),
    type: 'Contraction',
    value: contraction.duration.toString(),
    units: 'ms',
    properties,
    startDate,
    observationDate,
  };

  try {
    await window.MyDataHelps.persistDeviceData([dataPoint]);
    console.log('[MDH] Contraction persisted successfully:', dataPoint.identifier);
  } catch (error) {
    console.error('[MDH] Failed to persist contraction:', error);
  }
};

/**
 * Persists a "break" event to MyDataHelps, indicating the user paused tracking.
 */
export const persistBreak = async(timestamp: number): Promise<void> => {
  if (!isMdhAvailable()) {
    return;
  }

  const dataPoint: MdhDeviceDataPoint = {
    identifier: generateIdentifier('break'),
    type: 'ContractionBreak',
    value: '1',
    observationDate: new Date(timestamp),
  };

  try {
    await window.MyDataHelps.persistDeviceData([dataPoint]);
    console.log('[MDH] Break event persisted successfully.');
  } catch (error) {
    console.error('[MDH] Failed to persist break event:', error);
  }
};

/**
 * Queries previously stored contraction data from MyDataHelps.
 */
export const queryContractions = async(
  observedAfter?: string,
  observedBefore?: string
): Promise<MdhDeviceDataPointsPage | null> => {
  if (!isMdhAvailable()) {
    return null;
  }

  try {
    const result = await window.MyDataHelps.queryDeviceData({
      namespace: 'Project',
      type: 'Contraction',
      observedAfter,
      observedBefore,
      limit: 100,
    });
    return result;
  } catch (error) {
    console.error('[MDH] Failed to query contractions:', error);
    return null;
  }
};
