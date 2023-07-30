import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody } from "reactstrap";
import {withTranslation} from "react-i18next";

const DeletePeerModal = ({ show, onDeleteClick, onCloseClick, t }) => {
    return (
        <Modal isOpen={show} toggle={onCloseClick} centered={true}>
            <ModalBody className="py-3 px-5">
                <div className="mt-2 text-center">
                    <lord-icon
                        src="https://cdn.lordicon.com/gsqxdxog.json"
                        trigger="loop"
                        colors="primary:#f7b84b,secondary:#f06548"
                        style={{ width: "100px", height: "100px" }}
                    ></lord-icon>
                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>{t("Are you sure to delete this peer?")}</h4>
                        <p className="text-muted mx-4 mb-0">
                            {t("This action is not reversible.")}
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
                        {t("Yes, Delete It!")}
                    </button>
                </div>
            </ModalBody>
        </Modal>
    );
};

DeletePeerModal.propTypes = {
    onCloseClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    show: PropTypes.any,
    t: PropTypes.any
};

export default withTranslation()(DeletePeerModal);
