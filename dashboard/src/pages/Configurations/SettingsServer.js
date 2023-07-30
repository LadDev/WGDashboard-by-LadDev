import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {
    Alert,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Container,
    Form,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from 'reactstrap';
import classnames from "classnames";
import Flatpickr from "react-flatpickr";

//import images
import settingsBG from '../../assets/images/settings-bg.jpg';
import {withTranslation} from "react-i18next";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {updateAccountData, updateGlobalConf} from "../../store/management/config/actions";
import {resetLoginFlag} from "../../store/auth/login/actions";

const SettingsServer = (props) => {

    const dispatch = useDispatch()

    const [activeTab, setActiveTab] = useState("1");

    const tabChange = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };
    document.title = props.t("Settings")+" | WireGuard "+props.t("Dashboard");

    const areObjectsEqual = (obj1, obj2) => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    }


    const {globalConfigRes, errorMsg, error} = useSelector(state => ({
        globalConfigRes: state.Config.globalConfig,
        errorMsg: state.Login.errorMsg,
        error: state.Login.error,
    }));

    const [globalConfig, setGlobalConfig] = useState(null)

    const [dns, setDns] = useState(null)
    const [endpoint, setEndpoint] = useState(null)
    const [mtu, setMtu] = useState(null)
    const [keepalive, setKeepalive] = useState(null)
    const [ip, setIp] = useState(null)
    const [path, setPath] = useState(null)

    const [password, setPassword] = useState(null)
    const [newPassword, setNewPassword] = useState(null)
    const [retryPassword, setRetryPassword] = useState(null)

    const [username, setUsername] = useState(null)

    const [pds, setPds] = useState(false)
    const [wcp, setWcp] = useState(false)
    const [acc, setAcc] = useState(false)
    const [pass, setPass] = useState(false)

    useEffect(()=>{
        if(globalConfigRes && !areObjectsEqual(globalConfigRes,globalConfig || {})) {
            setGlobalConfig(globalConfigRes)
            setDns(globalConfigRes.dns)
            setEndpoint(globalConfigRes.endpoint)
            setMtu(globalConfigRes.mtu)
            setKeepalive(globalConfigRes.keepalive)
            setIp(globalConfigRes.ip)
            setPath(globalConfigRes.path)
        }
    },[globalConfigRes])

    useEffect(()=>{
        const authData = JSON.parse(localStorage.getItem("authUser"))

        setUsername(authData.username)
    },[])

    useEffect(()=>{
        let pdsState = false
        let wcpState = false
        let accState = false

        if(dns !== globalConfigRes.dns){
            pdsState = true
        }
        if(endpoint !== globalConfigRes.endpoint){
            pdsState = true
        }
        if(mtu !== globalConfigRes.mtu){
            pdsState = true
        }
        if(keepalive !== globalConfigRes.keepalive){
            pdsState = true
        }
        if(ip !== globalConfigRes.ip){
            pdsState = true
        }

        if(username && username !== ""){
            accState = true
        }else{
            accState = false
        }

        if(path !== globalConfigRes.path){
            wcpState = true
        }

        setWcp(wcpState)
        setPds(pdsState)
        setAcc(accState)

    },[dns,endpoint,mtu,keepalive,ip, path, username])

    const onDnsChange = (e) => {
        setDns(e.target.value)
    }

    const onEndpointChange = (e) => {
        setEndpoint(e.target.value)
    }

    const onMtuChange = (e) => {
        setMtu(e.target.value)
    }

    const onKeepaliveChange = (e) => {
        setKeepalive(e.target.value)
    }

    const onIpChange = (e) => {
        setIp(e.target.value)
    }
    const onPathChange = (e) => {
        setPath(e.target.value)
    }
    const onUsernameChange = (e) => {
        setUsername(e.target.value)
    }

    const onChangePassword = (e) => {
        setPassword(e.target.value)

        if(e.target.value !== "" && newPassword && retryPassword && newPassword !== "" && retryPassword !== newPassword){
            setPass(false)
        }else{
            setPass(true)
        }
    }

    const onChangeNewPassword = (e) => {
        setNewPassword(e.target.value)

        if(password && password !== "" && e.target.value !== "" && e.target.value !== retryPassword && retryPassword){
            setPass(false)
        }else{
            setPass(true)
        }
    }

    const onChangeRetryPassword = (e) => {
        setRetryPassword(e.target.value)

        if(password && password !== "" && e.target.value !== "" && e.target.value !== newPassword && newPassword){
            setPass(false)
        }else{
            setPass(true)
        }
    }

    const onUpdateGlobalConf = () => {
        dispatch(updateGlobalConf({ip,dns,endpoint,mtu,keepalive}))
        setPds(false)
    }

    const onPathUpdate = () => {
        dispatch(updateGlobalConf({path}))
        setWcp(false)
    }

    // const onUpdateUsername = () => {
    //     dispatch(updateAccountData({username}))
    // }

    const onUpdatePassword = () => {
        const authData = JSON.parse(localStorage.getItem("authUser"))
        dispatch(updateAccountData({username: authData.username, password, newPassword, retryPassword}))
        dispatch(resetLoginFlag())
        setPassword("")
        setNewPassword("")
        setRetryPassword("")
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <div className="position-relative mx-n4 mt-n4">
                        <div className="profile-wid-bg profile-setting-img">
                            <img src={settingsBG} className="profile-wid-img" alt="" />
                        </div>
                    </div>
                    <Row>

                        <Col>
                            <Card className="mt-xxl-n5">
                                <CardHeader>
                                    <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                                        role="tablist">
                                        <NavItem>
                                            <NavLink
                                                className={classnames({ active: activeTab === "1" })}
                                                onClick={() => {
                                                    tabChange("1");
                                                }}>
                                                {props.t("Peer Default Settings")}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "2" })}
                                                onClick={() => {
                                                    tabChange("2");
                                                }}
                                                type="button">
                                                {props.t("WireGuard Configuration Path")}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem >
                                            <NavLink to="#"
                                                className={classnames({ active: activeTab === "3" })}
                                                onClick={() => {
                                                    tabChange("3");
                                                }}
                                                type="button">
                                                {props.t("Account")}
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </CardHeader>
                                <CardBody className="p-4">
                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId="1">
                                            <Form>
                                                <Row>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="dnsInput" className="form-label">{props.t("DNS")}</Label>
                                                            <Input type="text" className="form-control" id="dnsInput" placeholder="Enter DNS" defaultValue={dns} onChange={onDnsChange} />
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="peerEndpoint" className="form-label">{props.t("Peer Endpoint Allowed IPs")}</Label>
                                                            <Input type="text" className="form-control" id="peerEndpoint" placeholder="Enter peer Endpoint IPs" defaultValue={endpoint} onChange={onEndpointChange} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="peerMTU" className="form-label">{props.t("MTU")}</Label>
                                                            <Input type="number" className="form-control" id="peerMTU" placeholder="Enter peer MTU" defaultValue={mtu} onChange={onMtuChange} />
                                                        </div>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="peerKeepalive" className="form-label">{props.t("Persistent Keepalive")}</Label>
                                                            <Input type="number" className="form-control" id="peerKeepalive" placeholder="Enter Persistent Keepalive"  defaultValue={keepalive} onChange={onKeepaliveChange} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <div className="mb-3">
                                                            <Label htmlFor="peerRemouteEndpoint" className="form-label">{props.t("Peer Remote Endpoint (This will be change globally, and will be apply to all peer's QR code and configuration file.)")}</Label>
                                                            <Input type="text" className="form-control" id="peerRemouteEndpoint" placeholder="Enter Peer Remote Endpoint"  defaultValue={ip} onChange={onIpChange} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>

                                                    <Col lg={12}>
                                                        <div className="hstack gap-2 justify-content-end">
                                                            <button type="button" className="btn btn-primary" disabled={!pds} onClick={onUpdateGlobalConf}>{props.t("Update")}</button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </TabPane>

                                        <TabPane tabId="2">
                                            <Form>
                                                <Row>
                                                    <Col>
                                                        <div className="mb-3">
                                                            <Label htmlFor="pathInput" className="form-label">{props.t("PATH")}</Label>
                                                            <Input type="text" className="form-control" id="pathInput" placeholder="Enter PATH" defaultValue={path} onChange={onPathChange} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>

                                                    <Col lg={12}>
                                                        <div className="hstack gap-2 justify-content-end">
                                                            <button type="button" className="btn btn-primary" disabled={!wcp} onClick={onPathUpdate}>{props.t("Update")}</button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </TabPane>

                                        <TabPane tabId="3">
                                            {/*<Card>*/}
                                            {/*    <CardBody>*/}
                                            {/*        <Form>*/}
                                            {/*            <Row>*/}
                                            {/*                <Col>*/}
                                            {/*                    <div className="mb-3">*/}
                                            {/*                        <Label htmlFor="pathUsername" className="form-label">{props.t("Username")}</Label>*/}
                                            {/*                        <Input type="text" className="form-control" id="pathUsername" placeholder="Enter username" defaultValue={username} onChange={onUsernameChange} />*/}
                                            {/*                    </div>*/}
                                            {/*                </Col>*/}
                                            {/*            </Row>*/}
                                            {/*            <Row>*/}

                                            {/*                <Col lg={12}>*/}
                                            {/*                    <div className="hstack gap-2 justify-content-end">*/}
                                            {/*                        <button type="button" className="btn btn-danger" disabled={!acc} onClick={onUpdateUsername}>{props.t("Update")}</button>*/}
                                            {/*                    </div>*/}
                                            {/*                </Col>*/}
                                            {/*            </Row>*/}
                                            {/*        </Form>*/}
                                            {/*    </CardBody>*/}
                                            {/*</Card>*/}
                                            <Card>
                                                <CardTitle>{props.t("Security")}</CardTitle>
                                                <CardBody>
                                                    {errorMsg && errorMsg ? (<Alert color="danger"> {errorMsg.message} </Alert>) : null}
                                                    <Form>
                                                        <Row>
                                                            <Col>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="accPass" className="form-label">{props.t("Current Password")}</Label>
                                                                    <Input type="password" className="form-control" id="accPass" placeholder="Enter password" value={password || ""} onChange={onChangePassword} />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="newPassword" className="form-label">{props.t("New Password")}</Label>
                                                                    <Input type="password" className="form-control" id="newPassword" placeholder="Enter New Password" value={newPassword || ""} onChange={onChangeNewPassword} />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="newRepeatPassword" className="form-label">{props.t("Repeat New Password")}</Label>
                                                                    <Input type="password" className="form-control" id="newRepeatPassword" placeholder="Repeat New Password" value={retryPassword || ""} onChange={onChangeRetryPassword} />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                        <Row>

                                                            <Col lg={12}>
                                                                <div className="hstack gap-2 justify-content-end">
                                                                    <button type="button" className="btn btn-danger" disabled={!pass} onClick={onUpdatePassword}>{props.t("Update")}</button>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                </CardBody>
                                            </Card>
                                        </TabPane>

                                    </TabContent>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};
SettingsServer.propTypes = {
    t: PropTypes.any
};
export default withTranslation()(SettingsServer);
