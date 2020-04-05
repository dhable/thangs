import React from 'react';
import {Button, TextareaAutosize, Typography} from "@material-ui/core";
import Websocket from "react-websocket";

class AnswerScreen extends React.Component {
    handleOpen() {
        let { playerToken } = this.props;
        this.send({action: "register_user_session", playerToken: playerToken});
    }

    handleClose() {
        console.log("close");
    }

    handleInbound(data) {
        let obj = JSON.parse(data);
        // handle lock and reset here
    }

    submitAnswer(event) {
        event.preventDefault();
        let answer = document.getElementById("answerTextarea").value;
        this.send({action: "submit_answer", answer: answer});
    }

    send(obj) {
        if (this.wsReference) {
            this.wsReference.sendMessage(JSON.stringify(obj));
        } else {
            console.warn("wsReference was not set");
        }
    }

    render() {
        let { playerToken } = this.props;

        return (
            <div className="App">
                <Typography align="center" variant="h4">Game of Thangs...</Typography>
                <div className="App-input">
                    <form onSubmit={this.submitAnswer}>
                        <TextareaAutosize id="answerTextarea"
                                          className="App-input-text"
                                          rowsMin={8}
                                          rowsMax={16}
                                          placeholder="What's your answer?"/>
                        <Button id="submitButton"
                                className="App-input-btn"
                                type="submit"
                                variant="contained"
                                size="large">
                            Save
                        </Button>
                    </form>
                </div>
                <Websocket url="wss://71wrpotbp9.execute-api.us-east-2.amazonaws.com/prod"
                           onOpen={this.handleOpen}
                           onMessage={this.handleInbound}
                           onClose={this.handleClose}
                           reconnect={true}
                           debug={true}
                           ref={ws => {
                               this.wsReference = ws;
                           }} />
            </div>
        );
    }
}

export default AnswerScreen;