import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";


export const AppContext = createContext();

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true

    const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
    const [isLoggedin, setIsloggedin] = useState(false)
    const [userData, setUserdata] = useState(null)



    const getAuthUser = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/is-auth')
            if (data.success) {
                setIsloggedin(true)
                getUserdata()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    // Get user data
    const getUserdata = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data')
            if (data.success) {
                setUserdata(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }


    useEffect(() => {
        getAuthUser()
    }, [])


    const value = {
        backendUrl,
        isLoggedin, setIsloggedin,
        userData, setUserdata,
        getUserdata, getAuthUser,
    }


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

