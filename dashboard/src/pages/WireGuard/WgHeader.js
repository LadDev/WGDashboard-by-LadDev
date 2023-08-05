import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Card, CardBody, Col, Input, Row, UncontrolledTooltip} from "reactstrap";
import {useParams} from "react-router-dom";
import {switchConfigStatus} from "../../store/management/config/actions";
import {useDispatch} from "react-redux";
import CountUp from "react-countup";

const WgHeader = (props) => {
    const dispatch = useDispatch()

    const {name: confName} = useParams();

    const [confData,setConfData] = useState({address: "", port: "", public_key: "", status: "", total_data: 0, total_sent: 0, total_receive: 0, runned_clients: 0})
    //const isRunningRef = useRef(null);
    const [running, setRunning] = useState(false)

    useEffect(()=>{
        if(props.headerData && props.headerData !== confData){
            setConfData(props.headerData)
        }

    }, [props.headerData])

    // const convertToGB = (usage) => {
    //     if(usage && !isNaN(Number(usage))){
    //
    //         let usageTMP = Number(usage)
    //
    //         if(usageTMP/(1024**3) > 1){
    //             return (usageTMP/(1024**3)).toFixed(4)+" GB"
    //         }else if(usageTMP/(1024**2) > 1){
    //             return (usageTMP/(1024**2)).toFixed(2)+" MB"
    //         }else{
    //             return (usageTMP/(1024**1)).toFixed(2)+" KB"
    //         }
    //         //return Number(Number(usage)/(1024**3)).toFixed(4)
    //     }else{
    //         return 0
    //     }
    // }

    const convertToGBWidget = (usage) => {
        if(usage && !isNaN(Number(usage))){

            let usageTMP = Number(usage)

            if(usageTMP/(1024**3) > 1){
                const data = (usageTMP/(1024**3))
                return (
                    <CountUp start={0} prefix={""} suffix={" GB"} separator={"."} end={data} decimals={4} duration={1}/>
                )
            }else if(usageTMP/(1024**2) > 1){
                const data = (usageTMP/(1024**2))
                return (
                    <CountUp start={0} prefix={""} suffix={" MB"} separator={"."} end={data} decimals={2} duration={1}/>
                )
            }else{
                const data = (usageTMP/(1024**1))
                return (
                    <CountUp start={0} prefix={""} suffix={" KB"} separator={"."} end={data} decimals={2} duration={1}/>
                )
            }
            //return Number(Number(usage)/(1024**3)).toFixed(4)
        }else{
            return 0
        }
    }

    useEffect(()=>{
        setRunning(confData.status === "running")
    },[confData])



    const changeRunningStateEvent = (event) => {
        setRunning(event.target.checked)
        dispatch(switchConfigStatus({name: confName, status: event.target.checked}))
    }




    return (
        <React.Fragment>

            <Col xl={12}>
                <Card className="crm-widget">
                    <CardBody className="p-0">
                        <Row className="row-cols-md-3 row-cols-1">

                            <Col className={"col-lg border-end"}>
                                <div className="mt-3 mt-md-0 py-4 px-3">
                                    <h5 className="text-muted text-uppercase fs-13">{props.t("CONFIGURATION")}
                                        {props.headerData&&props.headerData.status==="running"?(
                                            <>
                                                <i className={"fs-18 float-end align-middle dot dot-running"} id={"config_status_header"}></i>
                                                <UncontrolledTooltip target={`config_status_header`} placement={"top"} >{props.t("running")}</UncontrolledTooltip>
                                            </>
                                        ):(
                                            <>
                                                <i className={"fs-18 float-end align-middle dot dot-stopped"} id={"config_status_header"}></i>
                                                <UncontrolledTooltip target={`config_status_header`} placement={"top"} >{props.t("stopped")}</UncontrolledTooltip>
                                            </>
                                        )
                                        }
                                    </h5>

                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <i className={"display-6 text-muted bx bx-podcast"}></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h2 className="mb-0">
                                                    <span className="counter-value">
                                                        <h1 className="mb-0">
                                                            <samp id="conf_name">{confName}</samp>
                                                            <div className="form-check form-switch form-switch-success float-end">
                                                                <Input className="form-check-input big-check-input float-end" type="checkbox" role="switch" name={"stop"} onChange={changeRunningStateEvent} checked={running} />
                                                            </div>
                                                        </h1>
                                                    </span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col className={"col-lg border-end"}>
                                <div className="mt-3 mt-md-0 py-4 px-3">
                                    <h5 className="text-muted text-uppercase fs-13">{props.t("CONNECTED PEERS")}</h5>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <i className={"display-6 text-muted bx bx-network-chart"}></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h2 className="mb-0"><span className="counter-value">
                                                    <CountUp
                                                        start={0}
                                                        prefix={""}
                                                        suffix={""}
                                                        separator={"."}
                                                        end={confData.runned_clients}
                                                        decimals={0}
                                                        duration={1}
                                                    />
                                                </span></h2>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col className={"col-lg"}>
                                <div className="mt-3 mt-md-0 py-4 px-3">
                                    <h5 className="text-muted text-uppercase fs-13">{props.t("PUBLIC KEY")}</h5>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <h6 className=""><samp className="key" id="conf_public_key">{confData.public_key}</samp></h6>
                                        </div>
                                    </div>
                                    <Row>
                                        <Col>
                                            <h5 className="text-muted text-uppercase fs-13">{props.t("ADDRESS")}</h5>
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <h6 style={{textTransform: "uppercase"}} className=""><samp id="conf_address">{confData.address}</samp></h6>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col>
                                            <h5 className="text-muted text-uppercase fs-13">{props.t("LISTEN PORT")}</h5>
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <h6 style={{textTransform: "uppercase"}} className=""><samp id="conf_address">{confData.port}</samp></h6>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>


                        </Row>
                    </CardBody>
                </Card>
            </Col>

            <Col xl={12}>
                <Card className="crm-widget">
                    <CardBody className="p-0">
                        <Row className="row-cols-md-3 row-cols-1">

                            <Col className={"border-end"}>
                                <div className="mt-3 mt-md-0 py-4 px-3">
                                    <h5 className="text-muted text-uppercase fs-13">
                                        {props.t("TOTAL DATA USAGE")}
                                        <i className={"fs-18 float-end align-middle mdi mdi-traffic-light-outline"}></i>
                                    </h5>

                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <i className={"display-6 text-muted mdi mdi-call-missed"}></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h2 className="mb-0">
                                                    <span className="counter-value">
                                                        {convertToGBWidget(confData.total_data)}
                                                    </span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col className={"border-end"}>
                                <div className="mt-3 mt-md-0 py-4 px-3">
                                    <h5 className="text-muted text-uppercase fs-13">
                                        {props.t("TOTAL RECEIVED")}
                                        <i className={"fs-18 float-end align-middle mdi mdi-traffic-light-outline"}></i>
                                    </h5>

                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <i className={"display-6 text-muted mdi mdi-call-received"}></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h2 className="mb-0">
                                                    <span className="counter-value">
                                                        {convertToGBWidget(confData.total_receive)}
                                                    </span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col>
                                <div className="mt-3 mt-md-0 py-4 px-3">
                                    <h5 className="text-muted text-uppercase fs-13">
                                        {props.t("TOTAL SENT")}
                                        <i className={"fs-18 float-end align-middle mdi mdi-traffic-light-outline"}></i>
                                    </h5>

                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <i className={"display-6 text-muted mdi mdi-call-made"}></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h2 className="mb-0">
                                                    <span className="counter-value">
                                                        {convertToGBWidget(confData.total_sent)}
                                                    </span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>


            {/*<Row>*/}
            {/*   <Col>*/}
            {/*       <small className="text-muted"><strong>{props.t("CONFIGURATION")}</strong></small>*/}
            {/*       <h1 className="mb-3"><samp id="conf_name">{confName}</samp></h1>*/}
            {/*   </Col>*/}
            {/*   <Col>*/}
            {/*       <small className="text-muted"><strong>{props.t("TOGGLE")}</strong></small>*/}
            {/*       <div className="form-check form-switch form-switch-success mb-3">*/}
            {/*           <Input className="form-check-input big-check-input" type="checkbox" role="switch" name={"stop"} onChange={changeRunningStateEvent} checked={running} />*/}
            {/*       </div>*/}
            {/*   </Col>*/}
            {/*</Row>*/}

            {/*<Row className={"mb-3"}>*/}
            {/*    <Col>*/}
            {/*        <small className="text-muted">*/}
            {/*            <strong>{props.t("STATUS")}</strong>*/}
            {/*        </small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} id="conf_status" className="">*/}
            {/*            {props.headerData&&props.headerData.status==="running"?(*/}
            {/*                <>*/}
            {/*                    {props.t("running")}&nbsp;&nbsp;*/}
            {/*                    <span className="dot dot-running" title=""></span>*/}
            {/*                </>*/}
            {/*            ):(*/}
            {/*                <>*/}
            {/*                    {props.t("stopped")}&nbsp;&nbsp;*/}
            {/*                    <span className="dot dot-stopped" title=""></span>*/}
            {/*                </>*/}
            {/*            )}*/}
            {/*        </h6>*/}
            {/*    </Col>*/}
            {/*    <Col>*/}
            {/*        <small className="text-muted">*/}
            {/*            <strong>{props.t("CONNECTED PEERS")}</strong>*/}
            {/*        </small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} id="conf_connected_peers" className="">{confData.runned_clients}</h6>*/}
            {/*    </Col>*/}
            {/*    <div className="col-sm">*/}
            {/*        <small className="text-muted">*/}
            {/*            <strong>{props.t("TOTAL DATA USAGE")}</strong>*/}
            {/*        </small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} id="conf_total_data_usage" className="">{convertToGB(confData.total_data)}</h6>*/}
            {/*    </div>*/}
            {/*    <div className="col-sm">*/}
            {/*        <small className="text-muted">*/}
            {/*            <strong>{props.t("TOTAL RECEIVED")}</strong>*/}
            {/*        </small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} id="conf_total_data_usage" className="">{convertToGB(confData.total_receive)}</h6>*/}
            {/*    </div>*/}
            {/*    <div className="col-sm">*/}
            {/*        <small className="text-muted">*/}
            {/*            <strong>{props.t("TOTAL SENT")}</strong>*/}
            {/*        </small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} id="conf_total_data_usage" className="">{convertToGB(confData.total_sent)}</h6>*/}
            {/*    </div>*/}
            {/*</Row>*/}

            {/*<Row>*/}
            {/*    <div className="col-sm">*/}
            {/*        <small className="text-muted">*/}
            {/*            <strong>{props.t("PUBLIC KEY")}</strong>*/}
            {/*            <strong style={{opacity: "0", transition: "all 0.2s ease-in-out 0s", marginLeft: "auto !important"}} className="text-primary">CLICK TO COPY</strong>*/}
            {/*        </small>*/}
            {/*        <h6 className=""><samp className="key" id="conf_public_key">{confData.public_key}</samp></h6>*/}
            {/*    </div>*/}

            {/*    <div className="col-sm">*/}
            {/*        <small className="text-muted"><strong>{props.t("LISTEN PORT")}</strong></small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} className=""><samp id="conf_listen_port">{confData.port}</samp></h6>*/}
            {/*    </div>*/}

            {/*    <div className="col-sm">*/}
            {/*        <small className="text-muted"><strong>{props.t("ADDRESS")}</strong></small>*/}
            {/*        <h6 style={{textTransform: "uppercase"}} className=""><samp id="conf_address">{confData.address}</samp>*/}
            {/*        </h6>*/}
            {/*    </div>*/}
            {/*</Row>*/}

        </React.Fragment>
    )
}

WgHeader.propTypes = {
    t: PropTypes.any,
    headerData: PropTypes.object
};

export default withTranslation()(WgHeader);
