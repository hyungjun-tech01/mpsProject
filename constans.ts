import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    PeopleOutline,
    PlagiarismOutlined,
 } from '@mui/icons-material';

export const SideMenuList = [
    { name : 'Dashboard', href: '/dashboard', icon: SpaceDashboardOutlined },
    { name : 'Users', href: '/user', icon: PersonOutlined },
    { name : 'Devices', href: '/device', icon: PrintOutlined },
    { name : 'Groups', href: '/group', icon: PeopleOutline },
    { name : 'Audit Logs', href: '/auditlog', icon: PlagiarismOutlined },
]

export const BASE_PATH = `http://localhost:37000`;