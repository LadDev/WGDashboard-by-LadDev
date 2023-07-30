import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Col, Input, Row} from "reactstrap";
import {useParams} from "react-router-dom";
import {switchConfigStatus} from "../../store/management/config/actions";
import {useDispatch} from "react-redux";

const WgHeader = (props) => {
    const dispatch = useDispatch()

    const {name: confName} = useParams();

    const [confData,setConfData] = useState({address: "", port: "", public_key: "", status: "", total_data: 0, total_sent: 0, total_receive: 0, runned_clients: 0})
    const isRunningRef = useRef(null);
    const [running, setRunning] = useState(false)

    useEffect(()=>{
        if(props.headerData && props.headerData !== confData){
            setConfData(props.headerData)
        }

    }, [props.headerData])

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

    useEffect(()=>{
        setRunning(confData.status === "running")
    },[confData])



    const changeRunningStateEvent = (event) => {
        setRunning(event.target.checked)
        dispatch(switchConfigStatus({name: confName, status: event.target.checked}))
    }




    return (
        <React.Fragment>
            <Row>
               <Col>
                   <small className="text-muted"><strong>{props.t("CONFIGURATION")}</strong></small>
                   <h1 className="mb-3"><samp id="conf_name">{confName}</samp></h1>
               </Col>
               <Col>
                   <small className="text-muted"><strong>{props.t("TOGGLE")}</strong></small>
                   <div className="form-check form-switch form-switch-success mb-3">
                       <Input className="form-check-input big-check-input" type="checkbox" role="switch" name={"stop"} onChange={changeRunningStateEvent} checked={running} />


                       {/*<Label className="form-check-label" for="SwitchCheck6">Switch Info</Label>*/}
                   </div>
               </Col>
            </Row>

            <Row className={"mb-3"}>
                <Col>
                    <small className="text-muted">
                        <strong>{props.t("STATUS")}</strong>
                    </small>
                    <h6 style={{textTransform: "uppercase"}} id="conf_status" className="">
                        {props.headerData&&props.headerData.status==="running"?(
                            <>
                                {props.t("running")}&nbsp;&nbsp;
                                <span className="dot dot-running" title=""></span>
                            </>
                        ):(
                            <>
                                {props.t("stopped")}&nbsp;&nbsp;
                                <span className="dot dot-stopped" title=""></span>
                            </>
                        )}
                    </h6>
                </Col>
                <Col>
                    <small className="text-muted">
                        <strong>{props.t("CONNECTED PEERS")}</strong>
                    </small>
                    <h6 style={{textTransform: "uppercase"}} id="conf_connected_peers" className="">{confData.runned_clients}</h6>
                </Col>
                <div className="col-sm">
                    <small className="text-muted">
                        <strong>{props.t("TOTAL DATA USAGE")}</strong>
                    </small>
                    <h6 style={{textTransform: "uppercase"}} id="conf_total_data_usage" className="">{convertToGB(confData.total_data)}</h6>
                </div>
                <div className="col-sm">
                    <small className="text-muted">
                        <strong>{props.t("TOTAL RECEIVED")}</strong>
                    </small>
                    <h6 style={{textTransform: "uppercase"}} id="conf_total_data_usage" className="">{convertToGB(confData.total_receive)}</h6>
                </div>
                <div className="col-sm">
                    <small className="text-muted">
                        <strong>{props.t("TOTAL SENT")}</strong>
                    </small>
                    <h6 style={{textTransform: "uppercase"}} id="conf_total_data_usage" className="">{convertToGB(confData.total_sent)}</h6>
                </div>
            </Row>

            <Row>
                <div className="col-sm">
                    <small className="text-muted">
                        <strong>{props.t("PUBLIC KEY")}</strong>
                        <strong style={{opacity: "0", transition: "all 0.2s ease-in-out 0s", marginLeft: "auto !important"}} className="text-primary">CLICK TO COPY</strong>
                    </small>
                    <h6 className=""><samp className="key" id="conf_public_key">{confData.public_key}</samp></h6>
                </div>

                <div className="col-sm">
                    <small className="text-muted"><strong>{props.t("LISTEN PORT")}</strong></small>
                    <h6 style={{textTransform: "uppercase"}} className=""><samp id="conf_listen_port">{confData.port}</samp></h6>
                </div>

                <div className="col-sm">
                    <small className="text-muted"><strong>{props.t("ADDRESS")}</strong></small>
                    <h6 style={{textTransform: "uppercase"}} className=""><samp id="conf_address">{confData.address}</samp>
                    </h6>
                </div>
            </Row>

        </React.Fragment>
    )
}

WgHeader.propTypes = {
    t: PropTypes.any,
    headerData: PropTypes.object
};

export default withTranslation()(WgHeader);
