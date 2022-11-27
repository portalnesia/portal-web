import React from 'react'
import type {DialogProps as Props,Theme } from '@mui/material'
import Dialogg from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogTitle from '@mui/material/DialogTitle'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import {useTheme} from '@mui/material/styles'
import { Close } from '@mui/icons-material'
import { Div } from './Dom'

export interface DialogProps extends Props {
  handleClose?(): void
  loading?: boolean
  title?: string
  titleWithClose?:boolean
}

/**
 * 
 * Custom Dialog Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function Dialog({handleClose,loading,onClose:_,fullScreen,maxWidth="sm",children,title,titleWithClose=true,...other}: DialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark"
    const sm = useMediaQuery((t: Theme)=>t.breakpoints.down('sm'));

    const onClose = React.useCallback((event: {}, reason: "backdropClick" | "escapeKeyDown")=>{
        if(reason === 'escapeKeyDown' && handleClose && !loading) handleClose();
    },[handleClose,loading])

    return (
      <Dialogg {...(isDark  ? {PaperProps:{elevation:0}} : {})} fullScreen={typeof fullScreen === "boolean" ? fullScreen : sm} onClose={onClose} fullWidth maxWidth={maxWidth} scroll='body' {...other}>
        {title && (
          <Div {...(!fullScreen ? {sx:{position:'sticky',top:0,left:0,width:'100%',backgroundColor:'background.paper',zIndex:1}} : {})}>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant='h5'>{title}</Typography>
                {titleWithClose && (
                  <Tooltip title={`Close (Esc)`}>
                    <IconButton disabled={loading} onClick={()=>onClose({},'escapeKeyDown')}>
                      <Close />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </DialogTitle>
          </Div>
        )}
        {children}
      </Dialogg>
    )
}