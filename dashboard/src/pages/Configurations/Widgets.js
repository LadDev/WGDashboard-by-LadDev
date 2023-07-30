import React, {useEffect, useState} from "react";
import {Card, CardBody, Col, Row} from "reactstrap";
import DashboardCharts from "./DashboardCharts";
import {useDispatch, useSelector} from "react-redux";
import {fetchServerStatus} from "../../store/management/config/actions";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";

const Widgets = (props) => {
    const dispatch = useDispatch()

    const [system, setSystem] = useState({platform: null, freemem: 0, totalmem: 0, diskUsage: 0, cpuUsage: 0})
    const [cpuColor, setCpuColor] = useState("#45cb85d9")
    const [diskColor, setDiskColor] = useState("#45cb85d9")
    const [memColor, setMemColor] = useState("#45cb85d9")
    const [freeMem, setFreeMem] = useState(0)
    const [intervalId, setIntervalId] = useState(null);

    const {systemRes/*, error, errorMsg*/} = useSelector(state => ({
        systemRes: state.Config.system,
        error: state.Config.error,
        errorMsg: state.Config.errorMsg,
    }));

    const usageColor = (usage) => {
        let color = "#45cb85d9"
        if(usage<20){
            color = "#45cb85d9"
        }else if(usage > 20 && usage < 40){
            color = "#B0E07ED8"
        }else if(usage > 40 && usage < 60){
            color = "#E5BE24D8"
        }else if(usage > 60 && usage < 75){
            color = "#E58524D8"
        }else if(usage > 75){
            color = "#f06548"
        }

        return color
    }

    useEffect(() => {
        const intervalFunction = () => {
            dispatch(fetchServerStatus())
        };
        intervalFunction()
        const id = setInterval(intervalFunction, 5000); // Например, интервал каждую секунду
        setIntervalId(id);
        return () => {
            clearInterval(intervalId);
        };
    }, []);


    useEffect(()=>{
        if(systemRes && systemRes !== system){
            setSystem(systemRes)
        }
    },[systemRes])

    useEffect(()=>{
        const cpuUsage = Number(system.cpuUsage)
        const diskUsage = Number(system.diskUsage)
        const percentageFreeMemory = Number(Number((system.freemem / system.totalmem) * 100).toFixed(1));
        setFreeMem(isNaN(percentageFreeMemory)?0:percentageFreeMemory)
        setCpuColor(usageColor(cpuUsage))
        setDiskColor(usageColor(diskUsage))
        setMemColor(usageColor(percentageFreeMemory))
    },[system])

    return (
        <React.Fragment>
            <Col xl={12}>
                <div className="d-flex flex-column h-100">

                    <Row>
                        <Col xl={4} md={4}>
                            <Card className="card-animate overflow-hidden">
                                <div
                                    className="position-absolute start-0"
                                    style={{zIndex: "0"}}
                                >
                                    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
                                        <path id="Shape 8" style={{opacity: ".05", fill: "#299cdb"}} d="m189.5-25.8c0 0 20.1 46.2-26.7 71.4 0 0-60 15.4-62.3 65.3-2.2 49.8-50.6 59.3-57.8 61.5-7.2 2.3-60.8 0-60.8 0l-11.9-199.4z" />
                                    </svg>
                                </div>
                                <CardBody style={{zIndex: "1"}}>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1 overflow-hidden">
                                            <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                                                {" "}
                                                {props.t("CPU Usage")}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <DashboardCharts
                                                seriesData={[Number(system.cpuUsage).toFixed(1)]}
                                                colors={cpuColor}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl={4} md={4}>
                            <Card className="card-animate overflow-hidden">
                                <div
                                    className="position-absolute start-0"
                                    style={{zIndex: "0"}}
                                >
                                    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
                                        <path id="Shape 8" style={{opacity: ".05", fill: "#299cdb"}} d="m189.5-25.8c0 0 20.1 46.2-26.7 71.4 0 0-60 15.4-62.3 65.3-2.2 49.8-50.6 59.3-57.8 61.5-7.2 2.3-60.8 0-60.8 0l-11.9-199.4z" />
                                    </svg>
                                </div>
                                <CardBody style={{zIndex: "1"}}>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1 overflow-hidden">
                                            <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                                                {" "}
                                                {props.t("Memory Usage")}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <DashboardCharts
                                                seriesData={[freeMem]}
                                                colors={memColor}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl={4} md={4}>
                            <Card className="card-animate overflow-hidden">
                                <div
                                    className="position-absolute start-0"
                                    style={{zIndex: "0"}}
                                >
                                    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
                                        <path id="Shape 8" style={{opacity: ".05", fill: "#299cdb"}} d="m189.5-25.8c0 0 20.1 46.2-26.7 71.4 0 0-60 15.4-62.3 65.3-2.2 49.8-50.6 59.3-57.8 61.5-7.2 2.3-60.8 0-60.8 0l-11.9-199.4z" />
                                    </svg>
                                </div>
                                <CardBody style={{zIndex: "1"}}>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1 overflow-hidden">
                                            <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                                                {" "}
                                                {props.t("Disk Usage")}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <DashboardCharts
                                                seriesData={[Number(system.diskUsage).toFixed(1)]}
                                                colors={diskColor}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Col>
        </React.Fragment>
    );
};

Widgets.propTypes = {
    t: PropTypes.any,
    system: PropTypes.object
};

export default withTranslation()(Widgets);
