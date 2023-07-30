import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip} from "reactstrap";

const ClientsList = (props) => {
    return (
        <React.Fragment>

            <div id="customerList">
                <div className="table-responsive table-card mt-3 mb-1">
                    <table className="table align-middle table-nowrap" id="customerTable">
                        <thead className="table-light">
                        <tr>
                            <th className="sort" data-sort="customer_name">{props.t("Name")}</th>
                            <th className="sort" data-sort="email">{props.t("Peer")}</th>
                            <th className="sort" data-sort="phone">{props.t("Allowed IP")}</th>
                            <th className="sort" data-sort="date">{props.t("LATEST HANDSHAKE")}</th>
                            <th className="sort" data-sort="date">{props.t("END POINT")}</th>
                            <th className="sort" data-sort="status">{props.t("Status")}</th>
                            <th className="sort" data-sort="total_sent">{props.t("TOTAL SENT")}</th>
                            <th className="sort" data-sort="total_receive">{props.t("TOTAL RECEIVE")}</th>
                            <th className="sort" data-sort="action">{props.t("Action")}</th>
                        </tr>
                        </thead>
                        <tbody className="list form-check-all">
                        {props.configData.peers.map((peer,key)=>(
                            <tr key={key}>
                                <td className="customer_name" >{peer.name}</td>
                                <td>
                                    <span id={`click_to_copy_${peer.id}`} style={{cursor: "pointer"}} onClick={()=>{props.handleCopyClick(peer.public_key)}}>{peer.public_key}</span>
                                    <UncontrolledTooltip target={`click_to_copy_${peer.id}`} placement={"top"} >{props.t("CLICK TO COPY")}</UncontrolledTooltip>
                                </td>
                                <td>{peer.allowed_ip}</td>
                                <td>{props.latestHandshake(peer.latest_handshake)}</td>
                                <td>{peer.endpoint && peer.endpoint?peer.endpoint:"N/A"}</td>
                                <td className="status"><span className={"badge badge-soft-"+(peer.status?peer.status==="online"?"success":"danger":"danger")+" text-uppercase"}>{peer.status?props.t(peer.status):props.t("Offline")}</span></td>
                                <td className="total_sent text-success"><i className="mdi mdi-arrow-top-right-thin"></i> {props.convertToGB(peer.total_sent)}</td>
                                <td className="total_receive text-info"><i className="mdi mdi-arrow-bottom-right-thin"></i> {props.convertToGB(peer.total_receive)}</td>
                                <td>
                                    <div className="d-flex gap-2">

                                        <button className="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={()=>{props.changeQrCodeData(peer)}}>
                                            <i className={"ri-qr-code-line"}></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={()=>{props.saveToFile(peer)}}>
                                            <i className={"ri-download-cloud-2-line"}></i>
                                        </button>

                                        <UncontrolledDropdown >
                                            <DropdownToggle className="btn btn-sm btn-outline-info" caret color={"info"} outline={true}>...</DropdownToggle>
                                            <DropdownMenu className={"btn btn-sm btn-outline-info"}>
                                                {peer&&peer.enabled&&peer.enabled === true?(
                                                    <>
                                                        <DropdownItem onClick={()=>{props.toggleEditModal(peer)}}>{props.t("Settings")}</DropdownItem>
                                                        <DropdownItem onClick={()=>{props.toggleDUModal(peer.public_key,peer.name)}}>{props.t("Data Usage")}</DropdownItem>
                                                        <DropdownItem onClick={()=>{props.switchPeerState(peer)}}>{props.t("Deactivate")}</DropdownItem>
                                                        <DropdownItem onClick={()=>{props.deletePeerData(peer)}}>{props.t("Delete")}</DropdownItem>
                                                    </>
                                                ):(
                                                    <>
                                                        <DropdownItem onClick={()=>{props.switchPeerState(peer)}}>{props.t("Activate")}</DropdownItem>
                                                    </>
                                                )}
                                            </DropdownMenu>
                                        </UncontrolledDropdown>

                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </React.Fragment>
    );
}

ClientsList.propTypes = {
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

export default withTranslation()(ClientsList);
