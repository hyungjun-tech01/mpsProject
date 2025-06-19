'use client';

import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// import Badge from '@mui/material/Badge';
import AccountCircle from '@mui/icons-material/AccountCircle';
// import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
// import NotificationsIcon from '@mui/icons-material/Notifications';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import { useColorScheme } from '@mui/material/styles';
import Link from 'next/link';
import { logout } from "@/app/components/auth/actions";
import { useSession } from 'next-auth/react';

interface IHeader {
    extendSideNav: () => void;
}

export default function Header({ extendSideNav }: IHeader) {
    const session = useSession();
    const userName = session?.data?.user.name ?? "Unknown";

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const { mode, setMode } = useColorScheme();
    const [ isDarkMode, setIsDarkMode ] = useState<boolean>(mode === 'dark');
    const handleThemeModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked) {
            console.log('set dark mode');
            setMode('dark');
            setIsDarkMode(true);
        }
        else {
            console.log('set light mode');
            setMode('light');
            setIsDarkMode(false);
        }
    }

    const menuId = 'primary-search-account-menu';
    // const mobileMenuId = 'primary-search-account-menu-mobile';

    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem>
                <div>
                    <span className='mr-3 font-medium'>테마</span>
                    <span className='text-gray-600'>Light</span>
                    <span>
                        <Switch
                            checked={isDarkMode}
                            onChange={handleThemeModeChange}
                            // inputProps={{ 'aria-label': 'controlled' }}
                        />
                    </span>
                    <span className='text-gray-600'>Dark</span>
                </div>
            </MenuItem>
            <MenuItem>
                <div onClick={() => logout()}>
                    <span className='mr-3 font-medium'>로그아웃</span>
                </div>
            </MenuItem>
        </Menu>
    );

    return (
        <Box className="grow-0">
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon className="text-lime-50" onClick={extendSideNav} />
                    </IconButton>
                    <Typography variant="h6" component="div" className="grow pl-1 text-lime-50">
                        MPS Next
                    </Typography>
                    <Box className="grow" />
                    <Box className="hidden gap-2 md:flex">
                        {/* <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                            <Badge badgeContent={4} color="error">
                                <MailIcon className="text-lime-50" />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon className="text-lime-50" />
                            </Badge>
                        </IconButton> */}
                        <Link
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            href={`/account`}
                            // onClick={handleProfileMenuOpen}
                            className="inherit flex items-center gap-2"
                        >
                            <AccountCircle className="text-lime-50" />
                            <span className="text-lime-50">{userName}</span>
                        </Link>
                    </Box>
                    <Box className="hidden md:flex">
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon className="text-lime-50" />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </Box>
    )
};