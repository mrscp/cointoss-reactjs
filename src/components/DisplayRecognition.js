import React, { Component } from 'react';
import {Col, Row, Image, Button, Form} from 'react-bootstrap';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import * as tf from '@tensorflow/tfjs';


export default class DisplayRecognition extends Component {
    constructor(props) {
        super();

        this.state = {
            image: null,
            wait: true,
            head_probability: 0,
            tail_probability: 0,
            selected: "Head"
        }
        this.image = React.createRef();
    }

    recognize = async () => {
        this.setState({
            wait: true
        });
        const model = await tf.loadLayersModel(process.env.REACT_APP_DOMAIN + process.env.PUBLIC_URL + '/json/model.json');
        var image = tf.browser.fromPixels(this.image.current).resizeBilinear([224,224]);
        image = image.reshape([1, image.shape[0], image.shape[1], image.shape[2]])
        const prediction = model.predict(image).dataSync();
        this.setState({
            head_probability: parseFloat(prediction[0]).toFixed(2) * 100,
            tail_probability: parseFloat(prediction[1]).toFixed(2) * 100,
            selected: prediction[0]>prediction[1]?"Head":"Tail",
            wait: false
        });
        this.props.addNotification({title: "Recognition Completed", body: "Recognition has been completed, now you may submit it with/without changing the result."});
    }

    handleTakePhoto = (image) => {
        this.setState({
            image: image
        })
        this.recognize();
    }

    handleOnChange = (event) => {
        var image = event.target.files[0];
        image = URL.createObjectURL(image)
        this.setState({
            image: image
        });
        this.recognize();
    }

    handleSelect = (event) => {
        this.setState({
            selected: event.currentTarget.value
        });
    }

    render() {
        return(
        <div>
            <Row className="mt-5">
                <Col xs={12} md={4}>
                    <Image ref={this.image} src={this.state.image} thumbnail />
                    <Form.Group className="mt-3">
                        <Form.File onChange={this.handleOnChange} />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <div className="ptb-100">
                        <Form.Check name="toss" label={"Head [Confidence: "+this.state.head_probability+"%]"} value="Head" id="head" type="radio" checked={this.state.selected === "Head"} onChange={this.handleSelect} />
                        <Form.Check name="toss" label={"Tail [Confidence: "+this.state.tail_probability+"%]"} value="Tail" id="tail" type="radio" checked={this.state.selected === "Tail"} onChange={this.handleSelect} />
                    </div>
                </Col>
                <Col xs={12} md={4}>
                    <div className="ptb-100">
                        <Button variant="primary" disabled={this.state.wait}>Submit</Button>
                    </div>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col>
                    <Camera onTakePhoto={(imageUri) => {this.handleTakePhoto(imageUri)}} />
                </Col>
            </Row>
        </div>
        )
    }
}