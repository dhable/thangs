import React, {useState} from 'react';
import {AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MoreIcon from '@material-ui/icons/MoreVert';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles(theme => ({
    root: {
    },
    title: {
        flexGrow: 1
    }
}));

function ApplicationBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
    const handleMenuClose = () => setMenuAnchorEl(null);

    const classes = useStyles();

    return (
        <AppBar position="static" className={classes.root} color="primary">
            <Toolbar variant="dense">
                <Typography variant="h6" color="inherit" noWrap className={classes.title} >
                    Game of....Thangs
                </Typography>
                <IconButton edge="end"
                            color="inherit"
                            onClick={handleMenuOpen}>
                    <MoreIcon/>
                </IconButton>
                <Menu open={isMenuOpen}
                      onClose={handleMenuClose}
                      anchorEl={menuAnchorEl}
                      anchorOrigin={{vertical: 'top',
                                     horizontal: 'right'}}
                      transformOrigin={{vertical: 'top',
                                        horizontal: 'right'}}
                      keepMounted >
                    <MenuItem>
                        <ListItemIcon>
                            <InfoIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="inherit">
                            About Game of...Thangs
                        </Typography>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <CreditCardIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="inherit">
                            Donate
                        </Typography>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <ExitToAppIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="inherit">
                            Quit
                        </Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export default ApplicationBar;