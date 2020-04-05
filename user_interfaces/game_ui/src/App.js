import React from 'react';
import './App.css';
import Websocket from "react-websocket";
import CreateGame from "./CreateGame";
import Question from "./Question";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {gameId: null, question: null, answers: null};
    }

    openHandler() {
        console.log("opening");
    }

    messageHandler(msg) {
        console.log(msg);

        let parsedMsg = JSON.parse(msg);
        if (parsedMsg.response === "create_game") {
            this.state.gameId = parsedMsg.gameId;
        } else if (parsedMsg.response === "start_round" ) {
            this.state.question = parsedMsg.question;
        } else if (parsedMsg.response === "end_round") {
            this.state.answers = parsedMsg.answer;
        } else {
            console.warn("unknown message = " + msg);
        }
    }

    send(obj) {
        if (this.wsReference) {
            this.wsReference.sendMessage(JSON.stringify(obj));
        } else {
            console.warn("wsReference was not set");
        }
    }

    requestNextQuestion() {
        this.state.answers = null;
        this.send({"action": "start_round", gameId: this.state.gameId});
    }

    requestAnswers() {
        this.send({"action": "end_round", gameId: this.state.gameId});
    }

    pickChildComponent() {
        if (!this.state.gameId) {
            return <CreateGame sendFn={this.send.bind(this)} />;
        } else if (this.state.answers) {
            // return view screen
            return <Answer question={this.state.question} answers={this.state.answers} nextFn={this.requestNextQuestion.bind(this)} />;
        } else {
            return <Question question={this.state.question} nextFn={this.requestAnswers.bind(this)} />;
        }
    }

    render() {
        return (
            <div className="App">
                {this.pickChildComponent()}
                <Websocket url="wss://71wrpotbp9.execute-api.us-east-2.amazonaws.com/prod"
                           onOpen={this.openHandler}
                           onMessage={this.messageHandler}
                           reconnect={true}
                           debug={true}
                           ref={ws => {
                               this.wsReference = ws;
                           }} />
            </div>
        );
    }
}

export default App;
