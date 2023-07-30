import { APIClient } from "./api_helper";

import * as url from "./url_helper";
import {
  ADD_NEW_CONFIG,
  CHECK_NAME,
  GET_CONFIG,
  GET_CONFIG_CHART,
  GET_CONFIG_TOOLS,
  GET_CONFIGS_LIST,
  GET_PEER_CHART,
  GET_SERVER_STATUS,
  POST_ADD_NEW_PEER,
  POST_ADMIN_CHANGE_LANG,
  POST_CHANGE_LIST_TYPE,
  POST_CHANGE_PEER_STATE,
  POST_DELETE_PEER,
  POST_GET_AVAILABLE_IPS,
  POST_PING,
  POST_SWITCH_CONFIG_STATUS, POST_TRACEROUTE, POST_UPDATE_ACCOUNT_DATA, POST_UPDATE_GLOBAL_CONFIG,
  POST_UPDATE_PEER_SETTINGS
} from "./url_helper";

const api = new APIClient();

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = localStorage.getItem("authUser");
  if (user) return JSON.parse(user);
  return null;
};

// //is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

export const postLogin = (data) => api.create(url.POST_LOGIN, data);
export const postChangeTheme = (data) => api.create(url.POST_ADMIN_CHANGE_THEME, data);
export const postChangeLang = (data) => api.create(url.POST_ADMIN_CHANGE_LANG, data);

export const postChangeListType = (data) => api.create(url.POST_CHANGE_LIST_TYPE, data);
export const postChangeRefreshTime = (data) => api.create(url.POST_CHANGE_REFRESH_TIME, data);

//CONFIG
export const getServerStatus = () => api.get(url.GET_SERVER_STATUS);
export const getConfigsList = () => api.get(url.GET_CONFIGS_LIST);
export const getConfig = (name) => api.get(url.GET_CONFIG, {name: name});
export const postCheckIpAddress = (data) => api.create(url.CHECK_IP_ADDRESS, data);
export const postCheckPort = (data) => api.create(url.CHECK_PORT, data);
export const postCheckName = (data) => api.create(url.CHECK_NAME, data);
export const postAddNewConfig = (data) => api.create(url.ADD_NEW_CONFIG, data);
export const postSwitchConfigStatus = (data) => api.create(url.POST_SWITCH_CONFIG_STATUS, data);
export const postAddNewPeer = (data) => api.create(url.POST_ADD_NEW_PEER, data);
export const postGetAvailableIPs = (data) => api.create(url.POST_GET_AVAILABLE_IPS, data);
export const postDeletePeer = (data) => api.create(url.POST_DELETE_PEER, data);
export const getConfigChartData = (data) => api.get(url.GET_CONFIG_CHART, data);
export const getPeerChartData = (data) => api.get(url.GET_PEER_CHART, data);
export const postChangePeerState = (data) => api.create(url.POST_CHANGE_PEER_STATE, data);
export const postUpdatePeerSettings = (data) => api.create(url.POST_UPDATE_PEER_SETTINGS, data);
export const getConfigTools = () => api.get(url.GET_CONFIG_TOOLS);
export const postPingIp = (data) => api.create(url.POST_PING, data);
export const postTracerouteIp = (data) => api.create(url.POST_TRACEROUTE, data);
export const postUpdateGlobalConfig = (data) => api.create(url.POST_UPDATE_GLOBAL_CONFIG, data);
export const postUpdateAccountData = (data) => api.create(url.POST_UPDATE_ACCOUNT_DATA, data);
