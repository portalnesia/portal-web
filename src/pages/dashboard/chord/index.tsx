import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import { accountUrl, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Scrollbar from "@design/components/Scrollbar";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import { ChordPagination } from "@model/chord";
import useTablePagination from "@design/hooks/TablePagination";
import { TableSWRPages } from "@comp/SWRPages";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import Label from "@design/components/Label";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Delete, Edit } from "@mui/icons-material";
import TablePagination from "@mui/material/TablePagination";
import Button from "@comp/Button";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"));

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    return {
        props:{
            data:{}
        }
    }
})

export default function ChordDashIndex() {
    const {page,rowsPerPage,...tablePagination} = useTablePagination(true,10);
    const {data,error,mutate} = useSWR<PaginationResponse<ChordPagination>>(`/v2/chord/dashboard?page=${page}&per_page=${rowsPerPage}`);
    const confirmRef = React.useRef<ConfirmationDialog>(null)
    const [delChord,setDelete] = React.useState<ChordPagination>();
    const [loading,setLoading] = React.useState(false);
    const setNotif = useNotification();
    const {del} = useAPI();

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage]);

    const handleDelete = React.useCallback((chord: ChordPagination)=>async()=>{
        try {
            setDelete(chord)
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setLoading(true);
            await del(`/v2/chord/${chord.slug}`)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(false)
        }
    },[setNotif,del,mutate])
    
    return (
        <Pages title="Chord - Dashboard" canonical={`/dashboard/chord`} noIndex>
            <DashboardLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Chord</Typography>
                        <Link href={`/dashboard/chord/new`} passHref legacyBehavior><Button component='a' icon='add'>New</Button></Link>
                    </Stack>
                </Box>

                <Box>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Artist</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align='right'>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableSWRPages loading={!data&&!error} error={error} colSpan={5}>
                                    {data && data?.data?.length > 0 ? data?.data?.map((d,i)=>(
                                        <TableRow key={d.slug}>
                                            <TableCell>{getNumber(i)}</TableCell>
                                            <TableCell><Link href={`/chord/artist/${d.slug_artist}`}><Span sx={{color:'customColor.link'}}>{d.artist}</Span></Link></TableCell>
                                            <TableCell><Link href={`/chord/${d.slug}`}><Span sx={{color:'customColor.link'}}>{d.title}</Span></Link></TableCell>
                                            <TableCell><Label color={d.publish ? 'secondary':'default'} variant='filled'>{d.publish ? "Published" : "Draft"}</Label></TableCell>
                                            <TableCell align="right">
                                                <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                                    <Tooltip title="Edit">
                                                        <Link href={`/dashboard/chord/${d.slug}`} passHref legacyBehavior>
                                                            <IconButton aria-label="Edit" component='a'>
                                                                <Edit />
                                                            </IconButton>
                                                        </Link>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton aria-label="Delete" onClick={handleDelete(d)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <BoxPagination>
                                                    <Typography>No data</Typography>
                                                </BoxPagination>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableSWRPages>
                            </TableBody>
                        </Table>
                    </Scrollbar>
                    <TablePagination page={page-1} rowsPerPage={rowsPerPage} count={data?.total||0} {...tablePagination} />
                </Box>
            </DashboardLayout>
            <ConfirmationDialog ref={confirmRef} body={delChord ? (
                <Typography>Delete chord <Span sx={{color:'customColor.link'}}>{delChord.title}</Span> by <Span sx={{color:'customColor.link'}}>{delChord.artist}</Span>?</Typography>
            ) : undefined} />
            <Backdrop open={loading} />
        </Pages>
    )
}