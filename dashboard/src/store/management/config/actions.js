import {
  ADD_NEW_CONFIG,
  ADD_NEW_CONFIG_ERROR,
  ADD_NEW_CONFIG_SUCCESS,
  ADD_NEW_PEER,
  ADD_NEW_PEER_ERROR,
  ADD_NEW_PEER_SUCCESS,
  CHANGE_PEER_STATE,
  CHANGE_PEER_STATE_ERROR,
  CHANGE_PEER_STATE_SUCCESS,
  CHECK_INTERFACE_NAME,
  CHECK_INTERFACE_NAME_ERROR,
  CHECK_INTERFACE_NAME_SUCCESS,
  CHECK_IP_ADDRESS,
  CHECK_IP_ADDRESS_ERROR,
  CHECK_IP_ADDRESS_SUCCESS,
  CHECK_PORT,
  CHECK_PORT_ERROR,
  CHECK_PORT_SUCCESS,
  DELETE_PEER,
  DELETE_PEER_ERROR,
  DELETE_PEER_SUCCESS,
  FETCH_CONFIG_FOR_TOOLS,
  FETCH_CONFIG_FOR_TOOLS_ERROR,
  FETCH_CONFIG_FOR_TOOLS_SUCCESS,
  GET_AVAILABLE_IPS,
  GET_AVAILABLE_IPS_ERROR,
  GET_AVAILABLE_IPS_SUCCESS,
  GET_CONFIG,
  GET_CONFIG_CHART_DATA,
  GET_CONFIG_CHART_DATA_ERROR,
  GET_CONFIG_CHART_DATA_SUCCESS,
  GET_CONFIG_ERROR,
  GET_CONFIG_SUCCESS,
  GET_CONFIGS,
  GET_CONFIGS_ERROR,
  GET_CONFIGS_SUCCESS,
  GET_PEER_CHART_DATA,
  GET_PEER_CHART_DATA_ERROR,
  GET_PEER_CHART_DATA_SUCCESS,
  GET_SERVER_STATUS,
  GET_SERVER_STATUS_ERROR,
  GET_SERVER_STATUS_SUCCESS,
  RESET_CONFIG_CHART_DATA,
  RESET_PEER_CHART_DATA,
  SET_PING,
  SET_PING_ERROR,
  SET_PING_SUCCESS,
  SET_TRACEROUTE,
  SET_TRACEROUTE_ERROR,
  SET_TRACEROUTE_SUCCESS,
  SWITCH_CONFIG_STATUS,
  SWITCH_CONFIG_STATUS_ERROR,
  SWITCH_CONFIG_STATUS_SUCCESS,
  UPDATE_ACCOUNT_DATA, UPDATE_ACCOUNT_DATA_ERROR,
  UPDATE_ACCOUNT_DATA_SUCCER,
  UPDATE_ACCOUNT_DATA_SUCCESS,
  UPDATE_GLOBAL_CONF,
  UPDATE_LIST_TYPE,
  UPDATE_PEER_SETTINGS,
  UPDATE_PEER_SETTINGS_ERROR,
  UPDATE_PEER_SETTINGS_SUCCESS,
  UPDATE_REFRESH_TIME

} from "./actionTypes";

export const fetchServerStatus = () => {
  return {
    type: GET_SERVER_STATUS
  }
}

export const fetchServerStatusSuccess = (data) => {
  return {
    type: GET_SERVER_STATUS_SUCCESS,
    payload: {data}
  }
}

export const fetchServerStatusError = (error) => {
  return {
    type: GET_SERVER_STATUS_ERROR,
    payload: {error}
  }
}

export const fetchConfigs = () => {
  return {
    type: GET_CONFIGS
  }
}

export const fetchConfigsSuccess = (data) => {
  return {
    type: GET_CONFIGS_SUCCESS,
    payload: {data}
  }
}

export const fetchConfigsError = (error) => {
  return {
    type: GET_CONFIGS_ERROR,
    payload: {error}
  }
}

export const fetchConfig = (name) => {
  return {
    type: GET_CONFIG,
    payload: name
  }
}

export const fetchConfigSuccess = (data) => {
  return {
    type: GET_CONFIG_SUCCESS,
    payload: {data}
  }
}

export const fetchConfigError = (error) => {
  return {
    type: GET_CONFIG_ERROR,
    payload: {error}
  }
}

export const checkIpAddress = (ip) => {
  return {
    type: CHECK_IP_ADDRESS,
    payload: ip
  }
}

export const checkIpAddressSuccess = (data) => {
  return {
    type: CHECK_IP_ADDRESS_SUCCESS,
    payload: {data}
  }
}

export const checkIpAddressError = (error) => {
  return {
    type: CHECK_IP_ADDRESS_ERROR,
    payload: {error}
  }
}

export const checkPort = (port) => {
  return {
    type: CHECK_PORT,
    payload: port
  }
}

export const checkPortSuccess = (data) => {
  return {
    type: CHECK_PORT_SUCCESS,
    payload: {data}
  }
}

export const checkPortError = (error) => {
  return {
    type: CHECK_PORT_ERROR,
    payload: {error}
  }
}

export const checkInterfaceName = (name) => {
  return {
    type: CHECK_INTERFACE_NAME,
    payload: name
  }
}

export const checkInterfaceNameSuccess = (data) => {
  return {
    type: CHECK_INTERFACE_NAME_SUCCESS,
    payload: {data}
  }
}

export const checkInterfaceNameError = (error) => {
  return {
    type: CHECK_INTERFACE_NAME_ERROR,
    payload: {error}
  }
}

export const addNewConfig = (config) => {
  return {
    type: ADD_NEW_CONFIG,
    payload: config
  }
}

export const addNewConfigSuccess = (data) => {
  return {
    type: ADD_NEW_CONFIG_SUCCESS,
    payload: {data}
  }
}

export const addNewConfigError = (error) => {
  return {
    type: ADD_NEW_CONFIG_ERROR,
    payload: {error}
  }
}

export const switchConfigStatus = (config) => {
  return {
    type: SWITCH_CONFIG_STATUS,
    payload: config
  }
}

export const switchConfigStatusSuccess = (data) => {
  return {
    type: SWITCH_CONFIG_STATUS_SUCCESS,
    payload: {data}
  }
}

export const switchConfigStatusError = (error) => {
  return {
    type: SWITCH_CONFIG_STATUS_ERROR,
    payload: {error}
  }
}

export const addNewPeer = (peerData) => {
  return {
    type: ADD_NEW_PEER,
    payload: peerData
  }
}

export const addNewPeerSuccess = (data) => {
  return {
    type: ADD_NEW_PEER_SUCCESS,
    payload: {data}
  }
}

export const addNewPeerError = (error) => {
  return {
    type: ADD_NEW_PEER_ERROR,
    payload: {error}
  }
}

export const fetchAvailableIPs = (name) => {
  return {
    type: GET_AVAILABLE_IPS,
    payload: name
  }
}

export const fetchAvailableIPsSuccess = (data) => {
  return {
    type: GET_AVAILABLE_IPS_SUCCESS,
    payload: {data}
  }
}

export const fetchAvailableIPsError = (error) => {
  return {
    type: GET_AVAILABLE_IPS_ERROR,
    payload: {error}
  }
}

export const deletePeer = (data) => {
  return {
    type: DELETE_PEER,
    payload: {data}
  }
}

export const deletePeerSuccess = (data) => {
  return {
    type: DELETE_PEER_SUCCESS,
    payload: {data}
  }
}

export const deletePeerError = (error) => {
  return {
    type: DELETE_PEER_ERROR,
    payload: {error}
  }
}

export const resetConfigChart = () => {
  return {
    type: RESET_CONFIG_CHART_DATA
  }
}

export const fetchConfigChart = (name) => {
  return {
    type: GET_CONFIG_CHART_DATA,
    payload: name
  }
}

export const fetchConfigChartSuccess = (data) => {
  return {
    type: GET_CONFIG_CHART_DATA_SUCCESS,
    payload: {data}
  }
}

export const fetchConfigChartError = (error) => {
  return {
    type: GET_CONFIG_CHART_DATA_ERROR,
    payload: {error}
  }
}

export const resetPeerChart = () => {
  return {
    type: RESET_PEER_CHART_DATA
  }
}

export const fetchPeerChart = (data) => {
  return {
    type: GET_PEER_CHART_DATA,
    payload: data
  }
}

export const fetchPeerChartSuccess = (data) => {
  return {
    type: GET_PEER_CHART_DATA_SUCCESS,
    payload: {data}
  }
}

export const fetchPeerChartError = (error) => {
  return {
    type: GET_PEER_CHART_DATA_ERROR,
    payload: {error}
  }
}

export const changePeerState = (data) => {
  return {
    type: CHANGE_PEER_STATE,
    payload: data
  }
}

// export const changePeerStateSuccess = (data) => {
//   return {
//     type: CHANGE_PEER_STATE_SUCCESS,
//     payload: {data}
//   }
// }
//
// export const changePeerStateError = (error) => {
//   return {
//     type: CHANGE_PEER_STATE_ERROR,
//     payload: {error}
//   }
// }

export const updatePeerSettings = (data) => {
  return {
    type: UPDATE_PEER_SETTINGS,
    payload: data
  }
}

export const updatePeerSettingsSuccess = (data) => {
  return {
    type: UPDATE_PEER_SETTINGS_SUCCESS,
    payload: {data}
  }
}

export const updatePeerSettingsError = (error) => {
  return {
    type: UPDATE_PEER_SETTINGS_ERROR,
    payload: {error}
  }
}

export const updateListType = (data) => {
  return {
    type: UPDATE_LIST_TYPE,
    payload: data
  }
}

export const updateRefreshTime = (data) => {
  return {
    type: UPDATE_REFRESH_TIME,
    payload: data
  }
}

export const fetchConfigTools = () => {
  return {
    type: FETCH_CONFIG_FOR_TOOLS
  }
}

export const fetchConfigToolsSuccess = (data) => {
  return {
    type: FETCH_CONFIG_FOR_TOOLS_SUCCESS,
    payload: data
  }
}

export const fetchConfigToolsError = (error) => {
  return {
    type: FETCH_CONFIG_FOR_TOOLS_ERROR,
    payload: error
  }
}

export const execPing = (data) => {
  return {
    type: SET_PING,
    payload: data
  }
}

export const execPingSuccess = (data) => {
  return {
    type: SET_PING_SUCCESS,
    payload: data
  }
}

export const execPingError = (error) => {
  return {
    type: SET_PING_ERROR,
    payload: error
  }
}


export const execTraceroute = (data) => {
  return {
    type: SET_TRACEROUTE,
    payload: data
  }
}

export const execTracerouteSuccess = (data) => {
  return {
    type: SET_TRACEROUTE_SUCCESS,
    payload: data
  }
}

export const execTracerouteError = (error) => {
  return {
    type: SET_TRACEROUTE_ERROR,
    payload: error
  }
}
export const updateGlobalConf = (data) => {
  return {
    type: UPDATE_GLOBAL_CONF,
    payload: data
  }
}

export const updateAccountData = (data) => {
  return {
    type: UPDATE_ACCOUNT_DATA,
    payload: data
  }
}

export const updateAccountDataSuccess = (data) => {
  return {
    type: UPDATE_ACCOUNT_DATA_SUCCESS,
    payload: data
  }
}

export const updateAccountDataError = (error) => {
  return {
    type: UPDATE_ACCOUNT_DATA_ERROR,
    payload: error
  }
}


