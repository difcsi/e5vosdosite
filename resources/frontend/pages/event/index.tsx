import useUser from 'hooks/useUser'
import { useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import eventAPI from 'lib/api/eventAPI'
import { isAdmin } from 'lib/gates'
import Locale from 'lib/locale'

import EventCard from 'components/EventCard'
import Button from 'components/UIKit/Button'
import Form from 'components/UIKit/Form'
import Loader from 'components/UIKit/Loader'

const locale = Locale({
    hu: {
        title: `${import.meta.env.VITE_EVENT_HU_SHORT} - Programok`,
        create: 'Program hozzadása',
        search: 'Keresés',
    },
    en: {
        title: `${import.meta.env.VITE_EVENT_EN_SHORT} - Events`,
        create: 'Create event',
        search: 'Search',
    },
})

const EventsPage = () => {
    const { user } = useUser(false)

    const { data: events, isFetching: isEventsFetching } =
        eventAPI.useGetEventsQuery()

    const [search, setSearch] = useState('')

    const filteredEvents = useMemo(() => {
        if (!events) return []

        return events.filter((event) => {
            return event.name.toLowerCase().includes(search.toLowerCase())
        })
    }, [events, search])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    if (!events) return <Loader />
    return (
        <div className="mx-5">
            <div className="container mx-auto">
                <h1 className="max-w-f pb-4 text-center text-4xl font-bold">
                    {locale.title}
                </h1>
            </div>
            <div className="mx-auto my-3 flex w-full gap-2 text-center">
                <Form.Group className="!mb-0 flex w-full gap-2 rounded-lg bg-slate-300 pl-4 dark:bg-gray-600">
                    <Form.Label className=" flex items-center gap-2 no-underline">
                        <FaSearch />
                        {locale.search}
                    </Form.Label>
                    <Form.Control
                        className="!mb-0 !w-full rounded-r-md !border-0 !bg-slate-200 dark:!bg-gray"
                        onChange={handleSearchChange}
                    />
                </Form.Group>
                {isAdmin(user) && (
                    <Link
                        to="/esemeny/uj"
                        className="!m-0 my-auto !p-0 align-middle text-sm"
                    >
                        <Button
                            className="!rounded-lg !outline-none"
                            variant="primary"
                        >
                            {locale.create}
                        </Button>
                    </Link>
                )}
            </div>

            {isEventsFetching ? (
                <Loader />
            ) : (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredEvents.map((event) => (
                        <EventCard event={event} key={event.id} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default EventsPage
