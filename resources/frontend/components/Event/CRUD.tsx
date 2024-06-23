import useConfirm, { ConfirmDialogProps } from 'hooks/useConfirm'
import useDelay from 'hooks/useDelayed'
import useEventDates from 'hooks/useEventDates'
import useUser from 'hooks/useUser'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CRUDFormImpl } from 'types/misc'
import {
    Attender,
    Event,
    SignupType,
    SignupTypeType,
    TeamMemberRole,
    isAttenderTeam,
} from 'types/models'

import eventAPI from 'lib/api/eventAPI'
import teamAPI from 'lib/api/teamAPI'
import { isAdmin, isOrganiser, isScanner } from 'lib/gates'
import Locale from 'lib/locale'

import EventForm from 'components/Forms/EventForm'
import { EventPermissionCreateFormImpl } from 'components/Permissions/CRUD'
import Button from 'components/UIKit/Button'
import ButtonGroup from 'components/UIKit/ButtonGroup'
import Card from 'components/UIKit/Card'
import Dialog from 'components/UIKit/Dialog'
import Form from 'components/UIKit/Form'

import ParticipantSearch from './ParticipantSearch'

export type EventFormValues = Pick<
    Event,
    | 'id'
    | 'name'
    | 'description'
    | 'starts_at'
    | 'ends_at'
    | 'signup_deadline'
    | 'signup_type'
    | 'organiser'
    | 'location_id'
    | 'capacity'
    | 'is_competition'
    | 'slot_id'
>

const locale = Locale({
    hu: {
        create: 'Esemény létrehozása',
        edit: 'Esemény szerkesztése',
        organiser: 'Szervező',
        description: 'Leírás',
        times: 'Időpontok',
        starts_at: 'Kezdés',
        ends_at: 'Befejezés',
        signup_deadline: 'Jelentkezési határidő',
        location: 'Helyszín',
        unknown: 'Ismeretlen',
        delete: 'Törlés',
        scanner: 'Résztvevők kódjának beolvasása',
        permissions: 'Jogosultságok kezelése',
        close_signup: 'Jelentkezés lezárása',
        are_you_sure: {
            index: 'Biztosan szeretnéd',
            delete: 'törölni az eseményt?',
            close_signup: 'lezárni a jelentkezést?',
            yes: 'Igen, biztos vagyok',
            no: 'Nem, mégsem',
        },
        score: 'Helyezés',
        solo: 'Egyéni jelentkezés',
        singup: 'Jelentkezés az eseményre',
        signup_CTA: 'Jelentkezz!',
        unsignup_CTA: 'Jelentkezés törlése',
        applicants: 'Jelentkezők',
        participants: 'Résztvevők',
        signup_type: (type: SignupTypeType): string => {
            switch (type) {
                case SignupType.Individual:
                    return 'Egyéni jelentkezés'
                case SignupType.Team:
                    return 'Csapatos jelentkezés'
                case SignupType.Both:
                    return 'Egyéni és csapatos jelentkezés'
            }
        },

        undefined: 'Nincs megadva',
        notyetset: 'Még nincs megadva',
        success: 'sikeres',
        cancelled: 'sikeresen törölve',
    },
    en: {
        create: 'Create event',
        edit: 'Edit event',
        organiser: 'Organiser',
        description: 'Description',
        times: 'Timetable',
        starts_at: 'Starts at',
        ends_at: 'Ends at',
        signup_deadline: 'Signup deadline',
        location: 'Location',
        unknown: 'Unknown',
        delete: 'Delete',
        scanner: 'Scan attendee codes',
        permissions: 'Manage permissions',
        close_signup: 'Close signup',
        are_you_sure: {
            index: 'Are you sure you want to',
            delete: 'delete the event?',
            close_signup: 'close the registration?',
            yes: "Yes, I'm sure",
            no: 'No, nevermind',
        },
        score: 'Score',
        solo: 'Solo signup',
        singup: 'Sign up for the event',
        signup_CTA: 'Sign up!',
        applicants: 'Applicants',
        participants: 'Participants',
        signup_type: (type: SignupTypeType) => {
            switch (type) {
                case SignupType.Individual:
                    return 'Individual signup'
                case SignupType.Team:
                    return 'Team signup'
                case SignupType.Both:
                    return 'Individual and team signup'
            }
        },
        undefined: 'Not set',
        notyetset: 'Not set yet',
        success: 'successful',
        cancelled: 'successfully cancelled',
        unsignup_CTA: 'Cancel signup',
    },
})

const useDeleteDialogTemplate = (event: Event) =>
    useCallback(({ handleConfirm, handleCancel }: ConfirmDialogProps) => {
        return (
            <Dialog
                title={
                    locale.are_you_sure.index + ' ' + locale.are_you_sure.delete
                }
                closable={false}
            >
                <Button onClick={handleConfirm} variant="danger">
                    {locale.are_you_sure.yes}
                </Button>
                <Button variant="success" onClick={handleCancel}>
                    {locale.are_you_sure.no}
                </Button>
            </Dialog>
        )
    }, [])

const useCloseSignupDialogTemplate = (event: Event) =>
    useCallback(({ handleConfirm, handleCancel }: ConfirmDialogProps) => {
        return (
            <Dialog
                title={
                    locale.are_you_sure.index +
                    ' ' +
                    locale.are_you_sure.close_signup
                }
                closable={false}
            >
                <Button onClick={handleConfirm} variant="danger">
                    {locale.are_you_sure.yes}
                </Button>
                <Button variant="success" onClick={handleCancel}>
                    {locale.are_you_sure.no}
                </Button>
            </Dialog>
        )
    }, [])

const EventReader = ({
    value: event,
    scoreLength = 3,
    ...rest
}: CRUDFormImpl<Event, EventFormValues> & {
    value: Event
    scoreLength?: number
}) => {
    const { user } = useUser(false)
    const { data: myteams } = teamAPI.useGetMyTeamsQuery()
    const [triggerParticipants, { data: participants }] =
        eventAPI.useLazyGetEventParticipantsQuery()

    const attenderSelect = useRef<HTMLSelectElement>(null)

    const navigate = useNavigate()

    const [signup] = eventAPI.useSignUpMutation()
    const [cancelSiguup] = eventAPI.useCancelSignUpMutation()

    const [statusmsg, setStatusmsg] = useState({
        isError: false,
        message: '',
    })

    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)

    const cleanupStatusmsg = useDelay(() => {
        setStatusmsg({ isError: false, message: '' })
    }, 2500)

    const [deleteEvent] = eventAPI.useDeleteEventMutation()
    const [closeSignup] = eventAPI.useCloseSignUpMutation()
    const [setScoreAPI] = eventAPI.useSetScoreMutation()

    const deleteDialogTemplate = useDeleteDialogTemplate(event)
    const closeSignupDialogTemplate = useCloseSignupDialogTemplate(event)
    const [DeleteConfirmDialog, confirmDelete] =
        useConfirm(deleteDialogTemplate)
    const [CloseSignupConfirmDialog, confirmCloseSignup] = useConfirm(
        closeSignupDialogTemplate
    )

    const isUserOrganiser = isOrganiser(event)(user)
    const isUserScanner = isScanner(event)(user)

    const { now, starts_at, ends_at, signup_deadline } = useEventDates(event)

    const handleSignup = async () => {
        if (!event || !attenderSelect.current?.value) return
        try {
            await signup({
                attender: attenderSelect.current.value,
                event,
            }).unwrap()
            setStatusmsg({
                isError: false,
                message: locale.singup + ' ' + locale.success,
            })
        } catch (e: any) {
            const message = (e.data as any).message
            setStatusmsg({ isError: true, message: message })
        }
        cleanupStatusmsg()
    }

    const handleCancelSignup = async () => {
        if (!event || !attenderSelect.current?.value) return
        try {
            await cancelSiguup({
                attender: attenderSelect.current.value,
                event,
            }).unwrap()
            setStatusmsg({
                isError: false,
                message: locale.singup + ' ' + locale.cancelled,
            })
        } catch (e: any) {
            const message = (e.data as any).message
            setStatusmsg({ isError: true, message: message })
        }
        cleanupStatusmsg()
    }

    const canSignup = useMemo(() => {
        if (!event.signup_deadline) return true
        return new Date(event.signup_deadline) > new Date()
    }, [event])

    const signUpTeams = useMemo(() => {
        if (!myteams) return []
        return myteams.filter(
            (team) =>
                !team.activity?.some((a) => a.pivot.event_id === event?.id) &&
                team.members.find((m) => m.id === user?.id)?.pivot.role ===
                    TeamMemberRole.leader
        )
    }, [event?.id, myteams, user?.id])

    const setScore = useCallback(
        async (p: Attender, score: number) => {
            await setScoreAPI({
                event: event,
                attender: isAttenderTeam(p) ? p.code : p.id,
                rank: score,
            })
        },
        [event, setScoreAPI]
    )

    useEffect(() => {
        if (event && isUserOrganiser) triggerParticipants(event)
    }, [event, isUserOrganiser, triggerParticipants])

    const isEventSignupRelevant = signup_deadline
        ? now < signup_deadline &&
          (event.capacity ? event.capacity > event.occupancy : true)
        : false

    return (
        <div>
            <DeleteConfirmDialog />
            <CloseSignupConfirmDialog />
            <div className="mx-2 mt-4 grid-cols-3 gap-3 lg:mx-12 lg:grid">
                <div className="col-span-1">
                    {event.img_url && (
                        <img
                            src={event.img_url}
                            alt={event.name}
                            className="mx-auto mb-2 w-auto rounded-lg lg:mx-0"
                        />
                    )}
                    <h1 className="text-center text-4xl font-bold lg:text-left">
                        {event.name}
                    </h1>
                    <h2 className="mt-1 text-center text-xl lg:text-left">
                        {locale.organiser}: {event.organiser}
                    </h2>
                    <p className="text-l mt-1 text-center italic text-gray-50 lg:text-left">
                        {locale.signup_type(event.signup_type)}
                    </p>
                    {user && canSignup && (
                        <div className="mt-2 w-full rounded-lg  bg-slate-200 p-2 dark:bg-gray-600 md:mb-0 ">
                            <h3 className="text-center font-bold">
                                {locale.singup}
                            </h3>
                            <div className="mt-2 flex w-full flex-row items-center justify-center rounded-lg border-2">
                                <Form.Select
                                    ref={attenderSelect}
                                    className=" !max-w-none flex-1 !rounded-l-lg bg-slate-200 dark:bg-gray"
                                >
                                    {event.signup_type !== SignupType.Team &&
                                        user.e5code && (
                                            <option value={user.e5code}>
                                                {locale.solo}
                                            </option>
                                        )}
                                    {event.signup_type !==
                                        SignupType.Individual &&
                                        signUpTeams.map((team) => (
                                            <option
                                                key={team.code}
                                                value={team.code}
                                            >
                                                {team.name}
                                            </option>
                                        ))}
                                </Form.Select>
                                <Button
                                    className="min-w-fit !rounded-l-none !rounded-r-lg "
                                    onClick={handleSignup}
                                >
                                    {locale.signup_CTA}
                                </Button>
                                <Button
                                    variant="danger"
                                    className="min-w-fit !rounded-l-none !rounded-r-lg "
                                    onClick={handleCancelSignup}
                                >
                                    {locale.unsignup_CTA}
                                </Button>
                            </div>
                            {statusmsg.message !== '' && (
                                <Card
                                    title={statusmsg.message}
                                    className={`mt-2 ${
                                        statusmsg.isError
                                            ? 'bg-red-500'
                                            : 'bg-green-500'
                                    }`}
                                />
                            )}
                        </div>
                    )}
                    <ButtonGroup className="mt-6 !block w-full sm:hidden">
                        {(isAdmin(user) ||
                            isUserOrganiser ||
                            isUserScanner) && (
                            <Link
                                className="w-full"
                                to={`/esemeny/${event.id}/kezel/scanner`}
                            >
                                <Button
                                    variant="outline-primary"
                                    className="!mb-2"
                                >
                                    {locale.scanner}
                                </Button>
                            </Link>
                        )}
                        {(isAdmin(user) || isUserOrganiser) && (
                            <Link
                                className="w-full"
                                to={`/esemeny/${event.id}/kezel/szerkeszt`}
                            >
                                <Button
                                    className="!mb-2"
                                    variant="outline-secondary"
                                >
                                    {locale.edit}
                                </Button>
                            </Link>
                        )}
                        {isAdmin(user) && (
                            <Button
                                className="!mb-2 !rounded-md"
                                variant="outline-danger"
                                onClick={async () => {
                                    if (!(await confirmDelete())) return
                                    await deleteEvent(event)
                                    navigate('/esemeny')
                                }}
                            >
                                {locale.delete}
                            </Button>
                        )}
                        {(isAdmin(user) || isUserOrganiser) && (
                            <>
                                <Dialog
                                    open={isPermissionDialogOpen}
                                    onClose={() =>
                                        setIsPermissionDialogOpen(false)
                                    }
                                    title={locale.permissions}
                                >
                                    <EventPermissionCreateFormImpl
                                        event={event}
                                        onSuccess={() =>
                                            setIsPermissionDialogOpen(false)
                                        }
                                    />
                                </Dialog>
                                <Button
                                    className="!mb-2 !rounded-md"
                                    variant="outline-info"
                                    onClick={() =>
                                        setIsPermissionDialogOpen(true)
                                    }
                                >
                                    {locale.permissions}
                                </Button>
                            </>
                        )}
                        {isEventSignupRelevant &&
                            (isAdmin(user) || isUserOrganiser) && (
                                <Button
                                    className="!mb-2 !rounded-md"
                                    variant="outline-warning"
                                    onClick={async () => {
                                        if (!(await confirmCloseSignup()))
                                            return
                                        await closeSignup(event)
                                    }}
                                >
                                    {locale.close_signup}
                                </Button>
                            )}
                    </ButtonGroup>
                </div>
                <div className="col-span-2 !mt-0 sm:mt-2">
                    {Boolean(event.is_competition) && (
                        <Card
                            title={locale.score}
                            className="border-2 border-dashed border-red-500"
                        >
                            {Array(scoreLength)
                                .fill(0)
                                .map((_, i) => (
                                    <div
                                        className="min-h-10 mb-2 flex items-center overflow-hidden rounded-md border-2"
                                        key={i}
                                    >
                                        <div className="w-10 text-center">
                                            {i + 1}.
                                        </div>
                                        <div className="w-full">
                                            {(isAdmin(user) ||
                                                isUserOrganiser) &&
                                            participants ? (
                                                <ParticipantSearch
                                                    event={{
                                                        ...event,
                                                        attendees: participants,
                                                    }}
                                                    onChange={(p) =>
                                                        setScore(p, i + 1)
                                                    }
                                                />
                                            ) : (
                                                <div className="w-full bg-gray p-2">
                                                    {participants?.find(
                                                        (p) =>
                                                            p.pivot.rank === i
                                                    )?.name ?? locale.notyetset}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </Card>
                    )}
                    <Card title={locale.description}>
                        <p>{event.description}</p>
                    </Card>
                    <Card title={locale.times}>
                        <p>
                            <strong>{locale.starts_at}</strong>:{' '}
                            {starts_at?.toLocaleString('hu-HU')}
                        </p>
                        <p>
                            <strong>{locale.ends_at}</strong>:{' '}
                            {ends_at?.toLocaleString('hu-HU')}
                        </p>
                        <p>
                            <strong>{locale.signup_deadline}</strong>:{' '}
                            {signup_deadline?.toLocaleString('hu-HU') ??
                                locale.undefined}
                        </p>
                    </Card>
                    <Card title={locale.location}>
                        {event.location?.name ?? locale.unknown}
                    </Card>
                    {isAdmin(user) && isUserOrganiser && participants && (
                        <Card title={locale.applicants}>
                            {participants.map((p) => (
                                <div key={isAttenderTeam(p) ? p.code : p.id}>
                                    {p.name}
                                </div>
                            ))}
                        </Card>
                    )}
                    {isAdmin(user) && isUserOrganiser && participants && (
                        <Card title={locale.participants}>
                            {participants
                                .filter((p) => p.pivot.is_present)
                                .map((p) => (
                                    <div
                                        key={isAttenderTeam(p) ? p.code : p.id}
                                    >
                                        {p.name}
                                    </div>
                                ))}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

const EventCreator = ({
    value,
    ...rest
}: CRUDFormImpl<Event, Partial<EventFormValues>>) => {
    const now = new Date()
    const [createEvent] = eventAPI.useCreateEventMutation()
    const navigate = useNavigate()
    const onSubmit = useCallback(
        async (event: EventFormValues) => {
            try {
                const res = await createEvent(event).unwrap()
                navigate(`/esemeny/${res.id}`)
            } catch (e) {
                console.error(e)
            }
        },
        [createEvent, navigate]
    )
    return (
        <EventForm
            initialValues={{
                id: value.id ?? 0,
                name: value.name ?? '',
                description: value.description ?? '',
                starts_at: value.starts_at ?? '',
                ends_at: value.ends_at ?? '',
                signup_deadline: value.signup_deadline ?? null,
                signup_type: value.signup_type ?? 'team_user',
                location_id: value.location_id ?? 0,
                organiser: value.organiser ?? '',
                capacity: value.capacity ?? null,
                is_competition: value.is_competition ?? false,
                slot_id: value.slot_id ?? null,
            }}
            onSubmit={onSubmit}
            submitLabel={locale.create}
            resetOnSubmit={true}
            {...rest}
        />
    )
}
const EventUpdater = ({
    value,
    ...rest
}: CRUDFormImpl<Event, EventFormValues>) => {
    const [changeEvent] = eventAPI.useEditEventMutation()
    const navigate = useNavigate()
    return (
        <EventForm
            initialValues={{
                id: value.id,
                name: value.name,
                description: value.description,
                starts_at: value.starts_at,
                ends_at: value.ends_at,
                signup_deadline: value.signup_deadline,
                signup_type: value.signup_type,
                location_id: value.location_id,
                organiser: value.organiser,
                capacity: value.capacity,
                is_competition: value.is_competition,
                slot_id: value.slot_id,
            }}
            onSubmit={async (event) => {
                console.log(event)
                await changeEvent(event)
                navigate(`/esemeny/${event.id}`)
            }}
            resetOnSubmit={true}
            submitLabel={locale.edit}
            {...rest}
        ></EventForm>
    )
}

const EventCRUD = {
    Creator: EventCreator,
    Updater: EventUpdater,
    Reader: EventReader,
}
export default EventCRUD
