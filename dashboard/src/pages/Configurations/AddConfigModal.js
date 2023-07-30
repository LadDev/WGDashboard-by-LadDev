import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {
    Accordion, AccordionItem,
    Alert,
    Button,
    Col, Collapse,
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
import {addNewConfig, checkInterfaceName, checkIpAddress, checkPort} from "../../store/management/config/actions";
import * as WireGuard from "./WireGuard";
import classnames from "classnames";

const AddConfigModal = (props) => {
    const dispatch = useDispatch()

    const {ipAmountRes, portAvailableRes, confRes, nameAvailableRes} = useSelector(state => ({
        ipAmountRes: state.Config.ip_amount,
        portAvailableRes: state.Config.port_check,
        confRes: state.Config.conf,
        nameAvailableRes: state.Config.nameAvailable,
    }));

    const [modalState, setModalState] = useState(false)
    const [ipAmount, setIpAmount] = useState(0)
    const [portAvailable, setPortAvailable] = useState(false)
    const [conf, setConf] = useState(null)
    const [nameAvailable, setNameAvailable] = useState(true)
    const [interfaceName, setName] = useState("")
    const [port, setPort] = useState(51820)
    const [address, setAddress] = useState("")

    useEffect(()=>{
        if(modalState !== props.modalState){
            setModalState(props.modalState)
        }
    },[props.modalState])

    useEffect(()=>{
        if(ipAmount !== ipAmountRes){
            setIpAmount(ipAmountRes)
        }
    },[ipAmountRes])

    useEffect(()=>{
        if(portAvailable !== portAvailableRes){
            setPortAvailable(portAvailableRes)
        }
    },[portAvailableRes])

    useEffect(()=>{
        if(conf !== confRes){
            setConf(confRes)
        }
    },[confRes])

    useEffect(()=>{
        if(nameAvailable !== nameAvailableRes){
            setNameAvailable(nameAvailableRes)
        }
    },[nameAvailableRes])

    const [privateKey, setPrivateKey] = useState(window.wireguard.generateKeypair().privateKey)

    const validation = useFormik({
        enableReinitialize: true,

        initialValues: {
            private_key: privateKey || "",
            config_name: interfaceName || "",
            listen_port: port || 51820,
            address: address || "",

            preup: "",
            predown: "",
            postup: "",
            postdown: "",
        },
        validationSchema: Yup.object({
            private_key: Yup.string().required(props.t("Please Enter Private Key")),
            listen_port: Yup.string().required(props.t("Please Enter Listen Port")),
            config_name: Yup.string().required(props.t("Please Enter Configuration Name")),
            address: Yup.string().required(props.t("Please Enter Address")),
        }),
        onSubmit: (values) => {
            if(portAvailable && nameAvailable){
                const config = {...values}
                dispatch(addNewConfig(config))
                setPrivateKey("")
                setAddress("")
                setPort(null)
                setName("")
                props.toggle()
            }
        }
    });

    const refreshPrivate = () => {
        setPrivateKey(window.wireguard.generateKeypair().privateKey)
    }

    const handlePrivateKeyChange = (event) => {
        setPrivateKey(event.target.value);
    };

    const handleAddressChange = (event) => {
        setAddress(event.target.value)
        dispatch(checkIpAddress(event.target.value))
        validation.handleChange(event)
    };

    const handlePortChange = (event) => {
        setPort(Number(event.target.value))
        dispatch(checkPort(event.target.value))
        validation.handleChange(event)
    };
    const handleNameChange = (event) => {
        setName(event.target.value)
        dispatch(checkInterfaceName(event.target.value))
        validation.handleChange(event)
    };

    const [col1, setcol1] = useState(false);

    const t_col1 = () => {
        setcol1(!col1);
    };

    return (
        <React.Fragment>
            <Modal
                backdrop={"static"}
                size="lg"
                isOpen={modalState}
                toggle={props.toggle}
            >
                <ModalHeader toggle={props.toggle}>
                    {props.t("Add New Configuration")}
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
                                    <i className="mdi mdi-refresh"></i>
                                </button>
                            </div>

                        </div>

                        <Row>
                            <Col xl={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"config_name"} className={"form-label"}>{props.t("Configuration Name")}<code>*</code></Label>
                                    <Input
                                        name={"config_name"}
                                        className={"form-control"}
                                        type={"text"}
                                        onChange={handleNameChange}
                                        placeholder={props.t("Please Enter Configuration Name")}
                                        invalid={
                                            validation.touched.config_name && validation.errors.config_name ? true : false
                                        }
                                    />
                                    {validation.touched.config_name && validation.errors.config_name ? (
                                        <FormFeedback type="invalid">{validation.errors.config_name}</FormFeedback>
                                    ) : null}

                                </div>
                            </Col>
                            <Col xl={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"listen_port"} className={"form-label"}>{props.t("Listen Port")}<code>*</code></Label>
                                    <Input
                                        name={"listen_port"}
                                        className={"form-control"}
                                        type={"number"}
                                        onChange={handlePortChange}
                                        placeholder={props.t("Please Enter Listen Port")}
                                        invalid={
                                            validation.touched.listen_port && validation.errors.listen_port ? true : false
                                        }
                                    />
                                    {validation.touched.listen_port && validation.errors.listen_port ? (
                                        <FormFeedback type="invalid">{validation.errors.listen_port}</FormFeedback>
                                    ) : null}

                                </div>
                            </Col>
                        </Row>

                        {!portAvailable && conf ? (<Alert color="danger"> {conf.port} {props.t("used by")} {conf.conf} </Alert>) : null}
                        {!nameAvailable ? (<Alert color="danger"> {interfaceName} {props.t(" already existed.")} </Alert>) : null}

                        <Row>
                            <Col xl={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label htmlFor={"address"} className={"form-label"}>{props.t("Address")}<code>*</code></Label>
                                    <Input
                                        name={"address"}
                                        className={"form-control"}
                                        type={"text"}
                                        onChange={handleAddressChange}
                                        placeholder={props.t("Ex: 192.168.0.1/24")}
                                        invalid={
                                            validation.touched.address && validation.errors.address ? true : false
                                        }
                                    />
                                    {validation.touched.address && validation.errors.address ? (
                                        <FormFeedback type="invalid">{validation.errors.address}</FormFeedback>
                                    ) : null}

                                </div>
                            </Col>
                            <Col xl={6} md={6}>
                                <div className={"mb-3"}>
                                    <Label className={"form-label"}>{props.t("# of available IPs")}</Label>
                                    <div className={"form-control"}>{ipAmount}</div>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Accordion id="default-accordion-example" open={""} toggle={t_col1}>
                                <AccordionItem>
                                    <h2 className="accordion-header" id="headingOne">
                                        <button
                                            className={classnames("accordion-button", { collapsed: !col1 })} type="button" onClick={t_col1} style={{ cursor: "pointer" }} >
                                            {props.t("Additional options")}
                                        </button>
                                    </h2>
                                    <Collapse isOpen={col1} className="accordion-collapse" id="collapseOne" >
                                        <div className="accordion-body">
                                            <Row>
                                                <div className={"mb-3"}>
                                                    <Label htmlFor={"preup"} className={"form-label"}>{props.t("PreUp")}</Label>
                                                    <Input
                                                        name={"preup"}
                                                        className={"form-control"}
                                                        type={"text"}
                                                        onChange={validation.handleChange}
                                                        invalid={
                                                            validation.touched.preup && validation.errors.preup ? true : false
                                                        }
                                                    />
                                                    {validation.touched.preup && validation.errors.preup ? (
                                                        <FormFeedback type="invalid">{validation.errors.preup}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Row>
                                            <Row>
                                                <div className={"mb-3"}>
                                                    <Label htmlFor={"predown"} className={"form-label"}>{props.t("PreDown")}</Label>
                                                    <Input
                                                        name={"predown"}
                                                        className={"form-control"}
                                                        type={"text"}
                                                        onChange={validation.handleChange}
                                                        invalid={
                                                            validation.touched.predown && validation.errors.predown ? true : false
                                                        }
                                                    />
                                                    {validation.touched.predown && validation.errors.predown ? (
                                                        <FormFeedback type="invalid">{validation.errors.predown}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Row>

                                            <Row>
                                                <div className={"mb-3"}>
                                                    <Label htmlFor={"postup"} className={"form-label"}>{props.t("PostUp")}</Label>
                                                    <Input
                                                        name={"postup"}
                                                        className={"form-control"}
                                                        type={"text"}
                                                        onChange={validation.handleChange}
                                                        invalid={
                                                            validation.touched.postup && validation.errors.postup ? true : false
                                                        }
                                                    />
                                                    {validation.touched.postup && validation.errors.postup ? (
                                                        <FormFeedback type="invalid">{validation.errors.postup}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Row>

                                            <Row>
                                                <div className={"mb-3"}>
                                                    <Label htmlFor={"postdown"} className={"form-label"}>{props.t("PostDown")}</Label>
                                                    <Input
                                                        name={"postdown"}
                                                        className={"form-control"}
                                                        type={"text"}
                                                        onChange={validation.handleChange}
                                                        invalid={
                                                            validation.touched.postdown && validation.errors.postdown ? true : false
                                                        }
                                                    />
                                                    {validation.touched.postdown && validation.errors.postdown ? (
                                                        <FormFeedback type="invalid">{validation.errors.postdown}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Row>
                                        </div>
                                    </Collapse>
                                </AccordionItem>

                            </Accordion>
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

AddConfigModal.propTypes = {
    t: PropTypes.any,
    modalState: PropTypes.bool,
    toggle: PropTypes.func
};

export default withTranslation()(AddConfigModal);
