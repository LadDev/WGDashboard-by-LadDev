import React, {PureComponent, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {useDispatch, useSelector} from "react-redux";
import {execPing, fetchConfigTools} from "../store/management/config/actions";
import {Link} from "react-router-dom";

const PingModal = (props) => {
    const dispatch = useDispatch()

    const {interfacesRes, pingData, pinging} = useSelector(state => ({
        interfacesRes: state.Config.interfaces,
        pinging: state.Config.pinging,
        pingData: state.Config.pingData,
    }));

    const [interfaces, setInterfaces] = useState([])
    const [peers, setPeers] = useState([])

    const [selectedInterface, setSelectedInterface] = useState(null)
    const [selectedIp, setSelectedIp] = useState(null)
    const [pingCount, setPingCount] = useState(4)

    useEffect(()=>{
        if(props.show){
            setInterfaces([])
            setPeers([])
            setSelectedInterface(null)
            setSelectedIp(null)
            setPingCount(4)
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

    const onChangePingCount= (count) => {
        setPingCount(Number(count))
    }

    const setPing = () => {
        dispatch(execPing({interface_name: selectedInterface, ip: selectedIp, count: pingCount}))
    }

    return (
        <React.Fragment>
            <Modal isOpen={props.show} toggle={props.toggle} centered={true} size={"lg"}>
                <ModalHeader toggle={props.toggle}>{props.t("Ping")}</ModalHeader>
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
                        <div className="col-sm">
                            <div className="mb-3">
                                <small>{props.t("Ping Count")}</small>
                                <input type="number" className="form-control mt-2 ping_count" min="1" defaultValue={pingCount} onChange={(e)=>{onChangePingCount(e.target.value)}} />
                            </div>
                        </div>
                    </div>

                    {pingData&&pingData?(
                        <>
                            <hr />
                            <Row>
                                <div className="ping_result">
                                    <table className="table">
                                        <tbody>
                                        <tr>
                                            <th scope="row">{props.t("Address")}</th>
                                            <td>{pingData.host}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">{props.t("Is Alive")}</th>
                                            <td>{props.t(pingData.alive?"Yes":"No")}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Min RTT</th>
                                            <td>{pingData.min}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Average RTT</th>
                                            <td>{pingData.avg}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Max RTT</th>
                                            <td>{pingData.max} ms</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Package Loss</th>
                                            <td>{Number(pingData.packetLoss).toFixed(2)}%</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Row>
                        </>
                    ):null}

                </ModalBody>
                <ModalFooter>
                    <div className="mt-4">
                        <div className="hstack gap-2 justify-content-center">
                            <Link to="#" className="btn btn-link link-dark fw-medium"
                                  onClick={() => props.toggle()}><i
                                className="ri-close-line me-1 align-middle"></i> {props.t("Cancel")}</Link>
                            <Button disabled={pinging||!selectedInterface||!selectedIp||Number(pingCount)<=0} onClick={() => {setPing()}} className="btn btn-prymary">{pinging?"Pinging...":"Ping"}</Button>
                        </div>
                    </div>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}

PingModal.propTypes = {
    t: PropTypes.any,
    show: PropTypes.bool,
    toggle: PropTypes.func
};

export default withTranslation()(PingModal);
