import { useAuthStore } from "../store/store";
import { Navigate } from "react-router-dom";

export const AuthorizeUser=({children})=>{
    const token=localStorage.getItem('token')

    if(!token)
    {
        return <Navigate to={'/'} replace={true}></Navigate>
    }

    return children;
}


export const ProtectRoute=({children})=>{

    const username=useAuthStore.getState().auth.username;
    if(!username)
    {
        return <Navigate to={'/'} replace={true}></Navigate>
    }
    return children
}