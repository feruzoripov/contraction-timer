/**
 * Type definitions for the MyDataHelps JS SDK (loaded via CDN).
 * Reference: https://developer.mydatahelps.org/sdk/device_data.html
 */

export interface MdhDeviceDataPoint {
  identifier?: string;
  type: string;
  value: string;
  units?: string;
  properties?: Record<string, string | number>;
  source?: {
    identifier: string;
    properties?: Record<string, string>;
  };
  startDate?: Date | string;
  observationDate?: Date | string;
}

export interface MdhDeviceDataPointResult {
  id: string;
  namespace: string;
  deviceDataContextID: string | null;
  insertedDate: string;
  modifiedDate: string;
  identifier: string;
  participantID: string;
  participantIdentifier: string;
  type: string;
  value: string;
  units: string;
  properties: Record<string, string>;
  source: {
    identifier: string;
    properties: Record<string, string>;
  };
  startDate: string;
  observationDate: string;
}

export interface MdhDeviceDataPointsPage {
  deviceDataPoints: MdhDeviceDataPointResult[];
  nextPageID: string | null;
}

export interface MdhDeviceDataQueryParameters {
  namespace: string;
  type?: string;
  observedAfter?: string;
  observedBefore?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
  limit?: number;
  pageID?: string;
}

export interface MdhParticipantInfo {
  participantID: string;
  participantIdentifier: string;
  customFields: Record<string, string>;
}

export interface MyDataHelpsSDK {
  persistDeviceData(dataPoints: MdhDeviceDataPoint[]): Promise<void>;
  queryDeviceData(queryParameters: MdhDeviceDataQueryParameters): Promise<MdhDeviceDataPointsPage>;
  getDeviceDataPoint(dataPointId: string): Promise<MdhDeviceDataPointResult>;
  deleteDeviceDataPoint(dataPointId: string): Promise<void>;
  getParticipantInfo(): Promise<MdhParticipantInfo>;
  persistParticipantInfo(
    participantInfo: Record<string, unknown>,
    customFields: Record<string, string>
  ): Promise<void>;
}
