import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {
    Button,
    Col,
    Form,
    FormFeedback,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {
    addNewPeer, fetchAvailableIPs
} from "../../../store/management/config/actions";
import * as WireGuard from "../../Configurations/WireGuard";
import AvailableIPsModal from "./AvailableIPsModal";

const AddPeerModal = (props) => {
    const dispatch = useDispatch()
    //
    const {availableIPsRes, globalConfigRes} = useSelector(state => ({
        availableIPsRes: state.Config.availableIPs,
        globalConfigRes: state.Config.globalConfig,
    }));

    const [modalState, setModalState] = useState(false)
    const [globalConfig, setGlobalConfig] = useState(null)
    const [peerName, setPeerName] = useState("")
    const [peerAddress, setPeerAddress] = useState("")
    const [peerDNS, setPeerDNS] = useState("1.1.1.1")
    const [peerEndpoint, setPeerEndpoint] = useState("0.0.0.0/0")
    const [peerMTU, setPeerMTU] = useState("1420")
    const [peerKeepAlive, setPeerKeepAlive] = useState("21")
    const [usePreSharedKey, setUsePreSharedKey] = useState(false)
    const [availableIPs, setAvailableIPs] = useState([])
    const [availableState, setAvailableState] = useState(false)



    useEffect(()=>{
        if(modalState !== props.modalState){
            setModalState(props.modalState)
            setPeerName("")
            setPeerAddress("")
            setPeerDNS(globalConfigRes.dns || "1.1.1.1")
            setPeerMTU(globalConfigRes.mtu || "1420")
            setPeerEndpoint(globalConfigRes.endpoint || "0.0.0.0/0")
            setPeerKeepAlive(globalConfigRes.keepalive || "21")
            setUsePreSharedKey(false)
            setAvailableIPs([])
            setAvailableState(false)
        }

        if(props.modalState){
            dispatch(fetchAvailableIPs({name: props.interface_name}))
        }

    },[props.modalState])

    useEffect(()=>{
        if(props.modalState){
            setPeerDNS(globalConfigRes.dns || "1.1.1.1")
            setPeerMTU(globalConfigRes.mtu || "1420")
            setPeerEndpoint(globalConfigRes.endpoint || "0.0.0.0/0")
            setPeerKeepAlive(globalConfigRes.keepalive || "21")
        }
    },[globalConfig])

    useEffect(()=>{
        if(globalConfigRes === null && props.modalState){
            setGlobalConfig(globalConfigRes)
        }
    },[globalConfigRes])


    useEffect(()=>{
        if(availableIPsRes !== availableIPs){
            setAvailableIPs(availableIPsRes)
            if(availableIPsRes.length > 0){
                setPeerAddress(availableIPsRes[0])
            }

        }
    },[availableIPsRes])

    const keys = window.wireguard.generateKeypair()

    const [privateKey, setPrivateKey] = useState(keys.privateKey)
    const [preSharedKey, setPreSharedKey] = useState(keys.presharedKey)
    const [publicKey, setPublicKey] = useState(keys.publicKey)

    useEffect(()=>{
        if(privateKey && privateKey !== ""){
            setPublicKey(window.wireguard.generatePublicKey(privateKey))
        }else{
            setPublicKey("")
        }

    },[privateKey])

    const validation = useFormik({
        enableReinitialize: true,

        initialValues: {
            private_key: privateKey || "",
            public_key: publicKey || "",
            peer_name: peerName || "",
            peer_address: peerAddress || "",
            peer_dns: peerDNS || "",
            peer_endpoint: peerEndpoint || "",
            peer_mtu: peerMTU || "",
            peer_keepalive: peerKeepAlive || "",
            preshared_key: preSharedKey || "",
        },
        validationSchema: Yup.object({
            private_key: Yup.string().required(props.t("Please Enter Private Key")),
            public_key: Yup.string().required(props.t("Please Enter Public Key")),
            peer_name: Yup.string().required(props.t("Please Enter Name")),
            peer_dns: Yup.string().required(props.t("Please Enter DNS")),
            peer_endpoint: Yup.string().required(props.t("Please Enter Endpoint Allowed IPs")),
            peer_mtu: Yup.string().required(props.t("Please Enter MTU")),
            peer_keepalive: Yup.string().required(props.t("Please Enter Persistent keepalive")),
        }),
        onSubmit: (values) => {
            const peerData = {...values, usePreSharedKey, interface_name: props.interface_name}

            dispatch(addNewPeer(peerData))
            refreshPrivate()

            props.toggle()
        }
    });

    const refreshPrivate = () => {

        const key = window.wireguard.generateKeypair()
        setPrivateKey(key.privateKey)
        setPreSharedKey(key.presharedKey)
    }

    const handlePrivateKeyChange = (event) => {
        setPrivateKey(event.target.value);
    };

    const handlePeerNameChange = (event) => {
        setPeerName(event.target.value);
    };

    const handlePeerAddressChange = (event) => {
        setPeerAddress(event.target.value);
    };

    const handlePeerDNSChange = (event) => {
        setPeerDNS(event.target.value);
    };
    const handlePeerEndpointChange = (event) => {
        setPeerEndpoint(event.target.value);
    };


    const handlePeerMTUChange = (event) => {
        setPeerMTU(event.target.value);
    };

    const handlePeerKeepAliveChange = (event) => {
        setPeerKeepAlive(event.target.value);
    };

    const handleChangePreSharedKeyStatus = (event) => {
        setUsePreSharedKey(event.target.checked)
    }

    const toggleAvailableModal = () => {
        setAvailableState(!availableState)
    }

    const changeAddress = (ips) => {
        const AIPS = ips.split(",")

        let avipsSUCCESS = []

        for(const aip of AIPS){
            let aipTMP = aip.trim()
            if(aipTMP !== "" && aipTMP !== " "){
                avipsSUCCESS.push(aipTMP)
            }
        }

        setPeerAddress(avipsSUCCESS.join(", "));
    }

    return (
        <React.Fragment>
            <AvailableIPsModal modalState={availableState} availableIPs={availableIPs} toggle={toggleAvailableModal} peerAddress={peerAddress} changeAddress={changeAddress} />

            <Modal
                backdrop={"static"}
                size="lg"
                isOpen={modalState}
                toggle={props.toggle}
            >
                <ModalHeader toggle={props.toggle}>
                    {props.t("Add New Peer")}
                </ModalHeader>

                <ModalBody>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                    }} action="#">

                        <div className={"mb-3"}>
                            <Label htmlFor={"private_key"} className={"form-label"}>{props.t("Private Key")}<code>*</code></Label>
                            <div className="input-group">
                                <Input
                                    aria-describedby="private_key"
                                    name={"private_key"}
                                    className={"form-control"}
                                    type={"text"}
                                    onChange={handlePrivateKeyChange}
                                    value={privateKey}
                                    placeholder={props.t("Please Enter or Regenerate Private Key")}
                                    invalid={
                                        validation.touched.private_key && validation.errors.private_key ? true : false
                                    }
                                />
                                {validation.touched.private_key && validation.errors.private_key ? (
                                    <FormFeedback type="invalid">{validation.errors.private_key}</FormFeedback>
                                ) : null}
                                <button className="btn btn-danger" type="button" id="private_key" onClick={refreshPrivate}>
                                    <i className="mdi mdi-replay"></i>
                                </button>
                            </div>

                        </div>
                        <div className={"mb-3"}>
                            <Label htmlFor={"public_key"} className={"form-label"}>{props.t("Public Key")}<code>*</code></Label>
                            <div className="input-group">
                                <Input
                                    aria-describedby="public_key"
                                    name={"public_key"}
                                    className={"form-control"}
                                    type={"text"}
                                    readOnly={true}
                                    onChange={validation.handleChange}
                                    value={publicKey}
                                    placeholder={props.t("Please Enter Public Key")}
                                    invalid={
                                        validation.touched.public_key && validation.errors.public_key ? true : false
                                    }
                                />
                                {validation.touched.public_key && validation.errors.public_key ? (
                                    <FormFeedback type="invalid">{validation.errors.public_key}</FormFeedback>
                                ) : null}
                            </div>
                        </div>

                        <Row className={"mb-3"}>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_name"} className={"form-label"}>{props.t("Name")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_name"
                                            name={"peer_name"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handlePeerNameChange}
                                            value={peerName}
                                            placeholder={props.t("Please Enter Name")}
                                            invalid={
                                                validation.touched.peer_name && validation.errors.peer_name ? true : false
                                            }
                                        />
                                        {validation.touched.peer_name && validation.errors.peer_name ? (
                                            <FormFeedback type="invalid">{validation.errors.peer_name}</FormFeedback>
                                        ) : null}
                                    </div>
                                </div>
                            </Col>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_address"} className={"form-label"}>{props.t("Address")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_address"
                                            name={"peer_address"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handlePeerAddressChange}
                                            value={peerAddress}
                                            placeholder={props.t("Please Enter Address")}
                                            invalid={
                                                validation.touched.peer_address && validation.errors.peer_address ? true : false
                                            }
                                        />
                                        {validation.touched.peer_address && validation.errors.peer_address ? (
                                            <FormFeedback type="invalid">{validation.errors.peer_address}</FormFeedback>
                                        ) : null}
                                        <button className="btn btn-primary non-bulk" type="button" id="peer_address" onClick={toggleAvailableModal}>
                                            <i className="bx bx-search-alt-2"></i>
                                        </button>
                                    </div>

                                </div>
                            </Col>
                        </Row>

                        <Row className={"mb-3"}>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_dns"} className={"form-label"}>{props.t("DNS")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_dns"
                                            name={"peer_dns"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handlePeerDNSChange}
                                            value={peerDNS}
                                            placeholder={props.t("Please Enter DNS")}
                                            invalid={
                                                validation.touched.peer_dns && validation.errors.peer_dns ? true : false
                                            }
                                        />
                                        {validation.touched.peer_dns && validation.errors.peer_dns ? (
                                            <FormFeedback type="invalid">{validation.errors.peer_dns}</FormFeedback>
                                        ) : null}
                                    </div>
                                </div>
                            </Col>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_endpoint"} className={"form-label"}>{props.t("Endpoint Allowed IPs")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_endpoint"
                                            name={"peer_endpoint"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handlePeerEndpointChange}
                                            value={peerEndpoint}
                                            placeholder={props.t("Please Enter Endpoint Allowed IPs")}
                                            invalid={
                                                validation.touched.peer_endpoint && validation.errors.peer_endpoint ? true : false
                                            }
                                        />
                                        {validation.touched.peer_endpoint && validation.errors.peer_endpoint ? (
                                            <FormFeedback type="invalid">{validation.errors.peer_endpoint}</FormFeedback>
                                        ) : null}
                                    </div>

                                </div>
                            </Col>
                        </Row>

                        <Row className={"mb-3"}>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_mtu"} className={"form-label"}>{props.t("MTU")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_mtu"
                                            name={"peer_mtu"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handlePeerMTUChange}
                                            value={peerMTU}
                                            placeholder={props.t("Please Enter MTU")}
                                            invalid={
                                                validation.touched.peer_mtu && validation.errors.peer_mtu ? true : false
                                            }
                                        />
                                        {validation.touched.peer_mtu && validation.errors.peer_mtu ? (
                                            <FormFeedback type="invalid">{validation.errors.peer_mtu}</FormFeedback>
                                        ) : null}
                                    </div>
                                </div>
                            </Col>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_keepalive"} className={"form-label"}>{props.t("Persistent keepalive")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_keepalive"
                                            name={"peer_keepalive"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handlePeerKeepAliveChange}
                                            value={peerKeepAlive}
                                            placeholder={props.t("Please Enter Persistent keepalive")}
                                            invalid={
                                                validation.touched.peer_keepalive && validation.errors.peer_keepalive ? true : false
                                            }
                                        />
                                        {validation.touched.peer_keepalive && validation.errors.peer_keepalive ? (
                                            <FormFeedback type="invalid">{validation.errors.peer_keepalive}</FormFeedback>
                                        ) : null}
                                    </div>

                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg={1} md={1} sm={1}>
                                <div className="form-check form-switch form-switch-custom form-switch-warning mb-2 mb-md-0">
                                    <Input className="form-check-input" type="checkbox" role="switch" name={"preshared_key"} id="preshared_key" onChange={handleChangePreSharedKeyStatus} defaultChecked={usePreSharedKey}/>
                                </div>
                            </Col>
                            <Col lg={11} md={11} sm={11}>
                                <Label className="form-check-label" htmlFor="preshared_key">{props.t("Use Pre-shared Key")}</Label>
                            </Col>
                        </Row>

                        {/*<Row className={"mb-3"}>*/}
                        {/*    <Col xl={12} md={12}><hr /></Col>*/}
                        {/*</Row>*/}

                    </Form>
                </ModalBody>
                <ModalFooter>
                    <div className="mt-4">
                        <div className="hstack gap-2 justify-content-center">
                            <Link to="#" className="btn btn-link link-dark fw-medium"
                                  onClick={() => props.toggle()}><i
                                className="ri-close-line me-1 align-middle"></i> {props.t("Cancel")}</Link>
                            <Button onClick={() => {validation.handleSubmit();}} className="btn btn-prymary">{props.t("Add")}</Button>
                        </div>
                    </div>
                </ModalFooter>

            </Modal>
        </React.Fragment>
    );
}

AddPeerModal.propTypes = {
    t: PropTypes.any,
    modalState: PropTypes.bool,
    toggle: PropTypes.func,
    interface_name: PropTypes.string
};

export default withTranslation()(AddPeerModal);
