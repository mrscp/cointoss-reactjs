import React, { Component } from 'react';
import NotificationToast from './NotificationToast';
import {Container, Row, Col} from 'react-bootstrap';
import DisplayRecognition from './DisplayRecognition';


export default class MainComponent extends Component {
    constructor(props){
        super();
        this.state = {
            notification: [
                {title: "Page loaded", body: "Page has been loaded succesfully. Now you may upload/capture image to recognize."}
            ]
        }
    }

    removeNotification = (index) => {
        var array = this.state.notification;
        array[index] = null;
        var nulled = true;
        array.map(function (toast) {
            if (toast !== null) nulled = false;
            return 0;
        });
        if (nulled) array = [];

        this.setState({notification: array})
    }

    addNotification = (toast) => {
        var array = this.state.notification;
        array.push(toast);
        this.setState({notification: array});
    }

    notification = (toast, index) => {
        if (toast !== null)
            return (
                <NotificationToast key={index} index={index} remove={this.removeNotification} title={toast.title}>
                    {toast.body}
                </NotificationToast>
            )
    }

    render() {
        return(
        <div>
            <Container>
                <Row>
                    <Col>
                        <h2 className="text-center">Coin Toss Recognition</h2>
                    </Col>
                </Row>

                <DisplayRecognition addNotification={this.addNotification} />
            </Container>
            <div className="notification">
                {this.state.notification.map(this.notification)}
            </div>
        </div>
        )
    }
}