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
    const [gameId, setGameId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [wsRef, setWsRef] = useState(null);

    // Stateful websocket methods
    const wsSend = (obj) => {
        if (wsRef) {
            wsRef.sendMessage(JSON.stringify(obj));
        }
    };

    const handleOnOpen = () => {
        wsSend({
            type: 'create-game',
            tx: new Date().getTime()
        });
        setConnected(true);
    };

    const handleOnMessage = function(msgString) {
        let message = JSON.parse(msgString);
        switch (message.type) {
            case 'create-game': // {type: 'response', tx: 'create_game', gameId: '...'}
                setConnected(true);
                setGameId(message.gameId);
                break;

            case 'invite-player': // {type: 'response', tx: 'invite_player', playerId: '...'}
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
                console.warn('Inbound message specifies an unknown type or type is missing: ' + msgString);
        }
    };

    return (
        <AppContainer>
            <LoadingBackdrop isConnected={isConnected} />
            <AppBar />
            <MainContent>
                <Grid>
                    <Left>
                        <PlayerControls players={players} />
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
