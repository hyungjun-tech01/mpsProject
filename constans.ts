import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    PeopleOutline,
    PlagiarismOutlined,
    Inventory2Outlined,
    ArticleOutlined
} from '@mui/icons-material';



export const SideMenuList = {
    admin: [
        { name: 'dashboard', title: '대쉬보드', href: '/', icon: SpaceDashboardOutlined },
        { name: 'user', title: '사용자', href: '/user', icon: PersonOutlined },
        { name: 'device', title: '출력장치', href: '/device', icon: PrintOutlined },
        { name: 'group', title: '그룹', href: '/group/device', icon: PeopleOutline },
        { name: 'document', title: '문서', href: '/document/fax', icon: Inventory2Outlined },
        { name: 'logs', title: '로그', href: '/logs/auditlogs', icon: PlagiarismOutlined },
    ],
    user: [
        { name: 'dashboard', title: '대쉬보드', href: '/', icon: SpaceDashboardOutlined },
        { name: 'device', title: '출력장치', href: '/device', icon: PrintOutlined },
        { name: 'document', title: '문서', href: '/document/fax', icon: Inventory2Outlined },
        { name: 'print', title: '출력 리스트', href: '/print', icon: ArticleOutlined },
    ]
}

export const BASE_PATH = `http://localhost:37000`;