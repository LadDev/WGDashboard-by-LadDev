import React, {useState} from "react";
import { Container, Row } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import PropTypes from "prop-types";
import withRouter from "../../Components/Common/withRouter";
import {withTranslation} from "react-i18next";
import Widgets from "./Widgets";
import ConfigList from "./ConfigList";
import AddConfigModal from "./AddConfigModal";

const Configuration = (props) => {
    document.title = props.t("Configuration")+" | WireGuard "+props.t("Dashboard");

    const [addConfigModalState, setAddConfigModalState] = useState(false)
    const toggleAddConfig = () => {
        setAddConfigModalState(!addConfigModalState)
    }

    return (
        <React.Fragment>

            <div className="customizer-setting d-md-block" style={{bottom: "80px"}}>
                <div className="btn-info btn-rounded shadow-lg btn btn-icon btn-lg p-2" onClick={toggleAddConfig}>
                    <i className='mdi mdi-spin mdi-server-plus fs-22'></i>
                </div>
            </div>

            <AddConfigModal modalState={addConfigModalState} toggle={toggleAddConfig} />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={props.t("Configurations")} pageTitle={props.t("Management")} />

                    <Row>
                        <Widgets />
                    </Row>
                    <Row>
                        <ConfigList />
                    </Row>

                </Container>
            </div>
        </React.Fragment>
    );
};

Configuration.propTypes = {
    t: PropTypes.any,
};
export default withRouter(withTranslation()(Configuration));
