import {
    ADD_NEW_CONFIG,
    ADD_NEW_CONFIG_SUCCESS,
    ADD_NEW_PEER_SUCCESS,
    CHECK_INTERFACE_NAME,
    CHECK_INTERFACE_NAME_ERROR,
    CHECK_INTERFACE_NAME_SUCCESS,
    CHECK_IP_ADDRESS,
    CHECK_IP_ADDRESS_ERROR,
    CHECK_IP_ADDRESS_SUCCESS,
    CHECK_PORT,
    CHECK_PORT_ERROR,
    CHECK_PORT_SUCCESS,
    DELETE_PEER_SUCCESS,
    FETCH_CONFIG_FOR_TOOLS,
    FETCH_CONFIG_FOR_TOOLS_SUCCESS,
    GET_AVAILABLE_IPS,
    GET_AVAILABLE_IPS_ERROR,
    GET_AVAILABLE_IPS_SUCCESS,
    GET_CONFIG,
    GET_CONFIG_CHART_DATA,
    GET_CONFIG_CHART_DATA_SUCCESS,
    GET_CONFIG_ERROR,
    GET_CONFIG_SUCCESS,
    GET_CONFIGS,
    GET_CONFIGS_ERROR,
    GET_CONFIGS_SUCCESS,
    GET_PEER_CHART_DATA,
    GET_PEER_CHART_DATA_SUCCESS,
    GET_SERVER_STATUS,
    GET_SERVER_STATUS_ERROR,
    GET_SERVER_STATUS_SUCCESS,
    RESET_CONFIG_CHART_DATA,
    RESET_PEER_CHART_DATA,
    SET_PING,
    SET_PING_ERROR,
    SET_PING_SUCCESS, SET_TRACEROUTE, SET_TRACEROUTE_ERROR, SET_TRACEROUTE_SUCCESS,
    SWITCH_CONFIG_STATUS,
    SWITCH_CONFIG_STATUS_SUCCESS, UPDATE_ACCOUNT_DATA,
    UPDATE_PEER_SETTINGS,
    UPDATE_PEER_SETTINGS_ERROR
} from "./actionTypes";

const initialState = {
    configs: [],
    globalConfig: {
        ip: null,
        dns: null,
        endpoint: null,
        mtu: null,
        keepalive: null,
        path: null
    },
    system: {
        platform: null,
        freemem: 0,
        totalmem: 0,
        cpuUsage: 0,
        diskUsage: 0
    },
    ip_amount: 0,
    port_check: true,
    nameAvailable: true,
    conf: {
        conf: '',
        status: '',
        public_key: '',
        port: '',
        checked: ''
    },
    errorMsg: "",
    loading: false,
    error: false,
    configData: null,
    availableIPs: [],
    chartData: {
        sent: [],
        receive: [],
        time: []
    },
    peerChartData: {
        sent: [],
        receive: [],
        time: []
    },
    upError: null,
    interfaces: [],
    pingData: null,
    pinging: false,
    traceData: null,
    tracing: false
};

const config = (state = initialState, action) => {
    switch (action.type) {
        case ADD_NEW_CONFIG:
            state = {
                ...state
            }
            break
        case ADD_NEW_CONFIG_SUCCESS:
            state = {
                ...state,
                configs: [...action.payload.data.configs],
                //globalConfig: [...action.payload.data.globalConfig]
            }
            break
        case GET_SERVER_STATUS:
            state = {
                ...state,
                error: false
            }
            break;
        case GET_SERVER_STATUS_SUCCESS:
            state = {
                ...state,
                error: false,
                system: action.payload.data.system
            }
            break;
        case GET_SERVER_STATUS_ERROR:
            state = {
                ...state,
                error: true,
                errorMsg: action.payload.message
            }
            break;
        case GET_CONFIGS:
            state = {
                ...state,
                error: false
            }
            break;
        case GET_CONFIGS_SUCCESS:
            state = {
                ...state,
                error: false,
                configs: [...action.payload.data.configs],
                globalConfig: {...action.payload.data.globalConfig},
            }
            break;
        case GET_CONFIG:
            state = {
                ...state,
                error: false
            }
            break;
        case GET_CONFIG_SUCCESS:
            state = {
                ...state,
                error: false,
                configData: action.payload.data.confData
            }
            break;
        case ADD_NEW_PEER_SUCCESS:
            state = {
                ...state,
                error: false,
                configData: action.payload.data.confData
            }
            break;
        case DELETE_PEER_SUCCESS:
            state = {
                ...state,
                error: false,
                configData: action.payload.data.confData
            }
            break;
        case GET_CONFIG_ERROR:
            state = {
                ...state,
                error: false,
                configData: null
            }
            break;
        case SWITCH_CONFIG_STATUS:
            state = {
                ...state,
                error: false
            }
            break;
        case SWITCH_CONFIG_STATUS_SUCCESS:
            state = {
                ...state,
                error: false,
                configs: [...action.payload.data.configs]
            }
            break;
        case GET_CONFIGS_ERROR:
            state = {
                ...state,
                error: true,
                errorMsg: action.payload.message
            }
            break;
        case CHECK_IP_ADDRESS:
            state = {
                ...state,
                // error: false
            }
            break;
        case CHECK_IP_ADDRESS_SUCCESS:
            state = {
                ...state,
                ip_amount: action.payload.data.amount
            }
            break;
        case CHECK_IP_ADDRESS_ERROR:
            state = {
                ...state,
                errorMsg: action.payload.message
            }
            break;
        case CHECK_PORT:
            state = {
                ...state,
                port_check: true
                // error: false
            }
            break;
        case CHECK_PORT_SUCCESS:
            state = {
                ...state,
                port_check: action.payload.data.portAvailable,
                conf: action.payload.data.conf
            }
            break;
        case CHECK_PORT_ERROR:
            state = {
                ...state,
                errorMsg: action.payload.message
            }
            break;
        case CHECK_INTERFACE_NAME:
            state = {
                ...state,
                nameAvailable: true
                // error: false
            }
            break;
        case CHECK_INTERFACE_NAME_SUCCESS:
            state = {
                ...state,
                nameAvailable: action.payload.data.nameAvailable,
            }
            break;
        case CHECK_INTERFACE_NAME_ERROR:
            state = {
                ...state,
                errorMsg: action.payload.message
            }
            break;
        case GET_AVAILABLE_IPS:
            state = {
                ...state,
                availableIPs: []
            }
            break;
        case GET_AVAILABLE_IPS_SUCCESS:
            state = {
                ...state,
                availableIPs: action.payload.data.availableIps
            }
            break;
        case GET_AVAILABLE_IPS_ERROR:
            state = {
                ...state,
                errorMsg: action.payload.message
            }
            break;
        case RESET_CONFIG_CHART_DATA:
            state = {
                ...state,
                chartData: {sent: [], receive: [], time: []}
            }
            break;
        case GET_CONFIG_CHART_DATA:
            state = {
                ...state,
                error: false,
            }
            break;
        case GET_CONFIG_CHART_DATA_SUCCESS:
            state = {
                ...state,
                error: false,
                chartData: action.payload.data.chartData
            }
            break;
        case RESET_PEER_CHART_DATA:
            state = {
                ...state,
                peerChartData: {sent: [], receive: [], time: []}
            }
            break;
        case GET_PEER_CHART_DATA:
            state = {
                ...state,
                error: false,
            }
            break;
        case GET_PEER_CHART_DATA_SUCCESS:
            state = {
                ...state,
                error: false,
                peerChartData: action.payload.data.peerChartData
            }
            break;
        case UPDATE_PEER_SETTINGS:
            state = {
                ...state,
                upError: null
            }
            break;
        case UPDATE_PEER_SETTINGS_ERROR:
            state = {
                ...state,
                upError: action.payload.error.message
            }
            break;
        case FETCH_CONFIG_FOR_TOOLS:
            state = {
                ...state,
                interfaces: [],
                pingData: null
            }
            break
        case FETCH_CONFIG_FOR_TOOLS_SUCCESS:
            state = {
                ...state,
                interfaces: action.payload.interfaces,
                pingData: null
            }
            break
        case SET_PING:
            state = {
                ...state,
                pingData: null,
                pinging: true
            }
            break
        case SET_PING_SUCCESS:
            state = {
                ...state,
                pingData: action.payload.pingData,
                pinging: false
            }
            break
        case SET_PING_ERROR:
            state = {
                ...state,
                pingData: null,
                pinging: false
            }
            break
        case SET_TRACEROUTE:
            state = {
                ...state,
                traceData: null,
                tracing: true
            }
            break
        case SET_TRACEROUTE_SUCCESS:
            state = {
                ...state,
                traceData: action.payload.traceData,
                tracing: false
            }
            break
        case SET_TRACEROUTE_ERROR:
            state = {
                ...state,
                traceData: null,
                tracing: false
            }
            break
        case UPDATE_ACCOUNT_DATA:
            state = {
                ...state,
                errorMsg: null
            }
            break;
        default:
            state = {...state};
            break;
    }
    return state;
};

export default config;
