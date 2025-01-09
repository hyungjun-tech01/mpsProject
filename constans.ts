import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    PeopleOutline,
    PlagiarismOutlined,
 } from '@mui/icons-material';

export const SideMenuList = [
    { name : 'Dashboard', href: '/dashboard', icon: SpaceDashboardOutlined },
    { name : 'Users', href: '/users', icon: PersonOutlined },
    { name : 'Devices', href: '/devices', icon: PrintOutlined },
    { name : 'Groups', href: '/groups', icon: PeopleOutline },
    { name : 'Audit Logs', href: '/auditlogs', icon: PlagiarismOutlined },
]

export const BASE_PATH = `http://localhost:37000`;