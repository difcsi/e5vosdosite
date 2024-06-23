import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import adminAPI from 'lib/api/adminAPI'
import { isAdmin } from 'lib/gates'
import Locale from 'lib/locale'

import { gated } from 'components/Gate'
import Button from 'components/UIKit/Button'

const locale = Locale({
    hu: {
        title: `${import.meta.env.VITE_EVENT_HU} Adminisztrátor`,
        system: 'Rendszer',
        cacheClear: 'Cache törlése',
        UsersDialog: {
            title: 'Felhasználók',
            description: 'Az összes felhasználó listája',
        },
        eventsDialog: {
            title: 'Események',
        },
        slots: {
            title: 'Sávok',
            button: 'Sávok kezelése',
        },
    },
    en: {
        title: `${import.meta.env.VITE_EVENT_EN} Admin`,
        system: 'System',
        cacheClear: 'Clear cache',
        UsersDialog: {
            title: 'Users',
            description: 'List of all users',
        },
        eventsDialog: {
            title: 'Events',
        },
        slots: {
            title: 'Slots',
            button: 'Manage slots',
        },
    },
})

const AdminPage = () => {
    const [clearCache] = adminAPI.useClearCacheMutation()
    const navigate = useNavigate()
    const [usersDialogOpen, setUsersDialogOpen] = useState(false)
    const [eventsDialogOpen, setEventsDialogOpen] = useState(false)
    return (
        <>
            <div className="mx-auto max-w-4xl">
                <h1 className="text-center text-4xl font-bold">
                    {locale.title}
                </h1>
                <div className="mt-4 flex gap-64">
                    <div className="">
                        <h3 className="mb-3 text-center text-2xl font-bold">
                            {locale.system}
                        </h3>
                        <Button
                            onClick={async () => {
                                await clearCache()
                            }}
                            variant="danger"
                            className="p-3"
                        >
                            {locale.cacheClear}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default gated(AdminPage, isAdmin)
