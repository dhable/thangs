import React from 'react';
import { TextField, Button, TextareaAutosize } from '@material-ui/core';
import Websocket from "react-websocket";

class CreateGame extends React.Component {

    handleSubmit(event) {
        event.preventDefault();
        let name = document.getElementById("name").value;
        let txtnums = document.getElementById("phoneNums").value
                                   .split("\n").map(s => s.trim()).filter(s => s.length > 0);
        let { sendFn } = this.props;
        sendFn({action: "create_game", name, txtnums});
    }


    render() {
        return (
            <form autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>
                <TextField id="name"
                           required
                           label="Match Name (required)"
                           type="search"
                           variant="filled" />
                <br/><br/>
                <TextareaAutosize id="phoneNums"
                                  rowsMin={8}
                                  rowsMax={16}
                                  placeholder="Player Phone Numbers"/>
                <br/><br/>
                <Button type="submit"
                        variant="contained"
                        size="large">
                    Start Game
                </Button>

            </form>
        );
    }
}


export default CreateGame;