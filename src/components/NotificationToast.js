import React, { Component } from 'react';
import {Toast} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';



export default class NotificationToast extends Component {
    constructor(props){
        super();
        this.state = {
            show: true
        }
        this.toggleToast = this.toggleToast.bind(this);
        this.interval = setInterval(this.removeToast, 5000);
        this.ref = React.createRef();
    }

    removeToast = () => {
        console.log("removing " + this.props.index);
        this.props.remove(this.props.index);
    }

    toggleToast = () => {
        this.setState({show: !this.state.show});
    }

    componentWillUnmount = () => {
        clearInterval(this.interval);
    }

    render() {
        return(
            <Toast ref={this.ref} show={this.state.show} onClose={this.toggleToast}>
                <Toast.Header>
                    <strong className="mr-auto">{this.props.title}</strong>
                </Toast.Header>
                <Toast.Body>{this.props.children}</Toast.Body>
            </Toast>
        )
    }
}