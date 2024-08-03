import { BaseListResp } from '../../model/baseModel';

/**
 *  author: Ryan Su
 *  @description: dictionary info response
 */
export interface DictionaryInfo {
  ID: number; // 字典 ID
  title: string; // 标题
  name: string; // 名称
  status: number; // 状态
  description: string; // 描述
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

/**
 *  author: Ryan Su
 *  @description: dictionary list response
 */

export type DictionaryListResp = BaseListResp<DictionaryInfo>;

/**
 *  author: Ryan Su
 *  @description: dictionary detail info response
 */

export interface DictionaryDetail {
  ID: number; // 字典项 ID
  title: string; // 标题
  key: string; // 键
  value: string; // 值
  status: number; // 状态
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
  parentID: number; // 父级 ID
}

/**
 *  author: Ryan Su
 *  @description: dictionary detail list response
 */

export type DictionaryDetailListResp = BaseListResp<DictionaryDetail>;
