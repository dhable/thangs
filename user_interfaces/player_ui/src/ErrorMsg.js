import React from 'react';
import './ErrorMsg.css';
import { Alert, AlertTitle } from "@material-ui/lab";

function ErrorMsg() {
    return (
        <div className="AppError">
            <Alert severity="error" >
                <AlertTitle>
                    Uh oh, failed to load the game.
                </AlertTitle>
                Part of the link sent to you as a text message contains useful information for
                connecting you to the game. Either you left off part when copy/pasting or somehow the
                necessary bits didn't make it. Clicking on the link in the text message is the easiest
                way to make it work.
            </Alert>
            <div className="ErrorImage">
                <img alt="Well now it's super sad that you can't see the funny gif. ;("
                     src="https://media.giphy.com/media/1BXa2alBjrCXC/giphy.gif"/>
            </div>
        </div>
    );

}

export default ErrorMsg;