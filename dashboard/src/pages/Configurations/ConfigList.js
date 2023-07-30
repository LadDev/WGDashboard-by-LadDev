import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";
import {Card, CardBody, CardHeader, Input, Label, Table} from "reactstrap";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {switchConfigStatus} from "../../store/management/config/actions";

const ConfigList = (props) => {
    const dispatch = useDispatch()
    const {configsRes} = useSelector(state => ({
        configsRes: state.Config.configs
    }));

    const [configs, setConfigs] = useState([])


    useEffect(()=>{
        if(configsRes !== configs){
            setConfigs([...configsRes])
        }
    },[configsRes])

    const toggleConfig = (event) =>{
        dispatch(switchConfigStatus({name: event.target.name, status: event.target.checked}))
    }


    return (
        <React.Fragment>
            {configs.length === 0?(
                <div className="row peer_list">
                    <div className="col-12" style={{textAlign: "center", marginTop: "1.5rem"}}>
                        <h3 className="text-muted">{props.t("Oops! No WireGuard configuration found ‘︿’")}</h3>
                    </div>
                </div>
            ):(
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">{props.t("WireGuard Configurations")}</h4>
                        {/*<div className="flex-shrink-0">*/}
                        {/*    <button type="button" className="btn btn-soft-info btn-sm">*/}
                        {/*        <i className="ri-file-list-3-line align-bottom"></i> Generate*/}
                        {/*        Report*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive table-card">
                            <Table className="table table-centered align-middle table-nowrap mb-0">
                                <thead className="text-muted table-light">
                                <tr>
                                    <th scope="col" style={{textTransform:"uppercase"}}>{props.t("Configuration")}</th>
                                    <th scope="col" style={{textTransform:"uppercase"}}>{props.t("Status")}</th>
                                    <th scope="col" style={{textTransform:"uppercase"}}>{props.t("Public Key")}</th>
                                    <th scope="col"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {configs.map((config,key)=> (
                                    <tr key={key}>
                                        <td>
                                            <Link to={`/wireguard/${config.conf}`}>{config.conf}</Link>
                                        </td>
                                        <td>
                                            {config.status === "stopped"?(
                                                <span className="badge badge-soft-danger" style={{textTransform:"uppercase"}}>{config.status}</span>
                                            ):(
                                                <span className="badge badge-soft-success" style={{textTransform:"uppercase"}}>{config.status}</span>
                                            )}

                                        </td>
                                        <td>
                                            <Link to={"/"}>{config.public_key}</Link>
                                        </td>

                                        <td>
                                            <div className="form-check form-switch form-switch-success mb-3">
                                                <Input className="form-check-input" type="checkbox" role="switch" name={config.conf} id={key} onChange={toggleConfig} defaultChecked={config.checked} />
                                                {/*<Label className="form-check-label" for="SwitchCheck6">Switch Info</Label>*/}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            )}


        </React.Fragment>
    );
};

ConfigList.propTypes = {
    t: PropTypes.any
};

export default withTranslation()(ConfigList);
