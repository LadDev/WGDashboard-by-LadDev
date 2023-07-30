import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Badge, Modal, ModalBody, ModalHeader} from "reactstrap";
import {Link} from "react-router-dom";
import SimpleBar from "simplebar-react";

const AvailableIPsModal = (props) => {

    const [modalState, setModalState] = useState(false)
    const [peerAddress, setPeerAddress] = useState([])
    const [availableIPs, setAvailableIPs] = useState([])

    useEffect(()=>{
        setModalState(props.modalState)
        if(props.modalState){
            setPeerAddress(props.peerAddress.replace(/\s+/g, '').split(","))
        }
    },[props.modalState])

    useEffect(()=>{
        setAvailableIPs(props.availableIPs)
        props.changeAddress(peerAddress.join(", "))

    },[peerAddress])

    const toggleAvailableIp = (ip) => {
        if(peerAddress.includes(ip.trim())){
            const filteredAvailable = peerAddress.filter(item => item.trim() !== ip.trim());
            setPeerAddress([...filteredAvailable])
        }else{
            setPeerAddress([...peerAddress,ip.trim()])
        }
    }



    return (
        <React.Fragment>
            <Modal
                isOpen={modalState}
                toggle={props.toggle}
            >
                <ModalHeader toggle={props.toggle}>
                    {props.t("Select available IP")}
                </ModalHeader>

                <div className="selected_ip" style={{padding: "1rem", borderBottom: "1px solid #dee2e6"}}>
                    <small className="text-muted"><strong>SELECTED IP (CLICK TO REMOVE)</strong></small>
                    <div className={"d-flex flex-wrap gap-2"}>
                        {peerAddress.map((ip,key)=>(
                            <Badge onClick={()=>{toggleAvailableIp(ip)}} color={"secondary"} style={{cursor: "pointer"}} key={key}>{ip}</Badge>
                        ))}
                    </div>
                </div>

                <ModalBody>
                    <SimpleBar autoHide={false} className="simplebar-track-secondary" style={{ maxHeight: "350px" }}>
                        <div className={"list-group list-group-flush"}>
                            {availableIPs.map((ip,key)=>(

                                peerAddress.includes(ip.trim())?(
                                    <Link to={"#"} onClick={()=>{toggleAvailableIp(ip.trim())}} className={"list-group-item list-group-item-action available-ip-item active"} key={key}>{ip.trim()}</Link>
                                ):(
                                    <Link to={"#"} onClick={()=>{toggleAvailableIp(ip.trim())}} className={"list-group-item list-group-item-action available-ip-item"} key={key}>{ip.trim()}</Link>
                                )
                            ))}
                        </div>
                    </SimpleBar>

                </ModalBody>

            </Modal>
        </React.Fragment>
    );
}

AvailableIPsModal.propTypes = {
    t: PropTypes.any,
    availableIPs: PropTypes.array,
    modalState: PropTypes.bool,
    toggle: PropTypes.func,
    changeAddress: PropTypes.func,
    peerAddress: PropTypes.string
};

export default withTranslation()(AvailableIPsModal);
