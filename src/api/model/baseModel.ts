export interface BasePageReq {
  page: number;
  pageSize: number;
}

export interface BaseListResp<T> {
  data: T[];
  total: number;
}

export interface BaseDataResp<T> {
  statusCode: number;
  statusMsg: string;
  total: number;
  data: T;
}

export interface BaseResp {
  statusCode?: number;
  statusMsg: string;
}

export interface BaseRespStr<T> {
  statusCode?: number;
  statusMsg: string;
  protoStr: T;
  structStr: T;
}

export interface BaseIdReq {
  ID: number;
}

export interface BaseIdsReq {
  ids: number[];
}
