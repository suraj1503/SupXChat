import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

const DeleteDialog = ({open, handleClose,deleteHandler,groupName}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle fontWeight={"600"}>Confirm Delete</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {`Are you sure you want to delete ${groupName}?`}
            </DialogContentText>
        </DialogContent>
        <DialogActions > 
            <Button onClick={handleClose}>No</Button>
            <Button color='error' onClick={deleteHandler} 
            sx={{
                border:"1px solid red",
                ":hover":{
                    bgcolor:"red",
                    color:"#fff"
                }
            }}
            >
                Yes
            </Button>
        </DialogActions>
    </Dialog>
  )
}

export default DeleteDialog