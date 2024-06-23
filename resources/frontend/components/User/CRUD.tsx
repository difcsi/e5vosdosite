import useUser from 'hooks/useUser'
import { useCallback } from 'react'

import { CRUDFormImpl, CRUDInterface } from 'types/misc'
import { User } from 'types/models'

import baseAPI from 'lib/api'
import adminAPI from 'lib/api/adminAPI'
import { isAdmin, isTeacher } from 'lib/gates'
import Locale from 'lib/locale'

import UserForm from 'components/Forms/UserForm'
import Loader from 'components/UIKit/Loader'

export type UserFormValues = Pick<
    User,
    'id' | 'name' | 'email' | 'img_url' | 'e5code' | 'ejg_class'
>

const locale = Locale({
    hu: {
        create: 'Felhasználó létrehozása',
        edit: 'Felhasználó szerkesztése',
    },
    en: {
        create: 'Create user',
        edit: 'Edit user',
    },
})

const UserCreator = ({
    value = {},
    ...rest
}: CRUDFormImpl<User, Partial<UserFormValues>>) => {
    const [createUser] = adminAPI.useCreateUserMutation()
    const onSubmit = useCallback(
        async (user: UserFormValues) => {
            await createUser(user)
        },
        [createUser]
    )
    return (
        <UserForm
            initialValues={{
                id: value.id ?? 0,
                e5code: value.e5code ?? '',
                email: value.email ?? '',
                ejg_class: value.ejg_class ?? '',
                img_url: value.img_url ?? '',
                name: value.name ?? '',
            }}
            onSubmit={onSubmit}
            submitLabel={locale.create}
            resetOnSubmit={true}
            {...rest}
        />
    )
}

const UserUpdater = ({
    value: user,
    ...rest
}: CRUDFormImpl<User, UserFormValues>) => {
    const [updateUser] = adminAPI.useUpdateUserMutation()
    const onSubmit = useCallback(
        async (user: UserFormValues) => {
            await updateUser(user)
        },
        [updateUser]
    )
    return (
        <UserForm
            initialValues={user}
            onSubmit={onSubmit}
            submitLabel={locale.edit}
            enableReinitialize={true}
            {...rest}
        />
    )
}

const UserReader = ({
    value: user,
    ...rest
}: CRUDFormImpl<User, UserFormValues> & {
    value: User
}) => {
    const { user: currentUser } = useUser(false)
    const [getUser, { data: apiUser, isFetching }] =
        baseAPI.useLazyGetUserQuery()
    if (
        currentUser &&
        (currentUser.id === user.id ||
            isTeacher(currentUser) ||
            isAdmin(currentUser)) &&
        (!user.activity || !user.teams || !user.permissions) &&
        !isFetching &&
        !apiUser
    ) {
        getUser({ id: user.id })
    }
    const usedUser = apiUser ?? user
    if (!usedUser) return <Loader />
    return <></>
}

const UserCRUD: CRUDInterface<User, UserFormValues> = {
    Creator: UserCreator,
    Updater: UserUpdater,
    Reader: UserReader,
}
export default UserCRUD
