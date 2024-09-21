export interface Messagetemplate {
  from: string;
  to: string;
  fromphonenumber: string;
  tophonenumber: string;
  message: string;
}

export interface Allmessage {
  fromsocketid: string;
  tosocketid: string;
  fromphonenumber: string;
  tophonenumber: string;
  message?: string;
  isread: boolean;
  timestamp: Date;
}
export interface Particularmessage {
  fromphonenumber: string;
  tophonenumber: string;
}
