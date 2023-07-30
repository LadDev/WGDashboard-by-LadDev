import { call, put, takeEvery } from "redux-saga/effects";

import {
  ADD_NEW_CONFIG,
  ADD_NEW_PEER,
  CHANGE_PEER_STATE,
  CHECK_INTERFACE_NAME,
  CHECK_IP_ADDRESS,
  CHECK_PORT,
  DELETE_PEER,
  FETCH_CONFIG_FOR_TOOLS,
  GET_AVAILABLE_IPS,
  GET_CONFIG,
  GET_CONFIG_CHART_DATA,
  GET_CONFIGS,
  GET_PEER_CHART_DATA,
  GET_SERVER_STATUS,
  SET_PING,
  SET_TRACEROUTE,
  SWITCH_CONFIG_STATUS, UPDATE_ACCOUNT_DATA, UPDATE_GLOBAL_CONF,
  UPDATE_LIST_TYPE,
  UPDATE_PEER_SETTINGS,
  UPDATE_REFRESH_TIME
} from "./actionTypes";
import {
  addNewConfigError,
  addNewConfigSuccess,
  addNewPeerError,
  addNewPeerSuccess,
  checkInterfaceNameError,
  checkInterfaceNameSuccess,
  checkIpAddressError,
  checkIpAddressSuccess,
  checkPortError,
  checkPortSuccess,
  deletePeerError,
  deletePeerSuccess,
  execPingError,
  execPingSuccess,
  execTracerouteError,
  execTracerouteSuccess,
  fetchAvailableIPsError,
  fetchAvailableIPsSuccess,
  fetchConfigChartError,
  fetchConfigChartSuccess,
  fetchConfigError,
  fetchConfigsError,
  fetchConfigsSuccess,
  fetchConfigSuccess,
  fetchConfigToolsError,
  fetchConfigToolsSuccess,
  fetchPeerChartError,
  fetchPeerChartSuccess,
  fetchServerStatusError,
  fetchServerStatusSuccess,
  switchConfigStatusError,
  switchConfigStatusSuccess, updateAccountDataError, updateAccountDataSuccess,
  updatePeerSettingsError,
  updatePeerSettingsSuccess
} from "./actions";
import {
  getConfig,
  getConfigChartData,
  getConfigsList,
  getConfigTools,
  getPeerChartData,
  getServerStatus,
  postAddNewConfig,
  postAddNewPeer,
  postChangeListType,
  postChangePeerState,
  postChangeRefreshTime,
  postCheckIpAddress,
  postCheckName,
  postCheckPort,
  postDeletePeer,
  postGetAvailableIPs,
  postPingIp,
  postSwitchConfigStatus,
  postTracerouteIp, postUpdateAccountData, postUpdateGlobalConfig,
  postUpdatePeerSettings
} from "../../../helpers/backend_helper";
import i18n from "../../../i18n";
import {changeLayoutMode} from "../../layouts/action";
import {apiError, loginSuccess} from "../../auth/login/actions";

function* fetchServerStatus() {
  try {
    const response = yield call(getServerStatus);
    yield put(fetchServerStatusSuccess(response));
  } catch (error) {
    yield put(fetchServerStatusError(error.data));
  }
}

function* fetchConfigs() {
  try {
    const response = yield call(getConfigsList);
    yield put(fetchConfigsSuccess(response));
  } catch (error) {
    yield put(fetchConfigsError(error.data));
  }
}

function* fetchConfig({payload: name}) {
  try {
    const response = yield call(getConfig, name);
    if(!response.status || response.status !== "error"){
      yield put(fetchConfigSuccess(response));
    }else if(response.status && response.status === "error"){
      window.location.href = '/home'
    }

  } catch (error) {
    yield put(fetchConfigError(error.data));
  }
}

function* checkIpAddress({payload: ip}) {
  try {
    const response = yield call(postCheckIpAddress, {address: ip});
    yield put(checkIpAddressSuccess(response));
  } catch (error) {
    yield put(checkIpAddressError(error.data));
  }
}

function* checkPort({payload: port}) {
  try {
    const response = yield call(postCheckPort, {port});
    yield put(checkPortSuccess(response));
  } catch (error) {
    yield put(checkPortError(error.data));
  }
}

function* checkInterfaceName({payload: name}) {
  try {
    const response = yield call(postCheckName, {name});
    yield put(checkInterfaceNameSuccess(response));
  } catch (error) {
    yield put(checkInterfaceNameError(error.data));
  }
}

function* addNewConfig({payload: config}) {
  try {
    const response = yield call(postAddNewConfig, config);
    yield put(addNewConfigSuccess(response));
  } catch (error) {
    yield put(addNewConfigError(error.data));
  }
}

function* switchConfigStatus({payload: config}) {
  try {
    const response = yield call(postSwitchConfigStatus, config);
    yield put(switchConfigStatusSuccess(response));
    yield put(fetchConfigSuccess(response));
  } catch (error) {
    yield put(switchConfigStatusError(error.data));
  }
}

function* addNewPeer({payload: peerData}) {
  try {
    const response = yield call(postAddNewPeer, peerData);
    yield put(addNewPeerSuccess(response));
  } catch (error) {
    yield put(addNewPeerError(error.data));
  }
}

function* fetchAvailableIPs({payload: name}) {
  try {
    const response = yield call(postGetAvailableIPs, name);
    yield put(fetchAvailableIPsSuccess(response));
  } catch (error) {
    yield put(fetchAvailableIPsError(error.data));
  }
}

function* deletePeer({payload: {data}}) {
  try {
    const response = yield call(postDeletePeer, data);
    yield put(deletePeerSuccess(response));
  } catch (error) {
    yield put(deletePeerError(error.data));
  }
}
function* fetchConfigChart({payload: name}) {
  try {
    const response = yield call(getConfigChartData, name);
    yield put(fetchConfigChartSuccess(response));
  } catch (error) {
    yield put(fetchConfigChartError(error.data));
  }
}

function* fetchPeerChart({payload: data}) {
  try {
    const response = yield call(getPeerChartData, data);
    yield put(fetchPeerChartSuccess(response));
  } catch (error) {
    yield put(fetchPeerChartError(error.data));
  }
}

function* changePeerState({payload: data}) {
  try {
    const response = yield call(postChangePeerState, data);
    yield put(fetchConfigSuccess(response));
  } catch (error) {
    yield put(fetchConfigError(error.data));
  }
}

function* updatePeerSettings({payload: data}) {
  try {
    const response = yield call(postUpdatePeerSettings, data);
    if(response.code === 0){
      yield put(fetchConfigSuccess(response));
    }else{
      yield put(updatePeerSettingsError(response));
    }

  } catch (error) {
    yield put(updatePeerSettingsError(error.data));
  }
}


function* updateListType({payload: data}) {
  try {
    yield call(postChangeListType, data);
  } catch (error) {
    yield put(updatePeerSettingsError(error.data));
  }
}

function* updateRefreshTime({payload: data}) {
  try {
    yield call(postChangeRefreshTime, data);
  } catch (error) {
    yield put(updatePeerSettingsError(error.data));
  }
}

function* fetchConfigTools() {
  try {
    const response = yield call(getConfigTools);
    yield put(fetchConfigToolsSuccess(response));

  } catch (error) {
    yield put(fetchConfigToolsError(error.data));
  }
}

function* execPing({payload: data}) {
  try {
    const response = yield call(postPingIp, data);
    yield put(execPingSuccess(response));

  } catch (error) {
    yield put(execPingError(error.data));
  }
}

function* execTraceroute({payload: data}) {
  try {
    const response = yield call(postTracerouteIp, data);
    yield put(execTracerouteSuccess(response));

  } catch (error) {
    yield put(execTracerouteError(error.data));
  }
}

function* updateGlobalConf({payload: data}) {
  try {
    const response = yield call(postUpdateGlobalConfig, data);
    yield put(fetchConfigsSuccess(response));
  } catch (error) {
    yield put(fetchConfigsError(error.data));
  }
}

function* updateAccountData({payload: data}) {
  try {
    const response = yield call(postUpdateAccountData, data);

    if (response.status === "success") {
      yield put(updateAccountDataSuccess(response));
    } else {
      //console.log(response)
      yield put(apiError(response));
    }
  } catch (error) {
    // yield put(updateAccountDataError(error.data));
    console.log(error)
    yield put(apiError(error.data));
  }


}


function* configSaga() {
  yield takeEvery(UPDATE_LIST_TYPE, updateListType);
  yield takeEvery(UPDATE_REFRESH_TIME, updateRefreshTime);
  yield takeEvery(GET_SERVER_STATUS, fetchServerStatus);
  yield takeEvery(GET_CONFIGS, fetchConfigs);
  yield takeEvery(GET_CONFIG, fetchConfig);
  yield takeEvery(CHECK_IP_ADDRESS, checkIpAddress);
  yield takeEvery(CHECK_PORT, checkPort);
  yield takeEvery(CHECK_INTERFACE_NAME, checkInterfaceName);
  yield takeEvery(ADD_NEW_CONFIG, addNewConfig);
  yield takeEvery(SWITCH_CONFIG_STATUS, switchConfigStatus);
  yield takeEvery(ADD_NEW_PEER, addNewPeer);
  yield takeEvery(GET_AVAILABLE_IPS, fetchAvailableIPs);
  yield takeEvery(DELETE_PEER, deletePeer);
  yield takeEvery(GET_CONFIG_CHART_DATA, fetchConfigChart);
  yield takeEvery(GET_PEER_CHART_DATA, fetchPeerChart);
  yield takeEvery(CHANGE_PEER_STATE, changePeerState);
  yield takeEvery(UPDATE_PEER_SETTINGS, updatePeerSettings);
  yield takeEvery(FETCH_CONFIG_FOR_TOOLS, fetchConfigTools);
  yield takeEvery(SET_PING, execPing);
  yield takeEvery(SET_TRACEROUTE, execTraceroute);
  yield takeEvery(UPDATE_GLOBAL_CONF, updateGlobalConf);
  yield takeEvery(UPDATE_ACCOUNT_DATA, updateAccountData);
}

export default configSaga;
