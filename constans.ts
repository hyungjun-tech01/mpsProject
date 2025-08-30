import {
    SpaceDashboardOutlined,
    PersonOutlined,
    PrintOutlined,
    PeopleOutline,
    PlagiarismOutlined,
    Inventory2Outlined,
    ArticleOutlined,
    SettingsOutlined,
    PersonAddOutlined,
    RuleOutlined,
    AnalyticsOutlined
} from '@mui/icons-material';



export const SideMenuList = {
    admin: [
        { name: 'dashboard', title: '대쉬보드', href: '/', icon: SpaceDashboardOutlined },
        { name: 'user', title: '사용자', href: '/user', icon: PersonOutlined },
        { name: 'device', title: '출력장치', href: '/device', icon: PrintOutlined },
        { name: 'group', title: '그룹', href: '/group/device', icon: PeopleOutline },
        { name: 'document', title: '문서', href: '/document/fax', icon: Inventory2Outlined },
        { name: 'analysis', title: '통계', href: '/analysis/privacy', icon: AnalyticsOutlined },
        { name: 'logs', title: '로그', href: '/logs/auditlogs', icon: PlagiarismOutlined },
        { 
            name: 'settings', 
            title: '설정', 
            href: '', 
            icon: SettingsOutlined ,
            submenu:[
                { name: 'registerUsers', 
                  title: '사용자 일괄 등록', 
                  href: '/settings/registerUsers' ,
                  icon: PersonAddOutlined  
                },
                { name: 'regularExprPrivateInfo', 
                    title: '정규식/보안단어 관리', 
                    href: '/settings/regularExprPrivateInfo' ,
                    icon: RuleOutlined   
                },
            ]
        },
    ],
    security_manager: [
        { name: 'dashboard', title: '대쉬보드', href: '/', icon: SpaceDashboardOutlined },
        { name: 'device', title: '출력장치', href: '/device', icon: PrintOutlined },
        { name: 'group', title: '그룹', href: '/group/device', icon: PeopleOutline },
        { name: 'document', title: '문서', href: '/document/fax', icon: Inventory2Outlined },
        { name: 'print', title: '출력 리스트', href: '/print', icon: ArticleOutlined },
        { name: 'logs', title: '로그', href: '/logs/auditlogs', icon: PlagiarismOutlined },
    ],
    manager: [
        { name: 'dashboard', title: '대쉬보드', href: '/', icon: SpaceDashboardOutlined },
        { name: 'device', title: '출력장치', href: '/device', icon: PrintOutlined },
        { name: 'group', title: '그룹', href: '/group/device', icon: PeopleOutline },
        { name: 'document', title: '문서', href: '/document/fax', icon: Inventory2Outlined },
        { name: 'print', title: '출력 리스트', href: '/print', icon: ArticleOutlined },
    ],
    user: [
        { name: 'dashboard', title: '대쉬보드', href: '/', icon: SpaceDashboardOutlined },
        { name: 'document', title: '문서', href: '/document/fax', icon: Inventory2Outlined },
        { name: 'print', title: '출력 리스트', href: '/print', icon: ArticleOutlined },
    ]
}

export const BASE_PATH = `http://127.0.0.1:37000`;