import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap';
import 'react-html5-camera-photo/build/css/index.css';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';


export default class WebCam extends Component {
    constructor(props) {
        super();
        this.state = {
            modal_show: false
        }
    }

    toggleModal = () => {
        this.setState({
            modal_show: !this.state.modal_show
        });
    }

    handleTakePhoto = (imageUri) => {
        this.props.handleTakePhoto(imageUri);
        this.toggleModal();
    }

    render(){
        return (
            <div>
                <Modal size="lg" show={this.state.modal_show} onHide={this.toggleModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Capture Photo from WebCam</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Camera onTakePhoto={(imageUri) => {this.handleTakePhoto(imageUri)}} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.toggleModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <Button className="mt-3" variant="primary" onClick={this.toggleModal}>
                    Open WebCam
                </Button>
            </div>

        )
    }
}