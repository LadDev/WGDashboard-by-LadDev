import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Card, CardBody, CardHeader, Col, Input, Row, UncontrolledTooltip} from "reactstrap";
import List from "list.js";
import QrCodeModal from "./Modals/QrCodeModal";
import ClientsList from "./Clients/ClientsList";
import ClientsGrid from "./Clients/ClientsGrid";
import {useDispatch} from "react-redux";
import {
    changePeerState,
    deletePeer,
    fetchConfig,
    updateListType,
    updateRefreshTime
} from "../../store/management/config/actions";
import DeletePeerModal from "./Modals/DeletePeerModal";
import DataUsageModal from "./Modals/DataUsageModal";
import DeactivatePeerModal from "./Modals/DeactivatePeerModal";
import EditPeerModal from "./Modals/EditPeerModal";
import {toast, ToastContainer} from "react-toastify";

const Clients = (props) => {

    const dispatch = useDispatch()

    const [modal_list, setmodal_list] = useState(false);

    const [qrModalState, setQrModalState] = useState(false)
    const [qrCodeData, setQrCodeData] = useState("hellow world")

    const toggleQrModal = () => {
        setQrModalState(!qrModalState)
    }

    function tog_list() {
        setmodal_list(!modal_list);
    }

    const [modal_delete, setmodal_delete] = useState(false);
    function tog_delete() {
        setmodal_delete(!modal_delete);
    }

    const [dataForDelete, setDataForDelete] = useState(null)
    const [dataForDeactivate, setDataForDeactivate] = useState(null)

    const deletePeerData = (peer) => {
        setDataForDelete({interface_name: props.interface_name, public_key: peer.public_key})
        toggleDeleteModal()
    }

    const confirmDeletePeer = () => {
        if(dataForDelete){
            dispatch(deletePeer({...dataForDelete}))
            setDataForDelete(null)
            toggleDeleteModal()
            toast(props.t("The peer has been successfully deleted!"), {position: "top-right", hideProgressBar: false, className: "bg-danger text-white"})
        }
    }

    const changeQrCodeData = (peer) => {
       let qrData = "[Interface]\n" +
        `PrivateKey = ${peer.private_key}\n` +
        `Address = ${peer.allowed_ip}\n` +
        `MTU = ${peer.mtu}\n` +
        `DNS = ${peer.dns}\n` +
        "\n" +
        "[Peer]\n" +
        `PublicKey = ${props.configData.public_key}\n` +
        `AllowedIPs = ${peer.endpoint_allowed_ip}\n` +
        `PersistentKeepalive = ${peer.keepalive}\n` +
        `Endpoint = ${props.configData.server_addr}:${props.configData.port}`

        if(peer.preshared_key && peer.preshared_key !== ""){
            qrData+=`\nPresharedKey = ${peer.preshared_key}`
        }

        setQrCodeData(qrData)
        toggleQrModal();
    }

    const saveToFile = (peer) => {

        let qrData = "[Interface]\n" +
            `PrivateKey = ${peer.private_key}\n` +
            `Address = ${peer.allowed_ip}\n` +
            `MTU = ${peer.mtu}\n` +
            `DNS = ${peer.dns}\n` +
            "\n" +
            "[Peer]\n" +
            `PublicKey = ${props.configData.public_key}\n` +
            `AllowedIPs = ${peer.endpoint_allowed_ip}\n` +
            `PersistentKeepalive = ${peer.keepalive}\n` +
            `Endpoint = ${props.configData.server_addr}:${props.configData.port}`

        if(peer.preshared_key && peer.preshared_key !== ""){
            qrData+=`\nPresharedKey = ${peer.preshared_key}`
        }

        const blob = new Blob([qrData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${peer.name}_${peer.interface_name}.conf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    function convertMillisecondsToTime(ms) {
        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        let weeks = Math.floor(days / 7);
        let months = Math.floor(days / 30);
        let years = Math.floor(months / 12);

        years %= 12; months %= 30; weeks %= 7; days %= 30; hours %= 24; minutes %= 60; seconds %= 60;

        return {years, months, weeks, days, hours, minutes, seconds,};
    }

    const latestHandshake = (lh) => {
        if(!lh || isNaN(lh) || lh === "0"){return "N/A"}

        const LatHand = parseInt(lh,10)*1000

        const cmtt = convertMillisecondsToTime(Date.now() - LatHand)

        let res = ""

        if(cmtt.years > 0){res += `${cmtt.years} ${props.t("YERS")}, `}
        if(cmtt.months > 0){res += `${cmtt.months} ${props.t("MONTH")}, `}
        if(cmtt.weeks > 0){res += `${cmtt.weeks} ${props.t("WEEKS")}, `}
        if(cmtt.days > 0){res += `${cmtt.days} ${props.t("DAYS")}, `}

        let hoursS = `${cmtt.hours}`
        if(cmtt.hours<10){hoursS = `0${hoursS}`}

        let minutesS = `${cmtt.minutes}`
        if(cmtt.minutes<10){minutesS = `0${cmtt.minutes}`}

        let secondsS = `${cmtt.seconds}`
        if(cmtt.seconds<10){secondsS = `0${cmtt.seconds}`}

        res += `${hoursS}:${minutesS}:${secondsS}`


        return res

    }

    const convertToGB = (usage) => {
        if(usage && !isNaN(Number(usage))){

            let usageTMP = Number(usage)

            if(usageTMP/(1024**3) > 1){
                return (usageTMP/(1024**3)).toFixed(4)+" GB"
            }else if(usageTMP/(1024**2) > 1){
                return (usageTMP/(1024**2)).toFixed(2)+" MB"
            }else{
                return (usageTMP/(1024**1)).toFixed(2)+" KB"
            }
            //return Number(Number(usage)/(1024**3)).toFixed(4)
        }else{
            return 0
        }
    }

    const [gridActive, setGridActive] = useState("active")
    const [listActive, setListActive] = useState("")

    const toList = () => {
        setGridActive("")
        setListActive("active")

        let authUser = JSON.parse(localStorage.getItem("authUser"))
        authUser.listType = "list"
        localStorage.setItem("authUser", JSON.stringify(authUser))

        dispatch(updateListType({listType: "list"}))
    }

    const toGrid = () => {
        setGridActive("active")
        setListActive("")

        let authUser = JSON.parse(localStorage.getItem("authUser"))
        authUser.listType = "grid"
        localStorage.setItem("authUser", JSON.stringify(authUser))

        dispatch(updateListType({listType: "grid"}))
    }



    const [deletePeerState, setDeletePeerState] = useState(false)
    const [deactivatePeerState, setDeactivatePeerState] = useState(false)

    const toggleDeleteModal = () => {
        if(deletePeerState){
            setDataForDelete(null)
        }
        setDeletePeerState(!deletePeerState)
    }

    const [duModalState, setDUModalState] = useState(false)
    const [duPublic, setDUPublic] = useState(null)
    const [duName, setDUName] = useState(null)

    const toggleDUModal = (public_key = null, name = null) => {
        setDUPublic(public_key)
        setDUName(name)
        setDUModalState(!duModalState)
    }

    const toggleDeactivateModal = () => {
        if(deactivatePeerState){
            setDataForDeactivate(null)
        }
        setDeactivatePeerState(!deactivatePeerState)
    }

    const switchPeerState = (peer) => {

        if(peer.enabled){
            setDataForDeactivate({interface_name: props.interface_name, public_key: peer.public_key})
            toggleDeactivateModal()
        }else{
            dispatch(changePeerState({interface_name: peer.interface_name, public_key: peer.public_key}))
            toast(props.t("The peer has been successfully activated!"), {position: "top-right", hideProgressBar: false, className: "bg-success text-white"})
        }
    }

    const confirmDeactivatePeer = () => {
        if(dataForDeactivate){
            dispatch(changePeerState({...dataForDeactivate}))
            setDataForDeactivate(null)
            toggleDeactivateModal()

            toast(props.t("The peer has been successfully deactivated!"), {position: "top-right", hideProgressBar: false, className: "bg-warning text-black"})
        }
    }

    const [editModalState, setEditModalState] = useState(false)
    const [editModalPeer, setEditModalPeer] = useState(null)

    const toggleEditModal = (peer = null) => {
        if(editModalState){
            setEditModalPeer(null)
        }
        setEditModalPeer(peer)
        setEditModalState(!editModalState)
    }

    const manualRefreshInfo = () => {
        dispatch(fetchConfig(props.interface_name))
    }

    const onChangeInterval = (newInterval = 10000) => {
        props.onChangeInterval(newInterval)
        dispatch(updateRefreshTime({intervalTime: newInterval}))
    }

    const [fActive, setfActive] = useState("")
    const [tActive, settActive] = useState("")
    const [ttActive, setttActive] = useState("")
    const [mActive, setmActive] = useState("")


    useEffect(()=>{
        if(props.intervalTime === 5000){
            setfActive("active");settActive("");setttActive("");setmActive("")

        }else if(props.intervalTime === 10000){
            setfActive("");settActive("active");setttActive("");setmActive("")
        }else if(props.intervalTime === 30000){
            setfActive("");settActive("");setttActive("active");setmActive("")
        }else if(props.intervalTime === 60000){
            setfActive("");settActive("");setttActive("");setmActive("active")
        }
    },[props.intervalTime])


    useEffect(()=>{
        let authUser = JSON.parse(localStorage.getItem("authUser"))
        if(authUser.listType === "list"){
            setGridActive("")
            setListActive("active")
        }else{
            setGridActive("active")
            setListActive("")
        }

    },[])

    const searchPeer = (ele) => {
        let search = ele.target.value;
        setSearchText(search.toUpperCase())
    };

    const [configData, setConfigData] = useState(null)
    const [searchText, setSearchText] = useState("")
    const [selectedType, setSelectedType] = useState("all")

    useEffect(()=>{
        let CD = {...props.configData}
        if(searchText.length > 0){
            CD.peers =  props.configData.peers.filter((data) => data.name.toUpperCase().includes(searchText))
        }

        let SP = {...CD}

        if(selectedType === "all"){
            SP = {...CD}
        }else if(selectedType === "online"){
            SP.peers = CD.peers.filter((data) => data.status === "online")
        }else if(selectedType === "offline"){
            SP.peers = CD.peers.filter((data) => data.status !== "online" && data.enabled === true)
        }else if(selectedType === "deactivated"){
            SP.peers = CD.peers.filter((data) => data.enabled !== true)
        }


        setConfigData(SP)
    },[props.configData, searchText, selectedType])

    const onChangePeerShow = (e) => {
        setSelectedType(e.target.value)
    }

    const handleCopyClick = (textToCopy) => {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999); // Для мобильных устройств
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);

        toast(props.t("The text has been successfully copied to the clipboard!"), {position: "top-right", hideProgressBar: false, className: "bg-primary text-white"})
    };

    return (
        <React.Fragment>
            <ToastContainer />

            {editModalState && editModalState?(
                <EditPeerModal peer={editModalPeer} show={editModalState} toggle={toggleEditModal} interface_name={props.interface_name} />
            ):("")}


            <DeletePeerModal onDeleteClick={confirmDeletePeer} onCloseClick={toggleDeleteModal} show={deletePeerState} />
            <DeactivatePeerModal onDeleteClick={confirmDeactivatePeer} onCloseClick={toggleDeactivateModal} show={deactivatePeerState} />

            <QrCodeModal qrCodeData={qrCodeData} toggle={toggleQrModal} modalState={qrModalState} />
            <DataUsageModal show={duModalState} toggle={toggleDUModal} confName={props.interface_name} public_key={duPublic} name={duName} />

            <Col sm={12} lg={12} md={12}>
                <Card>
                    <CardBody>
                        <Row>
                            <Col className={""}>
                                <label><small className="text-muted">{props.t("Search Peers")}</small></label>
                                <div className="d-flex justify-content-sm-start" >
                                    <div className="search-box">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="searchResultList"
                                            placeholder={props.t("Enter Peer's Name...")}
                                            onKeyUp={(e) => searchPeer(e)}
                                        />
                                        <i className="ri-search-line search-icon"></i>
                                    </div>
                                </div>
                            </Col>
                            <Col className={""}>
                                <label><small className="text-muted">{props.t("Show Peers")}</small></label>
                                <div className="d-flex justify-content-sm-start" >
                                    <div className="">
                                        <select className={"form-control form-select"} defaultValue={selectedType} onChange={onChangePeerShow}>
                                            <option value={"all"}>{props.t("All")}</option>
                                            <option value={"online"}>{props.t("Online")}</option>
                                            <option value={"offline"}>{props.t("Offline")}</option>
                                            <option value={"deactivated"}>{props.t("Deactivated")}</option>
                                        </select>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={4} lg={4} md={4}>
                                <label><small className="text-muted">{props.t("Refresh Interval")}</small></label>
                                <div className="d-flex justify-content-center btn-group">
                                    <button type="button" className={`btn btn-outline-info`} id={"refresh_peers_btn"} onClick={manualRefreshInfo}><i className="mdi mdi-database-sync" style={{fontSize: "1rem"}}></i></button>
                                    <button type="button" className={`btn btn-outline-info ${fActive}`} onClick={()=>{onChangeInterval(5000)}} >5S</button>
                                    <button type="button" className={`btn btn-outline-info ${tActive}`} onClick={()=>{onChangeInterval(10000)}} >10s</button>
                                    <button type="button" className={`btn btn-outline-info ${ttActive}`} onClick={()=>{onChangeInterval(30000)}} >30s</button>
                                    <button type="button" className={`btn btn-outline-info ${mActive}`} onClick={()=>{onChangeInterval(60000)}} >1m</button>
                                </div>
                                <UncontrolledTooltip target={`refresh_peers_btn`} placement={"bottom"} >{props.t("Refresh Information")}</UncontrolledTooltip>
                            </Col>
                            <Col className={"text-end"} sm={4} lg={4} md={4}>
                                <label ><small className="text-muted">{props.t("Display Mode")}</small></label>
                                <div className="d-flex gap-1">
                                    <div className="me-auto"></div>
                                    <div className="btn-group" role="group">
                                        <button onClick={toGrid} style={{width: "20%"}} type="button" className={"btn btn-outline-info display_mode "+gridActive} id={"grid_mode"}><i className="mdi mdi-view-grid-outline" style={{fontSize: "1rem"}}></i></button>
                                        <button onClick={toList} style={{width: "20%"}} type="button" className={"btn btn-outline-info display_mode "+listActive} id={"list_mode"} ><i className="mdi mdi-format-list-bulleted" style={{fontSize: "1rem"}}></i></button>

                                        <UncontrolledTooltip target={`grid_mode`} placement={"bottom"} >{props.t("Grid mode")}</UncontrolledTooltip>
                                        <UncontrolledTooltip target={`list_mode`} placement={"bottom"} >{props.t("List mode")}</UncontrolledTooltip>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>

            {!configData||configData.peers.length === 0?(
                <div className="noresult mb-3">
                    <div className="text-center">
                        <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop"
                                   colors="primary:#121331,secondary:#08a88a" style={{ width: "75px", height: "75px" }}>
                        </lord-icon>
                        <h5 className="mt-2">Oops! No peers found ‘︿’</h5>
                        <p className="text-muted mb-0">No Peers found or added yet. Please add a new Peer so that clients can connect.</p>
                    </div>
                </div>
            ):(
                <Col sm={12} lg={12} md={12}>
                    <Card>
                        {/*<CardHeader>Connection List</CardHeader>*/}
                        <CardBody>
                            {gridActive === "active"?(
                                <ClientsGrid configData={configData} interface_name={props.interface_name} latestHandshake={latestHandshake} convertToGB={convertToGB} changeQrCodeData={changeQrCodeData} saveToFile={saveToFile} deletePeerData={deletePeerData} toggleDUModal={toggleDUModal} switchPeerState={switchPeerState} toggleEditModal={toggleEditModal} handleCopyClick={(text)=>{handleCopyClick(text)}} />
                            ):("")}

                            {listActive === "active"?(
                                <ClientsList configData={configData} interface_name={props.interface_name} latestHandshake={latestHandshake} convertToGB={convertToGB} changeQrCodeData={changeQrCodeData} saveToFile={saveToFile} deletePeerData={deletePeerData} toggleDUModal={toggleDUModal} switchPeerState={switchPeerState} toggleEditModal={toggleEditModal} handleCopyClick={handleCopyClick} />
                            ):("")}
                        </CardBody>
                    </Card>
                </Col>
            )}
        </React.Fragment>
    );
}

Clients.propTypes = {
    t: PropTypes.any,
    configData: PropTypes.object,
    interface_name: PropTypes.string,
    onChangeInterval: PropTypes.func,
    intervalTime: PropTypes.number
};

export default withTranslation()(Clients);
