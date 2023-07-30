import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {
    Alert,
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
import {fetchAvailableIPs, updatePeerSettings} from "../../../store/management/config/actions";
import {Link} from "react-router-dom";
import AvailableIPsModal from "./AvailableIPsModal";

const EditPeerModal = (props) => {
    const dispatch = useDispatch()

    const {availableIPsRes, upError} = useSelector(state => ({
        availableIPsRes: state.Config.availableIPs,
        upError: state.Config.upError,
    }));

    const [passwordShow, setPasswordShow] = useState(false);
    const [passwordPreShow, setPasswordPreShow] = useState(false);

    const [privateKey, setPrivateKey] = useState("")
    const [publicKey, setPublicKey] = useState("")
    const [presharedKey, setPresharedKey] = useState("")
    const [peerName, setPeerName] = useState("")
    const [availableIPs, setAvailableIPs] = useState([])
    const [availableState, setAvailableState] = useState(false)
    const [peerAddress, setPeerAddress] = useState("")
    const [peerDNS, setPeerDNS] = useState("")
    const [peerEndpoint, setPeerEndpoint] = useState("")
    const [peerMTU, setPeerMTU] = useState("")
    const [peerKeepalive, setPeerKeepalive] = useState("")

    useEffect(()=>{
        if(props.show){
            let allowed_ips = props.peer.allowed_ip
            allowed_ips = allowed_ips.replace(/\s+/g, '')
            const allowed_ipsArr = allowed_ips.split(",")

            let AIPS = []

            for(const aip of allowed_ipsArr){
                const AIP = aip.split("/")
                AIPS.push(AIP[0])
            }

            allowed_ips = AIPS.join(", ")
            setPeerAddress(allowed_ips)
            setPrivateKey(props.peer.private_key)
            setPublicKey(window.wireguard.generatePublicKey(props.peer.private_key))
            setPresharedKey(props.peer.preshared_key)
            setPeerName(props.peer.name)
            setPeerDNS(props.peer.dns)
            setPeerEndpoint(props.peer.endpoint_allowed_ip)
            setPeerMTU(props.peer.mtu)
            setPeerKeepalive(props.peer.keepalive)


            dispatch(fetchAvailableIPs({name: props.interface_name}))
        }else{
            setPeerAddress("")
            setPrivateKey("")
            setPublicKey("")
            setPresharedKey("")
            setPeerName("")
            setPeerDNS("")
            setPeerEndpoint("")
            setPeerMTU("")
            setPeerKeepalive("")
        }
    },[props.show])

    useEffect(()=>{
        if(availableIPsRes !== availableIPs){

            let allowed_ips = props.peer.allowed_ip
            allowed_ips = allowed_ips.replace(/\s+/g, '')
            const allowed_ipsArr = allowed_ips.split(",")

            let AIPS = []

            for(const aip of allowed_ipsArr){
                const AIP = aip.split("/")
                AIPS.push(AIP[0])
            }


            setAvailableIPs([...AIPS,...availableIPsRes])
            // if(availableIPsRes.length > 0){
            //     setPeerAddress(availableIPsRes[0])
            // }

        }
    },[availableIPsRes])



    const validation = useFormik({
        enableReinitialize: true,

        initialValues: {
            private_key: privateKey,
            preshared_key: presharedKey,
            peer_name: peerName,
            peer_address: peerAddress,
            peer_dns: peerDNS,
            peer_endpoint: peerEndpoint,
            peer_mtu: peerMTU,
            peer_keepalive: peerKeepalive,

        },
        validationSchema: Yup.object({
            //private_key: Yup.string().required(props.t("Please Enter Private Key")),
            peer_name: Yup.string().required(props.t("Please Enter Name")),
            peer_address: Yup.string().required(props.t("Please Enter Address")),
            peer_dns: Yup.string().required(props.t("Please Enter DNS")),
            peer_endpoint: Yup.string().required(props.t("Please Enter Endpoint Allowed IPs")),
            peer_mtu: Yup.string().required(props.t("Please Enter MTU")),
            peer_keepalive: Yup.string().required(props.t("Please Enter Persistent keepalive")),
        }),
        onSubmit: (values) => {

            let val = {interface_name: props.interface_name, public_key:publicKey, id: props.peer.id, ...values}

            dispatch(updatePeerSettings(val))

            props.toggle()
        }
    });

    useEffect(()=>{
        if(privateKey && privateKey !== ""){
            setPublicKey(window.wireguard.generatePublicKey(privateKey))
        }else{
            setPublicKey("")
        }

    },[privateKey])

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

    const handleChangePreshared = (event) => {
        setPresharedKey(event.target.value);
        validation.handleChange(event)
    }

    const handleChangeName = (event) => {
        setPeerName(event.target.value);
        validation.handleChange(event)
    }

    const handleChangeAddress = (event) => {
        setPeerAddress(event.target.value);
        validation.handleChange(event)
    }

    const handleChangeDNS = (event) => {
        setPeerDNS(event.target.value);
        validation.handleChange(event)
    }

    const handleChangeEndpoint = (event) => {
        setPeerEndpoint(event.target.value);
        validation.handleChange(event)
    }

    const handleChangeMtu = (event) => {
        setPeerMTU(event.target.value);
        validation.handleChange(event)
    }

    const handleChangeKeepalive = (event) => {
        setPeerKeepalive(event.target.value);
        validation.handleChange(event)
    }

    return (
        <React.Fragment>

            <AvailableIPsModal modalState={availableState} availableIPs={availableIPs} toggle={toggleAvailableModal} peerAddress={peerAddress} changeAddress={changeAddress} />

            <Modal
                backdrop={"static"}
                size="lg"
                isOpen={props.show}
                toggle={props.toggle}
            >
                <ModalHeader toggle={props.toggle}>
                    {props.t("Edit Peer")}
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                    }} action="#">
                        <div className="mb-3">
                            <Label htmlFor={"private_key"} className={"form-label"}>{props.t("Private Key")}<code>*</code></Label>
                            <div className="position-relative auth-pass-inputgroup mb-3">
                                <Input
                                    name="private_key"
                                    value={privateKey}
                                    type={passwordShow ? "text" : "password"}
                                    className="form-control pe-5"
                                    placeholder={props.t("Please Enter Private Key")}
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                        validation.touched.private_key && validation.errors.private_key ? true : false
                                    }
                                />
                                {validation.touched.private_key && validation.errors.private_key ? (
                                    <FormFeedback type="invalid">{validation.errors.private_key}</FormFeedback>
                                ) : null}
                                <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="private_key-addon" onClick={() => setPasswordShow(!passwordShow)}><i className="ri-eye-fill align-middle"></i></button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <Label htmlFor={"preshared_key"} className={"form-label"}>{props.t("Pre-Shared Key")}</Label>
                            <div className="position-relative auth-pass-inputgroup mb-3">
                                <Input
                                    name="preshared_key"
                                    value={presharedKey}
                                    type={passwordPreShow ? "text" : "password"}
                                    className="form-control pe-5"
                                    placeholder={props.t("Please Enter Pre-Shared Key")}
                                    onChange={handleChangePreshared}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                        validation.touched.preshared_key && validation.errors.preshared_key ? true : false
                                    }
                                />
                                {validation.touched.preshared_key && validation.errors.preshared_key ? (
                                    <FormFeedback type="invalid">{validation.errors.preshared_key}</FormFeedback>
                                ) : null}
                                <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="preshared_key-addon" onClick={() => setPasswordPreShow(!passwordPreShow)}><i className="ri-eye-fill align-middle"></i></button>
                            </div>
                        </div>

                        {upError&&upError?(
                            <Alert color="danger"> {upError} </Alert>
                        ):("")}

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
                                            onChange={handleChangeName}
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
                                            onChange={handleChangeAddress}
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
                                            onChange={handleChangeDNS}
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
                                            onChange={handleChangeEndpoint}
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

                        <Row>
                            <Col lg={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"peer_mtu"} className={"form-label"}>{props.t("MTU")}<code>*</code></Label>
                                    <div className="input-group">
                                        <Input
                                            aria-describedby="peer_mtu"
                                            name={"peer_mtu"}
                                            className={"form-control"}
                                            type={"text"}
                                            onChange={handleChangeMtu}
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
                                            onChange={handleChangeKeepalive}
                                            value={peerKeepalive}
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
                            <Button onClick={() => {validation.handleSubmit();}} className="btn btn-prymary">{props.t("Save")}</Button>
                        </div>
                    </div>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}

EditPeerModal.propTypes = {
    t: PropTypes.any,
    peer: PropTypes.object,
    toggle: PropTypes.func,
    show: PropTypes.bool,
    interface_name: PropTypes.string
};

export default withTranslation()(EditPeerModal);
