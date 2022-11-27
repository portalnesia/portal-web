import Logo, { LogoProps } from "@comp/Logo";
import { Div } from "@design/components/Dom";
import Iconify from "@design/components/Iconify";
import Link from "@design/components/Link";
import AccountPopover from "@layout/AccountPopover";
import { NAVBAR_HEIGHT,navbarMenu, INavbarChild } from "@layout/navbar.config";
import ThemePopover from "@layout/ThemePopover";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Grid from "@mui/material/Grid";
import Hidden from "@mui/material/Hidden";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {NavbarPopover} from "@layout/NavbarPopover";
import Fade from "@mui/material/Fade";
import IconButtonActive from "@comp/IconButtonActive";
import { alpha } from '@mui/system/colorManipulator';
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import MenuPopover from "@design/components/MenuPopover";

const RootStyle = styled(AppBar,{shouldForwardProp:prop=>prop!=="scrolled"})<{scrolled?: boolean}>(({ theme,scrolled }) => ({
    top:0,
    backgroundColor: theme.palette.background.paper,
    ...(scrolled ? {} : {boxShadow:"none"}),
    transition: theme.transitions.create('top')
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    height: NAVBAR_HEIGHT,
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 5)
    },
}));

const MenuDesktop = styled(ButtonBase,{
    shouldForwardProp:(prop:string)=>!['component','active','childActive'].includes(prop)
})<{component?:string,active?:boolean,childActive?:boolean}>(({theme,active,childActive})=>({
    color:theme.palette.text.primary,
    width:80,
    height:50,
    borderRadius:5,
    '&:hover':{
        backgroundColor:theme.palette.action.hover
    },
    ...(active ? {
        '& svg':{
            color:theme.palette.primary.main
        }
    } : {}),
    ...(childActive && {
        '&:before': {
            zIndex: 1,
            content: "''",
            width: '100%',
            height: '100%',
            borderRadius:5,
            position: 'absolute',
            backgroundColor: alpha(theme.palette.primary.main, 0.22)
        }
    })
}))

interface NavbarMenuDesktopProps {
    data: (typeof navbarMenu)[number]
}

function MenuChild({data}: {data: INavbarChild}) {
    const {name,link,desc} = data;
    return (
        <Link key={name} href={link} legacyBehavior passHref>
            <MenuDesktop component='a' sx={{p:2,width:'100%',borderRadius:2}} className='no-underline'>
                <ListItemText primary={name} secondary={desc} />
            </MenuDesktop>
        </Link>
    )
}

function NavbarMenuDesktop({data}: NavbarMenuDesktopProps) {
    const router = useRouter();
    const anchorRef = useRef(null);
    const {name,child,link,tooltip,icon,iconActive} = data;
    const pathname = router.pathname
    const isActive = useMemo(() => {
        const a = (link === '/' ? link === pathname : new RegExp((link||'/'),'i').test(pathname||'/'))
        return a;
    },[pathname,link]);
    const [open,setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(e=>!e);
    },[setOpen]);

    useEffect(()=>{
        function routerEvent() {
            setOpen(false);
        }
        router.events.on('routeChangeStart',routerEvent);
        return ()=>{
            router.events.off('routeChangeStart',routerEvent)
        }
    },[router])

    // TODO - Add child
    if(child) {
        return (
            <>
                <Tooltip title={tooltip||name}>
                    <MenuDesktop ref={anchorRef} className='no-underline' sx={{px:2}} childActive={open} onClick={handleOpen}>
                        <Iconify icon={open && iconActive ? iconActive : icon} sx={{width:35,height:35,...(open ? {color:'primary.main'} : {})}} />
                    </MenuDesktop>
                </Tooltip>
                <MenuPopover arrow={false} transformOrigin={undefined} open={open} onClose={handleOpen} anchorEl={anchorRef.current} paperSx={{py:1,px:2,pb:2,width:'60%',minWidth:800}}>
                    <Typography variant='h5' sx={{mb:2}}>{name}</Typography>
                        
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Box bgcolor='background.default' p={2} borderRadius={2}>
                                {child.filter((_,i)=>i%2 === 0).map(c=>(
                                    <MenuChild key={c.name} data={c} />
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box bgcolor='background.default' p={2} borderRadius={2}>
                                {child.filter((_,i)=>i%2 !== 0).map(c=>(
                                    <MenuChild key={c.name} data={c} />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>


                </MenuPopover>
            </>
        );
    }

    return (
        <Div sx={{height:'100%',position:'relative',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <Link href={link} passHref legacyBehavior>
                <Tooltip title={tooltip||name}>
                    <MenuDesktop className='no-underline' active={isActive} component='a' sx={{px:2}}>
                        <Iconify icon={isActive && iconActive ? iconActive : icon} sx={{width:35,height:35}} />
                    </MenuDesktop>
                </Tooltip>
            </Link>
            <Box {...(isActive ? {} : {display:'none'})} width='100%' height={4} position='absolute' sx={{backgroundColor:'primary.main'}} bottom={0} left={0} />
        </Div>
            
    )
}

const SearchComp = styled(Stack)(({theme})=>({
    borderRadius:16,
    backgroundColor:theme.palette.action.hover,
    '&:hover':{
        backgroundColor:theme.palette.divider,
    },
}))
function Search() {
    const router = useRouter();
    const query = router.query?.q
    const [q,setQ] = useState("");
    const [open,setOpen] = useState(false);

    useEffect(()=>{
        if(typeof query === "string") setQ(decodeURIComponent(query))
    },[query])

    const handleSearch = useCallback((e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setOpen(false);
        router.push({pathname:`/search`,query:{q}},`/search?q=${encodeURIComponent(q)}`);
    },[router,q])

    return (
        <form onSubmit={handleSearch}>
            <Hidden only={['md','xs']}>
                <SearchComp direction='row' spacing={1} alignItems='center' sx={{px:2,py:1}}>
                    <InputBase
                        value={q}
                        onChange={(e)=>setQ(e.target.value)}
                        placeholder="Search..."
                        inputProps={{ 'aria-label': 'Search'}} />
                </SearchComp>
            </Hidden>
            <Hidden only={['lg','sm','xl']}>
                <Tooltip title="Search"><IconButtonActive open={open} onClick={()=>setOpen(!open)}>
                    <Iconify icon='material-symbols:search' sx={{width:25,height:25}} />
                </IconButtonActive></Tooltip>
                
                <Fade in={open}>
                    <Box position='absolute' bgcolor='background.paper' px={2} py={1} width='100%' left={0} top={64}>
                        <SearchComp spacing={1} alignItems='center' sx={{px:2,py:1}}>
                        <InputBase
                            sx={{width:'100%'}}
                            value={q}
                            onChange={(e)=>setQ(e.target.value)}
                            placeholder="Search..."
                            inputProps={{ 'aria-label': 'Search'}} />
                        </SearchComp>
                    </Box>
                </Fade>
            </Hidden>
        </form>
    )
}

export interface NavbarProps {
    logo?: LogoProps
}

export default function DefaultNavbar({logo}: NavbarProps) {
    const [scrolled,setScrolled] = useState(false);
    const trigger = useScrollTrigger({
        target: typeof window !== 'undefined' ? window : undefined,
    });

    useEffect(()=>{
        function onScroll() {
          const scroll = document?.documentElement?.scrollTop || document.body.scrollTop;
          if(scroll > 30) {
            setScrolled(true)
          } else {
            setScrolled(false)
          }
        }
        window.addEventListener('scroll',onScroll);
    
        return ()=>window.removeEventListener('scroll',onScroll);
    },[])

    return (
        <RootStyle scrolled={scrolled} elevation={3} position='sticky'>
            <ToolbarStyle>
                <Grid container spacing={2} sx={{height:80}}>
                    <Grid item xs={6} lg={3}>
                        <Stack direction="row" alignItems="center" justifyContent='flex-start' spacing={1.5} height='100%'>
                            <Box sx={{ pr:2,mt:1,display: 'inline-flex' }}>
                                <Logo svg={{size:35}} {...logo} />
                            </Box>
                            <Hidden only={['md','xs']}>
                                <Search />
                            </Hidden>
                            <Hidden only={['xs','sm','lg','xl']}>
                                {navbarMenu.map(m=>(
                                    <NavbarMenuDesktop data={m} key={m.name} />
                                ))}
                            </Hidden>
                        </Stack>
                    </Grid>
                    <Hidden lgDown>
                        <Grid item xs={6} lg={6}>
                            <Stack direction="row" alignItems="center" justifyContent='center' mx={2} height='100%'>
                                {navbarMenu.map(m=>(
                                    <NavbarMenuDesktop data={m} key={m.name} />
                                ))}
                            </Stack>
                        </Grid>
                    </Hidden>
                    <Grid item xs={6} lg={3}>
                        <Stack direction="row" alignItems="center" justifyContent='flex-end' spacing={1.5} height='100%'>
                            <Hidden only={['sm','lg','xl']}>
                                <Search />
                            </Hidden>

                            <Hidden mdUp>
                                <NavbarPopover />
                            </Hidden>

                            <ThemePopover />
                            <AccountPopover />
                        </Stack>
                    </Grid>
                </Grid>
            </ToolbarStyle>
        </RootStyle>
    )
}