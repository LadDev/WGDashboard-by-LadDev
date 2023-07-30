import React, {PureComponent, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalBody, ModalHeader, Row} from "reactstrap";
import {withTranslation} from "react-i18next";
import {
    fetchConfig,
    fetchConfigChart,
    fetchPeerChart,
    resetConfigChart, resetPeerChart
} from "../../../store/management/config/actions";
import {useDispatch, useSelector} from "react-redux";
import TraficChart from "../TraficChart";

const DataUsageModal = (props) => {
    const dispatch = useDispatch()
    const [intervalId, setIntervalId] = useState(null);

    const {peerChartDataRes} = useSelector(state => ({
        peerChartDataRes: state.Config.peerChartData
    }))

    useEffect(()=>{
        if(props.show && props.public_key){
            const intervalFunction = () => {
                if(props.show) {
                    dispatch(fetchPeerChart({interface_name: props.confName, public_key: encodeURIComponent(props.public_key)}))
                }else{
                    clearInterval(intervalId);
                }
            };

            dispatch(resetPeerChart())
            intervalFunction()
            const id = setInterval(intervalFunction, 10000); // Например, интервал каждую секунду
            setIntervalId(id);

            //console.log(props.public_key)
        }else{
            clearInterval(intervalId);
        }
    },[props.show])


    return (
        <React.Fragment>
            <Modal isOpen={props.show} toggle={()=>{props.toggle()}} centered={true} size={"xl"}>
                <ModalHeader toggle={()=>{props.toggle()}}>
                    {props.t("Data Usage")} ({props.name})
                </ModalHeader>
                <ModalBody className="py-3 px-5">
                    <Row className={"mb-3"}>
                        <TraficChart dataColors='["--vz-primary", "--vz-success"]' confName={props.confName} chartDataRes={peerChartDataRes} />
                    </Row>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
}

DataUsageModal.propTypes = {
    t: PropTypes.any,
    confName: PropTypes.string,
    show: PropTypes.any,
    toggle: PropTypes.func,
    public_key: PropTypes.string,
    name: PropTypes.string,
};

export default withTranslation()(DataUsageModal);
