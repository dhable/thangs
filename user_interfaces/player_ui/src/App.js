import React from 'react';
import './App.css';
import url_parse from 'url-parse';
import ErrorMsg from './ErrorMsg';
import AnswerScreen from "./AnswerScreen";

function App() {
    let url_bits = url_parse(window.location);
    if (!url_bits.hash) {
        return (<ErrorMsg />);
    } else {
        return (
            <AnswerScreen playerToken={url_bits.hash}/>
        );
    }
}

export default App;
