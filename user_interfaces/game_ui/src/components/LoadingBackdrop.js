import React from 'react';
import {Backdrop, CircularProgress} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff'
    }
}));

function LoadingBackdrop(props) {
    const {isConnected} = props;

    const classes = useStyles();
    const durationConf = {appear: 500, exit: 2000};

    return (
        <Backdrop className={classes.backdrop}
                  transitionDuration={durationConf}
                  open={!isConnected}>
            <CircularProgress />

        </Backdrop>
    );
}

export default LoadingBackdrop;