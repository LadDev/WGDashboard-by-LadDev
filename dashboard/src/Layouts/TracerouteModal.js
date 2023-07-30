import React, {PureComponent, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {useDispatch, useSelector} from "react-redux";
import {execPing, execTraceroute, fetchConfigTools} from "../store/management/config/actions";
import {Link} from "react-router-dom";
import SimpleBar from "simplebar-react";

const TracerouteModal = (props) => {
    const dispatch = useDispatch()

    const {interfacesRes, traceData, tracing} = useSelector(state => ({
        interfacesRes: state.Config.interfaces,
        tracing: state.Config.tracing,
        traceData: state.Config.traceData,
    }));

    const [interfaces, setInterfaces] = useState([])
    const [peers, setPeers] = useState([])

    const [selectedInterface, setSelectedInterface] = useState(null)
    const [selectedIp, setSelectedIp] = useState(null)

    useEffect(()=>{
        if(props.show){
            setInterfaces([])
            setPeers([])
            setSelectedInterface(null)
            setSelectedIp(null)
            dispatch(fetchConfigTools())
        }
    },[props.show])

    useEffect(()=>{
        if(interfacesRes !== interfaces){
            setInterfaces(interfacesRes)
        }
    },[interfacesRes])

    const onSelectConfig = (e) => {
        if(e.target.value === "none"){
            setPeers([])
            setSelectedIp(null)
        }else{
            setSelectedIp(null)
            for(const intr of interfaces){
                if(intr.name === e.target.value){
                    setSelectedInterface(intr.name)
                    setPeers(intr.peers)
                }
            }
        }
    }

    const onChangeIp = (ip) => {
        setSelectedIp(ip)
    }


    const setTraceroute = () => {
        dispatch(execTraceroute({interface_name: selectedInterface, ip: selectedIp}))
    }

    return (
        <React.Fragment>
            <Modal isOpen={props.show} toggle={props.toggle} centered={true} size={"lg"}>
                <ModalHeader toggle={props.toggle}>{props.t("Traceroute")}</ModalHeader>
                <ModalBody className="py-3">
                    <div className="row">
                        <div className="col-sm">
                            <div className="mb-3">
                                <small>{props.t("Configuration")}</small>

                                {interfaces.length > 0?(
                                    <select className="form-control form-select mt-2" defaultValue={"none"} onChange={onSelectConfig}>
                                        <option value="none">{props.t("Select Configuration")}</option>
                                        {interfaces.map((inter,key) => (
                                            <option key={key} value={inter.name}>{inter.name}</option>
                                        ))}
                                    </select>
                                ):null}


                            </div>
                        </div>
                        <div className="col-sm">
                            <div className="mb-3">
                                <small>IP</small>
                                <select className="form-control form-select mt-2" defaultValue={"none"} onChange={(e)=>{onChangeIp(e.target.value)}}>
                                    <option value="none" disabled="">{props.t("Choose an IP")}</option>
                                    {peers.map((peer,key)=>(
                                        <optgroup key={key} label={peer.name+" - "+peer.public_key}>
                                            {peer.ips.map((ip,i)=>(
                                                <option key={i} value={ip}>{ip}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {traceData&&traceData.hop.length>0?(
                        <>
                            <SimpleBar data-simplebar-direction="rtl" style={{ maxHeight: "400px" }} className="px-3">
                                <div className="traceroute_result">
                                    <table className="table table-sm">
                                        <thead>
                                        <tr>
                                            <th scope="col">Hop</th>
                                            <th scope="col">IP</th>
                                            <th scope="col">RTT</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {traceData.hop.map((tr,key)=>(
                                            <tr key={key}>
                                                <th scope="row" >{tr.hop}</th>
                                                <td>{tr.ip}</td>
                                                <td>{tr.rtt1}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SimpleBar>

                        </>
                    ):null}

                </ModalBody>
                <ModalFooter>
                    <div className="mt-4">
                        <div className="hstack gap-2 justify-content-center">
                            <Link to="#" className="btn btn-link link-dark fw-medium"
                                  onClick={() => props.toggle()}><i
                                className="ri-close-line me-1 align-middle"></i> {props.t("Cancel")}</Link>
                            <Button disabled={tracing||!selectedInterface||!selectedIp} onClick={() => {setTraceroute()}} className="btn btn-prymary">{tracing?"Tracing...":"Traceroute"}</Button>
                        </div>
                    </div>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}

TracerouteModal.propTypes = {
    t: PropTypes.any,
    show: PropTypes.bool,
    toggle: PropTypes.func
};

export default withTranslation()(TracerouteModal);
