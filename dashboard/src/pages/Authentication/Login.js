import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link } from "react-router-dom";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// actions
import { loginUser, socialLogin, resetLoginFlag } from "../../store/actions";

import logoLight from "../../assets/images/logo-light.png";

import withRouter from '../../Components/Common/withRouter';
import {withTranslation} from "react-i18next";
import PropTypes from "prop-types";

const Login = (props) => {
    const dispatch = useDispatch();
    const { user, errorMsg, loading, error } = useSelector(state => ({
        user: state.Account.user,
        errorMsg: state.Login.errorMsg,
        loading: state.Login.loading,
        error: state.Login.error,
    }));

    const [userLogin, setUserLogin] = useState([]);
    const [passwordShow, setPasswordShow] = useState(false);


    useEffect(() => {
        if (user && user) {
            const updatedUserData = user.user.login;
            setUserLogin({
                login: updatedUserData,
                password: user.user.confirm_password ? user.user.confirm_password : ""
            });
        }
    }, [user]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            login: userLogin.login || '',
            password: userLogin.password || '',
            remember: false
        },
        validationSchema: Yup.object({
            login: Yup.string().required(props.t("Please Enter Your Login")),
            password: Yup.string().required(props.t("Please Enter Your Password")),
        }),
        onSubmit: (values) => {
            dispatch(loginUser(values, props.router.navigate));
        }
    });

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
            }, 3000);
        }
    }, [dispatch, error]);


    document.title = props.t("SignIn")+" | WireGuard "+props.t("Dashboard");
    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={logoLight} alt="" height="20" />
                                        </Link>
                                    </div>
                                    <p className="mt-3 fs-15 fw-medium">{props.t("WireGuard Server Control Panel")}</p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">{props.t("Welcome Back !")}</h5>
                                            <p className="text-muted">{props.t("Sign in to continue to WireGuard.")}</p>
                                        </div>
                                        {errorMsg && errorMsg ? (<Alert color="danger"> {errorMsg.message} </Alert>) : null}
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                action="#">

                                                <div className="mb-3">
                                                    <Label htmlFor="login" className="form-label">{props.t("Login")}</Label>
                                                    <Input
                                                        name="login"
                                                        className="form-control"
                                                        placeholder={props.t("Enter Login")}
                                                        type="login"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.login || ""}
                                                        invalid={
                                                            validation.touched.login && validation.errors.login ? true : false
                                                        }
                                                    />
                                                    {validation.touched.login && validation.errors.login ? (
                                                        <FormFeedback type="invalid">{validation.errors.login}</FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-3">
                                                    {/*<div className="float-end">*/}
                                                    {/*    <Link to="/forgot-password" className="text-muted">Forgot password?</Link>*/}
                                                    {/*</div>*/}
                                                    <Label className="form-label" htmlFor="password-input">{props.t("Password")}</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder={props.t("Enter Password")}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.password && validation.errors.password ? (
                                                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                        ) : null}
                                                        <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon" onClick={() => setPasswordShow(!passwordShow)}><i className="ri-eye-fill align-middle"></i></button>
                                                    </div>
                                                </div>

                                                <div className="form-check">
                                                    <Input className="form-check-input" type="checkbox" name="remember" onChange={validation.handleChange} defaultChecked={validation.values.remember || false} id="auth-remember-check" />
                                                    <Label className="form-check-label" htmlFor="auth-remember-check">{props.t("Remember me")}</Label>
                                                </div>

                                                <div className="mt-4">
                                                    <Button color="success" disabled={error ? null : loading ? true : false} className="btn btn-success w-100" type="submit">
                                                        {error ? null : loading ? <Spinner size="sm" className='me-2'> {props.t("Loading...")} </Spinner> : null}
                                                        {props.t("Sign In")}
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

Login.propTypes = {
    t: PropTypes.any,
};
export default withRouter(withTranslation()(Login));
