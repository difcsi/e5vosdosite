import { useState } from 'react'
import { Link } from 'react-router-dom'

import adminAPI from 'lib/api/adminAPI'
import eventAPI from 'lib/api/eventAPI'
import { isAdmin } from 'lib/gates'
import Locale from 'lib/locale'

import { gated } from 'components/Gate'
import Button from 'components/UIKit/Button'
import Dialog from 'components/UIKit/Dialog'

const locale = Locale({
    hu: {
        title: 'Sávok',
        create: 'Új sáv létrehozása',
        slots: {
            id: 'ID',
            name: 'Név',
            type: 'Típus',
            start: 'Kezdés',
            end: 'Vége',
            options: 'Opciók',
            edit: 'Szerkesztés',
            delete: 'Törlés',
        },
        deleteDialog: {
            title: 'Sáv törlése',
            description: 'Biztosan törölni szeretnéd a sávot?',
            delete: 'Igen, sáv törlése',
        },
    },
    en: {
        title: 'Slots',
        create: 'Create new slot',
        slots: {
            id: 'ID',
            name: 'Name',
            type: 'Type',
            start: 'Start',
            end: 'End',
            options: 'Options',
            edit: 'Edit',
            delete: 'Delete',
        },
        deleteDialog: {
            title: 'Delete slot',
            description: 'Are you sure you want to delete this slot?',
            delete: 'Yes, delete slot',
        },
    },
})

const SlotsPage = () => {
    const { data: slots } = eventAPI.useGetSlotsQuery()
    const [open, setOpen] = useState(false)
    const [deleteSlot] = adminAPI.useDeleteSlotMutation()
    const [slotToDelete, setSlotToDelete] = useState<number | null>(null)
    return (
        <>
            <Dialog
                title={locale.deleteDialog.title}
                open={open}
                onClose={() => setOpen(false)}
            >
                <p>{locale.deleteDialog.description}</p>
                <div className="mt-4 flex justify-end">
                    <Button
                        variant="primary"
                        className="mx-1"
                        onClick={async () => {
                            if (!slotToDelete) return
                            await deleteSlot({ id: slotToDelete })
                            setOpen(false)
                            setSlotToDelete(null)
                        }}
                    >
                        {locale.deleteDialog.delete}
                    </Button>
                </div>
            </Dialog>

            <div className="mx-auto max-w-4xl">
                <h1 className="text-center text-4xl font-bold">
                    {locale.title}
                </h1>
            </div>
            <div className="mx-auto mt-2 flex max-w-fit flex-col justify-center">
                <Link to="/admin/sav/uj">
                    <Button variant="primary">{locale.create}</Button>
                </Link>
                <table className="mt-2 w-auto table-auto">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                {locale.slots.id}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                {locale.slots.name}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                {locale.slots.type}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                {locale.slots.start}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                {locale.slots.end}
                            </th>
                            <th scope="col" className="px-6 py-3">
                                {locale.slots.options}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {slots?.map((slot) => (
                            <tr
                                key={slot.id}
                                className="border-gray-700 bg-gray-800"
                            >
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                                    {slot.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                                    {slot.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                                    {slot.slot_type}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                                    {slot.starts_at}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                                    {slot.ends_at}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                                    <Link to={`/admin/sav/${slot.id}/kezel`}>
                                        <Button variant="info" className="mx-1">
                                            {locale.slots.edit}
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        className="mx-1"
                                        onClick={() => {
                                            setOpen(true)
                                            setSlotToDelete(slot.id)
                                        }}
                                    >
                                        {locale.slots.delete}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default gated(SlotsPage, isAdmin)
