import React from 'react';
import styled from 'styled-components';
import {Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions,
        Button} from '@material-ui/core';

function AddPlayerDialog(props) {
    const {open, onClose, onAdd} = props;

    return (
        <Dialog open={open}>
            <DialogTitle>Who do you want to invite?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Adding a new player will cause a text message with their individual game link to be
                    sent via SMS. Don&apos;t spam your friends.
                </DialogContentText>
                <TextField autoFocus
                           label="Name"
                           fullWidth />
                <TextField label="Phone Number"
                           type="phone"
                           required
                           fullWidth />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} >
                    Cancel
                </Button>
                <Button onClick={onAdd} >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddPlayerDialog;