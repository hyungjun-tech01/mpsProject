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
    { name : 'device', title : 'Devices', href: '/device/external_device_list', icon: PrintOutlined },
    { name : 'group', title : 'Groups', href: '/group', icon: PeopleOutline },
    { name : 'auditlog', title : 'Audit Logs', href: '/auditlog', icon: PlagiarismOutlined },
]

export const BASE_PATH = `http://localhost:37000`;