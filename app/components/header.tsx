import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface IHeader {
    extendSideNav: () => void;
}

export default function Header( {extendSideNav}:IHeader ) {
    const menuId = 'primary-search-account-menu';
    const mobileMenuId = 'primary-search-account-menu-mobile';

    return (
        <Box sx={{ flexGrow: 0 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon onClick={extendSideNav}/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        MPS Project
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                        <Badge badgeContent={4} color="error">
                            <MailIcon />
                        </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                        >
                        <Badge badgeContent={17} color="error">
                            <NotificationsIcon />
                        </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            // onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                        <AccountCircle />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                        size="large"
                        aria-label="show more"
                        aria-controls={mobileMenuId}
                        aria-haspopup="true"
                        // onClick={handleMobileMenuOpen}
                        color="inherit"
                        >
                        <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    )
};