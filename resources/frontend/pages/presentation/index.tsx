import useDelay from 'hooks/useDelayed'
import useGetPresentationSlotsQuery from 'hooks/useGetPresentationSlotsQuery'
import useUser from 'hooks/useUser'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { IoLocationSharp } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

import { Presentation } from 'types/models'

import eventAPI from 'lib/api/eventAPI'
import Locale from 'lib/locale'

import PresentationsTable from 'components/PresentationsTable'
import Button from 'components/UIKit/Button'
import ButtonGroup from 'components/UIKit/ButtonGroup'
import ErrorMsgBox from 'components/UIKit/ErrorMsgBox'
import Loader from 'components/UIKit/Loader'
import { Title } from 'components/UIKit/Typography'

const locale = Locale({
    hu: {
        title: `${import.meta.env.VITE_EVENT_HU} - Előadásjelentkezés`,
        selectedPresentation: 'Általad választott előadás',
        presentationNotYetSelected: 'Még nem választottál előadást',
        select: 'Választás',
        delete: 'Törlés',
        unknownLocation: 'Ismeretlen hely',
        unknownError: 'Ismeretlen hiba',
        noe5code: 'Nem adtad meg az E5 kódot!',
        nologin: 'Nem vagy bejelentkezve!',
        sloterror: (
            <span className="text-red-700 dark:text-red-300">
                Nem betöltött eseménysáv! Valószínűleg programsáv!
            </span>
        ),
    },
    en: {
        title: `${import.meta.env.VITE_EVENT_EN} - Presentation signup`,
        selectedPresentation: 'Your selected presentation',
        presentationNotYetSelected: 'You have not selected a presentation yet',
        select: 'Select',
        delete: 'Delete',
        unknownLocation: 'Unknown location',
        unknownError: 'Unknown error',
        noe5code: 'You have not entered your E5 code!',
        nologin: 'You are not logged in!',
        sloterror: (
            <span className="text-red-300">
                Event slot not loaded! Probably an event slot!
            </span>
        ),
    },
})

const SelectField = ({
    selectedPresentation,
    cancelSignupAction,
    cancelSignupInProgress,
}: {
    selectedPresentation: Presentation | undefined
    cancelSignupAction: (presentation: Presentation) => void
    cancelSignupInProgress: boolean
}) => {
    return (
        <div className="flex flex-1 flex-col items-stretch justify-center gap-4 text-center md:mx-3 md:flex-row md:gap-8">
            <div className="flex-1">
                <h3>{locale.selectedPresentation}</h3>
                <div className="rounded-lg bg-green-400 p-3 dark:bg-green-600 ">
                    {selectedPresentation?.name ??
                        locale.presentationNotYetSelected}
                </div>
                {selectedPresentation && (
                    <div className="mt-2 rounded-lg bg-goldenrod p-3 ">
                        <div className="text-lg">
                            <IoLocationSharp className="inline-block text-xl" />
                            {selectedPresentation.location?.name ??
                                locale.unknownLocation}
                        </div>
                    </div>
                )}
            </div>
            <Button
                variant="danger"
                onClick={() => {
                    if (selectedPresentation)
                        cancelSignupAction(selectedPresentation)
                }}
                disabled={!selectedPresentation || cancelSignupInProgress}
            >
                {locale.delete}
            </Button>
        </div>
    )
}

const PresentationsPage = () => {
    const [currentSlot, setcurrentSlot] = useState(0)

    const { data: slots } = useGetPresentationSlotsQuery()
    const {
        data: selectedPresentations,
        isFetching: isMyPresentationsFetching,
        refetch: refetchSelected,
    } = eventAPI.useGetUsersPresentationsQuery()
    const {
        data: presentations,
        isLoading: isEventsLoading,
        isFetching: isEventsFetching,
        refetch: refetchEvents,
    } = eventAPI.useGetEventsQuery(
        { id: slots?.[currentSlot]?.id ?? -1 },
        {
            pollingInterval: 10000,
        }
    )
    const [signUp, { isLoading: signupInProgress, error: signupError }] =
        eventAPI.useSignUpMutation()
    const [
        cancelSignup,
        { isLoading: cancelSignupInProgress, error: cancelSignupError },
    ] = eventAPI.useCancelSignUpMutation()
    const navigate = useNavigate()

    const { user } = useUser()
    const signUpAction = async (presentation: Presentation) => {
        if (signupInProgress) {
            return
        }
        try {
            if (!user) {
                alert(locale.nologin)
                return
            }
            if (!user.e5code) {
                alert(locale.noe5code)
                navigate('/studentcode?next=/eloadas')
                return
            }
            await signUp({
                attender: user.e5code,
                event: presentation,
            }).unwrap()
            refetchSelected()
            refetchEvents()
        } catch (err) {}
    }

    const cancelSignupAction = async (presentation: Presentation) => {
        if (cancelSignupInProgress || !user) {
            return
        }
        if (!user.e5code) {
            alert(locale.noe5code)
            navigate('/studentcode?next=/eloadas')
            return
        }
        try {
            if (user) {
                await cancelSignup({
                    attender: user.e5code,
                    event: presentation,
                }).unwrap()
                refetchSelected()
                refetchEvents()
            }
        } catch (err) {
            console.log(err)
        }
    }

    const slotName = useCallback(
        (id: number) =>
            slots?.find((slot) => slot.id === id)?.name ?? locale.sloterror,
        [slots]
    )

    const selectSlotById = useCallback(
        (id: number) => {
            const newSlot = slots?.findIndex((slot) => slot.id === id)
            if (newSlot !== undefined) setcurrentSlot(newSlot)
        },
        [slots]
    )

    const selectedPresentation = useMemo(
        () =>
            slots &&
            selectedPresentations?.find(
                (presentation) => presentation.slot_id === slots[currentSlot].id
            ),
        [currentSlot, selectedPresentations, slots]
    )

    const [errormsg, setErrormsg] = useState<string>('')

    const cleanupErrormsg = useDelay(setErrormsg, 2500)

    useEffect(() => {
        if (!signupError || !('status' in signupError)) return
        const message = (signupError.data as any).message
        setErrormsg(message)
    }, [signupError])

    useEffect(() => {
        if (!cancelSignupError || !('status' in cancelSignupError)) return
        const message = (cancelSignupError.data as any).message
        setErrormsg(message)
    }, [cancelSignupError, cleanupErrormsg])

    useEffect(() => {
        if (errormsg) cleanupErrormsg('')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errormsg])

    if (!slots || !selectedPresentations || !presentations) return <Loader />

    return (
        <div className="mx-5">
            <div className="container mx-auto">
                <Title>{locale.title}</Title>
                <ErrorMsgBox errorShown={errormsg !== ''} errormsg={errormsg} />
                <div className="mb-4 flex-row items-stretch justify-between  md:flex ">
                    <ButtonGroup>
                        {slots.map((slot, index) => (
                            <Button
                                variant="secondary"
                                key={slot.name}
                                disabled={index === currentSlot}
                                onClick={() => setcurrentSlot(index)}
                            >
                                {slot.name}
                            </Button>
                        ))}
                    </ButtonGroup>
                    <SelectField
                        cancelSignupAction={cancelSignupAction}
                        cancelSignupInProgress={cancelSignupInProgress}
                        selectedPresentation={selectedPresentation}
                    />
                </div>
                <PresentationsTable
                    presentations={(presentations as Presentation[]) ?? []}
                    callback={selectedPresentation ? undefined : signUpAction}
                    disabled={
                        signupInProgress ||
                        isMyPresentationsFetching ||
                        isEventsFetching
                    }
                    isLoading={isEventsLoading}
                    selectSlot={selectSlotById}
                    slotName={slotName}
                />
            </div>
        </div>
    )
}
export default PresentationsPage
