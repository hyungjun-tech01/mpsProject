import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    FaxOutlined,
    PeopleOutline,
    PlagiarismOutlined,
 } from '@mui/icons-material';

export const SideMenuList = [
    { name : 'dashboard', title : 'Dashboard', href: '/', icon: SpaceDashboardOutlined },
    { name : 'user', title : 'Users', href: '/user', icon: PersonOutlined },
    { name : 'device', title : 'Devices', href: '/device', icon: PrintOutlined },
    { name : 'fax', title : 'Fax', href: '/fax', icon: FaxOutlined },
    { name : 'group', title : 'Groups', href: '/group/device', icon: PeopleOutline },
    { name : 'logs', title : 'Logs', href: '/logs/auditlogs', icon: PlagiarismOutlined },
]

export const BASE_PATH = `http://localhost:37000`;