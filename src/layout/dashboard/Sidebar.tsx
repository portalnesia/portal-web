import { styled } from '@mui/material/styles';
import { useEffect, useMemo } from 'react';
import {useRouter} from 'next/router'
import Link from '@design/components/Link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import config from '@src/config';
import { version } from '@src/version';
import { dashboardMenu, adminMenu, DRAWER_WIDTH } from '@layout/navbar.config';
import useResponsive from '@design/hooks/useResponsive';
import Scrollbar from '@design/components/Scrollbar';
import Logo from '@comp/Logo';
import NavSection from './NavSection';
import { FooterChild, FooterMenu, FooterRoot, MenuItem } from '@layout/default/Footer';
import { generalFooter } from '@layout/footer.config';
import Stack from '@mui/material/Stack';

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
      flexShrink: 0,
      width: DRAWER_WIDTH
    }
}));
  
const AccountStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5),
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    backgroundColor: theme.palette.grey[500_12]
}));

export interface DashboardSidebarProps {
    isOpenSidebar: boolean,
    onCloseSidebar(): void,
    title?: string,
    subtitle?: string
    adminPage?: boolean
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar, title, subtitle, adminPage}: DashboardSidebarProps) {
    const router = useRouter();
    const pathname = router.pathname;
    const isDesktop = useResponsive('up', 'lg');

    const indexPath = useMemo(()=>{
      return adminPage ? "/admin" : "/dashboard"
    },[adminPage])

    const navConfig = useMemo(()=>{
      return adminPage ? adminMenu : dashboardMenu;
    },[adminPage])

    useEffect(() => {
        if (isOpenSidebar) {
          onCloseSidebar();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const renderContent = useMemo(()=>(
        <Scrollbar
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
          }}
        >
          <Stack px={2.5} py={3} direction='row'>
            <Logo href='/' svg={{size:35}} />
          </Stack>
    
          {title && subtitle && (
            <Box sx={{ mb: 5, mx: 2.5 }}>
              <AccountStyle>
                {/*<Avatar src={account.photoURL} alt="photoURL" />*/}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                  </Typography>
                </Box>
              </AccountStyle>
            </Box>
          )}
    
        <NavSection indexPath={indexPath} navConfig={navConfig} />
    
        <Box sx={{ flexGrow: 1 }} />
    
        <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
            <FooterRoot>
                <FooterMenu>
                    {generalFooter.map((f)=>(
                        <MenuItem home={false} key={f.name} data={f} />
                    ))}
                </FooterMenu>
            </FooterRoot>
            <FooterRoot>
                <FooterMenu>
                    <FooterChild>
                        <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
                            <Link href='/'  property="dct:title" rel="cc:attributionURL">{config.title}</Link> © {(new Date().getFullYear())}
                        </span>
                    </FooterChild>
                    <FooterChild><span>{`v${version}`}</span></FooterChild>
                </FooterMenu>
            </FooterRoot>
          </Box>
        </Scrollbar>
    ),[title,subtitle,indexPath,navConfig]);

    return (
        <RootStyle>
            {!isDesktop && (
                <Drawer
                    open={isOpenSidebar}
                    onClose={onCloseSidebar}
                    PaperProps={{
                        sx: { width: DRAWER_WIDTH }
                    }}
                >
                    {renderContent}
                </Drawer>
            )}
    
            {isDesktop && (
                <Drawer
                    open
                    variant="persistent"
                    PaperProps={{
                        sx: {
                        width: DRAWER_WIDTH,
                        bgcolor: 'background.default',
                        borderRightStyle: 'dashed'
                        }
                    }}
                >
                    {renderContent}
                </Drawer>
            )}
        </RootStyle>
    );
}