import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import baseAPI from 'lib/api'
import { useDispatch, useSelector } from 'lib/store'

const useUser = (redirect = true, destination?: string) => {
    const navigate = useNavigate()
    const token = useSelector((state) => state.auth.token)

    const [
        trigger,
        { data: user, isUninitialized, error, isLoading, isFetching, ...rest },
    ] = baseAPI.useLazyGetCurrentUserDataQuery()

    const location = useLocation()
    const dispatch = useDispatch()

    useEffect(() => {
        let redirectToLogin: string | undefined
        let redirectToStudentCode: string | undefined

        if (!redirect) {
            redirectToLogin = undefined
            redirectToStudentCode = undefined
        } else if (destination) {
            redirectToLogin = destination
            redirectToStudentCode = destination
        } else {
            redirectToLogin = '/login?next=' + location.pathname
            redirectToStudentCode = '/studentcode?next=' + location.pathname
        }

        if (
            (!token || (error && 'status' in error && error.status === 401)) &&
            redirectToLogin
        ) {
            navigate(redirectToLogin)
        }
        if (user && !user.e5code && redirectToStudentCode) {
            navigate(redirectToStudentCode)
        }
    }, [
        user,
        error,
        navigate,
        dispatch,
        redirect,
        destination,
        location.pathname,
        token,
    ])

    useEffect(() => {
        if (token) trigger()
    }, [token, trigger])

    return {
        user: user && !error && token ? user : undefined,
        error,
        isLoading,
        isFetching,
        refetch: trigger,
        isUninitialized,
        ...rest,
    }
}

export default useUser
