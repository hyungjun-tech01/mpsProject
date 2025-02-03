import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    PeopleOutline,
    PlagiarismOutlined,
 } from '@mui/icons-material';

export const SideMenuList = [
    { name : 'dashboard', title : 'Dashboard', href: '/', icon: SpaceDashboardOutlined },
    { name : 'user', title : 'Users', href: '/user', icon: PersonOutlined },
    { name : 'device', title : 'Devices', href: '/device', icon: PrintOutlined },
    { name : 'group', title : 'Groups', href: '/group', icon: PeopleOutline },
    { name : 'logs', title : 'Logs', href: '/logs/printlogs', icon: PlagiarismOutlined },
]

export const BASE_PATH = `http://localhost:37000`;