import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import QRCode from 'qrcode.react';

const QrCodeModal = (props) => {

    const [modalState, setModalState] = useState(false)

    useEffect(()=>{
        setModalState(props.modalState)
    }, [props.modalState])

    return (
        <React.Fragment>
            <Modal
                isOpen={modalState}
                toggle={props.toggle}
            >
                <ModalHeader toggle={props.toggle}>
                    {props.t("QR Code")}
                </ModalHeader>

                <ModalBody>
                    <QRCode size={458} value={props.qrCodeData} />
                </ModalBody>

            </Modal>
        </React.Fragment>
    );
}

QrCodeModal.propTypes = {
    t: PropTypes.any,
    toggle: PropTypes.func,
    qrCodeData: PropTypes.string,
    modalState: PropTypes.bool
};

export default withTranslation()(QrCodeModal);
