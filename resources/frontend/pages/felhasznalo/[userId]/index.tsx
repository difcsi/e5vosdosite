import { useParams } from 'react-router-dom'

import baseAPI from 'lib/api'

import Loader from 'components/UIKit/Loader'
import UserCRUD from 'components/User/CRUD'

const UserPage = () => {
    const { userId } = useParams()
    const { data: shownUser } = baseAPI.useGetUserQuery({ id: Number(userId) })
    if (!shownUser) return <Loader />
    return <UserCRUD.Reader value={shownUser} />
}

export default UserPage
