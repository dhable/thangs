import React, {useState} from 'react';
import styled from 'styled-components';
import Websocket from 'react-websocket';

import ApplicationBar from './components/ApplicationBar';
import Copyright from './components/Copyright';
import PlayerControls from './components/PlayerControls';
import GameBoard from './components/GameBoard';
import LoadingBackdrop from './components/LoadingBackdrop';

const AppContainer = styled.div`
        display: flex;
        flex-direction: column;
    `,
    AppBar = styled(ApplicationBar)`
        flex: 1;
    `,
    MainContent = styled.div`
        flex: 3;
    `,
    Footer = styled.div`
        flex: 1;
    `,
    Grid = styled.div`
        display: flex;
        margin: 1em;
        align-items: stretch;
        align-content: stretch;
    `,
    Left = styled.div`
        min-width: 17em;
        max-width: 20em;
    `,
    Right = styled.div`
        flex-grow: 1;
    `;

function App() {
    const [isConnected, setConnected] = useState(false);
    const [wsRef, setWsRef] = useState(null);

    // Stateful websocket methods
    const wsSend = (obj) => {
        if (wsRef) {
            wsRef.sendMessage(JSON.stringify(obj));
        }
    };

    const handleOnOpen = () => {
//        wsSend({
//            type: 'request',
//            tx: 'create_game'
//        });
        setConnected(true);
    };

    const handleOnMessage = function(msgString) {
        let message = JSON.parse(msgString);
        if (message.type !== 'response') {
            console.warn('Inbound websocket message was not of response type: ' + msgString);
        }

        switch (message.tx) {
            case 'create_game': // {type: 'response', tx: 'create_game', gameId: '...'}
                setConnected(true);
                break;

            case 'invite_player': // {type: 'response', tx: 'invite_player', playerId: '...'}
                break;

            case 'start_round': // {type: 'response', 'tx': 'start_round', q: '...'}
                break;

            case 'answer_event': // {type: 'response', tx: 'answer_event', count: 4, total: 8}
                break;

            case 'end_round': // {type: 'response', tx: 'end_round', answers: ['...', '...', ...]}
                break;

            case 'kick_player': // {type: 'response', tx: 'kick_player', players: [...]}}
                break;

            default:
                console.warn('Inbound message specifies an unknown tx: ' + msgString);
        }
    };

    return (
        <AppContainer>
            <LoadingBackdrop isConnected={isConnected} />
            <AppBar />
            <MainContent>
                <Grid>
                    <Left>
                        <PlayerControls />
                    </Left>
                    <Right>
                        <GameBoard />
                    </Right>
                </Grid>
            </MainContent>
            <Footer>
                <Copyright />
            </Footer>
            <Websocket url="wss://71wrpotbp9.execute-api.us-east-2.amazonaws.com/prod"
                       onOpen={handleOnOpen}
                       onMessage={handleOnMessage}
                       reconnect={true}
                       debug={true}
                       ref={setWsRef} />
        </AppContainer>
    );
}

export default App;
