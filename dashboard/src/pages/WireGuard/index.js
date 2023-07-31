import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import withRouter from "../../Components/Common/withRouter";
import {useParams} from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import {Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import WgHeader from "./WgHeader";
import Clients from "./Clients";
import {fetchConfig, fetchConfigChart, resetConfigChart} from "../../store/management/config/actions";
import TraficChart from "./TraficChart";
import AddPeerModal from "./Modals/AddPeerModal";


const WireGuard = (props) => {

    let authUser = JSON.parse(localStorage.getItem("authUser"))

    const {name: confName} = useParams();
    const dispatch = useDispatch()

    const [configData,setConfigData] = useState(null)
    const [intervalId, setIntervalId] = useState(null);
    const [intervalTime, setIntervalTime] = useState(authUser.intervalTime || 10000);

    const {configDataRes, chartDataRes} = useSelector(state => ({
        configDataRes: state.Config.configData,
        chartDataRes: state.Config.chartData
    }))

    const intervalFunction = () => {
        dispatch(fetchConfigChart({name: confName}))
        dispatch(fetchConfig(confName))
    };


    useEffect(()=>{
        dispatch(resetConfigChart())
        intervalFunction()
        const id = setInterval(intervalFunction, intervalTime); // Например, интервал каждую секунду
        setIntervalId(id);
        return () => {
            clearInterval(intervalId);
        };
    },[])

    useEffect(()=>{
        if(intervalId){
            clearInterval(intervalId);

            const id = setInterval(intervalFunction, intervalTime); // Например, интервал каждую секунду
            setIntervalId(id);
        }
    },[intervalTime])


    useEffect(()=>{
        if(configDataRes && configDataRes !== configData){
            setConfigData(configDataRes)
        }
    },[configDataRes])

    const [addPeerModalState, setAddPeerModalState] = useState(false)

    const addPeerModalToggle = () => {
        setAddPeerModalState(!addPeerModalState)
    }

    const onChangeInterval = (newInterval) => {
        let authUser = JSON.parse(localStorage.getItem("authUser"))
        authUser.intervalTime = newInterval
        localStorage.setItem("authUser", JSON.stringify(authUser))
        setIntervalTime(newInterval)
    }

    document.title = props.t(confName)+" | WireGuard ";

    return (
        <React.Fragment>

            {configData&&configData.status&&configData.status==="running"?(
                <div className="customizer-setting d-md-block" style={{bottom: "80px"}}>
                    <div className="btn-info btn-rounded shadow-lg btn btn-icon btn-lg p-2" onClick={addPeerModalToggle}>
                        <i className='mdi mdi-spin mdi-key-plus fs-22'></i>
                    </div>
                </div>
            ):null}



            <AddPeerModal modalState={addPeerModalState} toggle={addPeerModalToggle} interface_name={confName} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={props.t(confName)} pageTitle={props.t("WireGuard")} />

                    <Row className={"mb-3"}>
                        <WgHeader headerData={configData} />
                    </Row>

                    <Row className={"mb-3"}>
                        <TraficChart dataColors='["--vz-primary", "--vz-success"]' confName={confName} chartDataRes={chartDataRes} />
                    </Row>

                    {configData && configData?(
                        <Row>
                            <Clients configData={configData} interface_name={confName} onChangeInterval={onChangeInterval} intervalTime={intervalTime} />
                        </Row>
                    ):("")}

                </Container>
            </div>
        </React.Fragment>
    );
}

WireGuard.propTypes = {
    t: PropTypes.any,
    params: PropTypes.any
};

export default withRouter(withTranslation()(WireGuard));
