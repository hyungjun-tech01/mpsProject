import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    FaxOutlined,
    PeopleOutline,
    PlagiarismOutlined,
    Inventory2Outlined
 } from '@mui/icons-material';

export const SideMenuList = [
    { name : 'dashboard', title : 'Dashboard', href: '/', icon: SpaceDashboardOutlined },
    { name : 'user', title : 'Users', href: '/user', icon: PersonOutlined },
    { name : 'device', title : 'Devices', href: '/device', icon: PrintOutlined },
    { name : 'group', title : 'Groups', href: '/group/device', icon: PeopleOutline },
    { name : 'document', title : 'Documents', href: '/document/fax', icon: Inventory2Outlined },
    { name : 'logs', title : 'Logs', href: '/logs/auditlogs', icon: PlagiarismOutlined },
]

export const BASE_PATH = `http://localhost:37000`;