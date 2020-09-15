import React, { Component } from 'react';
import {Col, Row, Image, Button, Form} from 'react-bootstrap';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import * as tf from '@tensorflow/tfjs';
import { GoogleSpreadsheet } from "google-spreadsheet";


export default class DisplayRecognition extends Component {
    constructor(props) {
        super();
        const user_id = localStorage.getItem("user_id")
        this.state = {
            image: null,
            wait: true,
            head_probability: 0,
            tail_probability: 0,
            selected: "Head",
            user_id: user_id
        }
        this.image = React.createRef();

        const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
        this.CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL;
        this.PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY;

        this.doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    }

    appendSpreadsheet = async () => {
        try {
            await this.doc.useServiceAccountAuth({
                client_email: this.CLIENT_EMAIL,
                private_key: this.PRIVATE_KEY,
            });
            await this.doc.loadInfo();
      
            const sheet = this.doc.sheetsByIndex[0];
            if (this.state.user_id === null) {
                await sheet.loadCells("A2:X3");
                for (var col = 0; col < 24; ++col) {
                    let cell = sheet.getCell(1, col);
                    // cell.value = 10;
                    if (cell.value === null) {
                        this.setState({user_id: col});
                        localStorage.setItem("user_id", col)
                        break;
                    }
                }
            }

            const user_id = String.fromCharCode(parseInt(this.state.user_id) + 65); 

            await sheet.loadCells(user_id+"1:"+user_id+"30");
            for (var row = 0; row < 30; row++) {
                let cell = sheet.getCell(row, parseInt(this.state.user_id));
                if (cell.value === null) {
                    cell.value = this.state.selected;
                    break;
                }
            }
          
            sheet.saveUpdatedCells();
            this.props.addNotification({title: "Google Sheet Updated", body: "Google Sheet has been updated, now you may try with a new image."});
        } catch (e) {
          console.error('Error: ', e);
        }
    };

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

    submit = () => {
        this.setState({
            wait: true
        })
        this.appendSpreadsheet();
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
                        <Button variant="primary" disabled={this.state.wait} onClick={this.submit}>Submit</Button>
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