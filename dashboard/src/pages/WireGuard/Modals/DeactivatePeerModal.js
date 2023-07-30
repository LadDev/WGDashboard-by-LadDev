import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody } from "reactstrap";
import {withTranslation} from "react-i18next";

const DeactivatePeerModal = ({ show, onDeleteClick, onCloseClick, t }) => {
    return (
        <Modal isOpen={show} toggle={onCloseClick} centered={true}>
            <ModalBody className="py-3 px-5">
                <div className="mt-2 text-center">
                    <lord-icon
                        src="https://cdn.lordicon.com/pithnlch.json"
                        trigger="loop"
                        colors="primary:#f7b84b,secondary:#f06548"
                        style={{ width: "100px", height: "100px" }}
                    ></lord-icon>
                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>{t("Are you sure you want to deactivate the peer?")}</h4>
                        <p className="text-muted mb-0">
                            {t("The connection of the user using this peer will be lost until you activate the peer!")}
                        </p>
                    </div>
                </div>
                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                        type="button"
                        className="btn w-sm btn-light"
                        data-bs-dismiss="modal"
                        onClick={onCloseClick}
                    >
                        {t("Close")}
                    </button>
                    <button
                        type="button"
                        className="btn w-sm btn-danger "
                        id="delete-record"
                        onClick={onDeleteClick}
                    >
                        {t("Yes, Deactivate It!")}
                    </button>
                </div>
            </ModalBody>
        </Modal>
    );
};

DeactivatePeerModal.propTypes = {
    onCloseClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    show: PropTypes.any,
    t: PropTypes.any
};

export default withTranslation()(DeactivatePeerModal);
