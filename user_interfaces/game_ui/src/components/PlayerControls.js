import React, {useState} from 'react';
import styled from 'styled-components';
import {Paper, List, ListItem, ListItemText, ListItemAvatar, Typography, Button,
        ListSubheader, Divider, Fab, Avatar} from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddBox';
import ImageIcon from '@material-ui/icons/Image';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import AddPlayerDialog from './AddPlayerDialog';

const PlayerControlContainer =styled(Paper)`
    padding: 0.5em;
`;

const ButtonContainer = styled.div`
    text-align: center;
    margin: 1em;
`;

function PlayerInfo(props) {
    const {name, phone, status} = props;

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar>
                    <ImageIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={name}
                          secondary={phone} />
            <Button onClick={ () => alert("not implemented")} >
                <HighlightOffIcon />
            </Button>
        </ListItem>
    );
}

function PlayerControls() {
    // mock stuff
     const players = [
            {"name": "John", "phone": "123456789", "status": "connected"},
            {"name": "Bob", "phone": "123456789", "status": "disconnected"}
        ];

        const playerInfoDom = [];
        players.forEach(playerProps => {
            playerInfoDom.push(
                <PlayerInfo {...playerProps} />
            );
        });
    // end mock stuff

    const [playerDialogOpen, setPlayerDialogOpen] = useState(false);

    const handlePlayerDialogOpen = () => setPlayerDialogOpen(true);
    const handlePlayerDialogClose = () => setPlayerDialogOpen(false);
    const handlePlayerDialogAdd = () => setPlayerDialogOpen(false);

    return (
        <PlayerControlContainer>
            <List subheader={<ListSubheader>Players</ListSubheader>}>
                <Divider />
                {playerInfoDom}
            </List>
            <ButtonContainer>
                <Button size="medium"
                        variant="contained"
                        color="primary"
                        onClick={handlePlayerDialogOpen}
                        startIcon={<AddIcon />}>
                    Add Player
                </Button>
            </ButtonContainer>
            <AddPlayerDialog open={playerDialogOpen}
                             onAdd={handlePlayerDialogAdd}
                             onClose={handlePlayerDialogClose} />
        </PlayerControlContainer>
    );
}

export default PlayerControls;