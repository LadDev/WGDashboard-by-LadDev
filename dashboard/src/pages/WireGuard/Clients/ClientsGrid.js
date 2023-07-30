import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Card, CardBody, CardFooter, CardHeader, Col, Row, UncontrolledTooltip} from "reactstrap";
import {Link} from "react-router-dom";

const ClientsGrid = (props) => {

    return (
        <React.Fragment>
            <Row>
                {props.configData.peers.map((peer,key)=>(
                    <Col sm={6} lg={4} key={key}>
                        <Card className={"card-"+peer.status}>

                            <CardHeader>
                                <div className="modal-header">
                                    <h5 className="modal-title">{peer.name}</h5>
                                    <span className={peer.status&&peer.status==="online"?"dot dot-running":"dot dot-stopped"} title="" data-original-title="Peer Connected"></span>
                                </div>
                                <div className={"w-100"}></div>
                                <div className="col-12 peer_data_group">
                                    <p className="text-info mb-0">
                                        <small><i className="mdi mdi-arrow-bottom-right-thin"></i> {props.convertToGB(peer.total_receive)}</small>
                                    </p>
                                    <p className="text-success mb-0">
                                        <small><i className="mdi mdi-arrow-top-right-thin"></i> {props.convertToGB(peer.total_sent)}</small>
                                    </p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <div className="col-sm">
                                        <small className="text-muted" style={{display: "flex"}}>
                                            <strong>{props.t("PEER")}</strong>
                                        </small>
                                        <h6><samp className="ml-auto key" id={`click_to_copy_${peer.id}`} onClick={()=>{props.handleCopyClick(peer.public_key)}}>{peer.public_key}</samp></h6>
                                        <UncontrolledTooltip target={`click_to_copy_${peer.id}`} placement={"top"} >{props.t("CLICK TO COPY")}</UncontrolledTooltip>
                                    </div>
                                </Row>
                                <Row>
                                    <Col sm={6}>
                                        <small className="text-muted" style={{display: "flex"}}>
                                            <strong>{props.t("ALLOWED IP")}</strong>
                                            {/*<strong style="opacity: 0; transition: all 0.2s ease-in-out 0s; margin-left: auto !important;" className="text-primary">CLICK TO COPY</strong>*/}
                                        </small>
                                        <h6><samp className="ml-auto key">{peer.allowed_ip}</samp></h6>
                                    </Col>
                                    <Col sm={6}>
                                        <small className="text-muted" style={{display: "flex"}}>
                                            <strong>{props.t("LATEST HANDSHAKE")}</strong>
                                            {/*<strong style="opacity: 0; transition: all 0.2s ease-in-out 0s; margin-left: auto !important;" className="text-primary">CLICK TO COPY</strong>*/}
                                        </small>
                                        <h6><samp className="ml-auto key">{props.latestHandshake(peer.latest_handshake)}</samp></h6>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={6}>
                                        <small className="text-muted" style={{display: "flex"}}>
                                            <strong>{props.t("END POINT")}</strong>
                                            {/*<strong style="opacity: 0; transition: all 0.2s ease-in-out 0s; margin-left: auto !important;" className="text-primary">CLICK TO COPY</strong>*/}
                                        </small>
                                        <h6><samp className="ml-auto key">{peer.endpoint && peer.endpoint?peer.endpoint:"N/A"}</samp></h6>
                                    </Col>
                                </Row>
                            </CardBody>
                            <CardFooter>


                                <div className={"d-flex justify-content-between"}>
                                    <div className={"left-block"}>
                                        <div className="button-group" style={{display:"flex"}}>

                                            {peer.enabled && peer.enabled === true?(
                                                <>
                                                    <button type="button" className="btn btn-outline-primary btn-setting-peer btn-control" id={`peer_settings_${key}`} onClick={()=>{props.toggleEditModal(peer)}} >
                                                        <i className="ri-settings-4-fill"></i>
                                                    </button>
                                                    <UncontrolledTooltip target={`peer_settings_${key}`} placement={"top"} >{props.t("Peer Settings")}</UncontrolledTooltip>

                                                    <button type="button" className="btn btn-outline-info btn-data-usage-peer btn-control" id={`peer_chart_${key}`} onClick={()=>{props.toggleDUModal(peer.public_key,peer.name)}} >
                                                        <i className="ri-bar-chart-2-line"></i>
                                                    </button>
                                                    <UncontrolledTooltip target={`peer_chart_${key}`} placement={"top"} >{props.t("Data Usage")}</UncontrolledTooltip>

                                                    <button type="button" className="btn btn-outline-danger btn-delete-peer btn-control" id={`peer_delete_${key}`} onClick={()=>{props.deletePeerData(peer)}} >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                    <UncontrolledTooltip target={`peer_delete_${key}`} placement={"top"} >{props.t("Delete Peer")}</UncontrolledTooltip>

                                                    <button type="button" className="btn btn-outline-success btn-lock-peer btn-control" id={`peer_switch_${key}`} onClick={()=>{props.switchPeerState(peer)}}>
                                                        <i className="ri-lock-unlock-line"></i>
                                                    </button>
                                                    <UncontrolledTooltip target={`peer_switch_${key}`} placement={"top"} >{ peer.enabled?(props.t("Peer enabled. Click to disable peer.")):(props.t("Peer disabled. Click to enable peer.")) }</UncontrolledTooltip>
                                                </>
                                            ):(
                                                <>
                                                    <button type="button" className="btn btn-outline-danger btn-lock-peer btn-control" onClick={()=>{props.switchPeerState(peer)}}>
                                                        <i className="ri-lock-2-line"></i>
                                                    </button>
                                                    <small className="text-muted" style={{marginLeft: "auto"}}>{props.t("Peer Disabled")}</small>
                                                </>
                                            )}

                                        </div>
                                    </div>
                                    <div className={"right-block"}>
                                        <div className="hstack gap-2 justify-content-center">
                                            <button type="button" className="btn btn-outline-success btn-qrcode-peer btn-control"
                                                    onClick={()=>{props.changeQrCodeData(peer)}}>
                                                <i className={"ri-qr-code-line"}></i>
                                            </button>

                                            <Link to={"#"} onClick={()=>{props.saveToFile(peer)}} className="btn btn-outline-info btn-download-peer btn-control">
                                                <i className="ri-download-cloud-2-line"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </CardFooter>
                        </Card>
                    </Col>
                ))}

            </Row>
        </React.Fragment>
    );
}

ClientsGrid.propTypes = {
    t: PropTypes.any,
    configData: PropTypes.object,
    interface_name: PropTypes.string,
    convertToGB: PropTypes.func,
    latestHandshake: PropTypes.func,
    changeQrCodeData: PropTypes.func,
    saveToFile: PropTypes.func,
    deletePeerData: PropTypes.func,
    toggleDUModal: PropTypes.func,
    switchPeerState: PropTypes.func,
    toggleEditModal: PropTypes.func,
    handleCopyClick: PropTypes.func
};

export default withTranslation()(ClientsGrid);
