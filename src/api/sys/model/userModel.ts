import { BaseListResp } from '/@/api/model/baseModel';

/**
 * @description: Login interface parameters
 */
export interface LoginReq {
  username: string;
  password: string;
  captcha: string;
  captchaId: string;
}

/**
 * @description: Register interface parameters
 */
export interface RegisterReq {
  username: string;
  password: string;
  email: string;
  captcha: string;
  captchaId: string;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

/**
 * @description: Login interface return value
 */
export interface LoginResp {
  code: number;
  token: string;
  expire: string;
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  roles: RoleInfo[];
  ID: number;
  // 用户id
  userId: string | number;
  // 用户名
  username: string;
  // 昵称
  nickname: string;
  // 头像
  avatar: string;
  // 介绍
  desc?: string;
}

export interface CaptchaResp {
  captchaID: string;
  imgPath: string;
}

export interface UserListReq {
  page: number;
  pageSize: number;
  username: string;
  nickname: string;
  email: string;
  mobile: string;
}

export interface UserInfo {
  ID: number; // 用户ID
  avatar: string; // 用户头像
  roleID: number; // 角色ID
  mobile: string; // 手机号码
  email: string; // 邮箱地址
  status: number; // 用户状态
  username: string; // 用户名
  nickname: string; // 昵称
  roleName: string; // 角色名称
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  roleValue: string; // 角色值
  sideMode: string; // 侧边栏模式
}

export type UserListResp = BaseListResp<UserInfo>;

export interface UserProfile {
  avatar: string;
  nickname: string;
  email: string;
  mobile: string;
}

export interface ChangePasswordReq {
  userID: number;
  oldPassword: string;
  newPassword: string;
}

export interface CreateOrUpdateUserReq {
  ID: number; // 用户ID
  avatar: string; // 用户头像
  roleID: number; // 角色ID
  mobile: string; // 手机号码
  email: string; // 邮箱地址
  status: number; // 用户状态
  username: string; // 用户名
  nickname: string; // 昵称
  password: string; // 密码
}
