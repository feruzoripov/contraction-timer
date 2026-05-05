import { MyDataHelpsSDK } from '../models/mydatahelps.model';

declare global {
  interface Window {
    MyDataHelps: MyDataHelpsSDK;
  }
}
