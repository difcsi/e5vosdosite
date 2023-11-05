import useConfirm, { ConfirmDialogProps } from "hooks/useConfirm";
import useEventDates from "hooks/useEventDates";
import useUser from "hooks/useUser";
import { useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CRUDFormImpl } from "types/misc";
import { Event, SignupType, SignupTypeType } from "types/models";

import eventAPI from "lib/api/eventAPI";
import teamAPI from "lib/api/teamAPI";
import { isAdmin, isOrganiser, isScanner } from "lib/gates";
import Locale from "lib/locale";
import { formatDateInput } from "lib/util";

import EventForm from "components/Forms/EventForm";
import Button from "components/UIKit/Button";
import ButtonGroup from "components/UIKit/ButtonGroup";
import Card from "components/UIKit/Card";
import Dialog from "components/UIKit/Dialog";
import Form from "components/UIKit/Form";

export type EventFormValues = Pick<
    Event,
    | "id"
    | "name"
    | "description"
    | "starts_at"
    | "ends_at"
    | "signup_deadline"
    | "signup_type"
    | "organiser"
    | "location_id"
    | "capacity"
    | "is_competition"
    | "slot_id"
>;

const locale = Locale({
    hu: {
        create: "Esemény létrehozása",
        edit: "Esemény szerkesztése",
        organiser: "Szervező",
        description: "Leírás",
        times: "Időpontok",
        starts_at: "Kezdés",
        ends_at: "Befejezés",
        location: "Helyszín",
        unknown: "Ismeretlen",
        delete: "Törlés",
        scanner: "Résztvevők kódjának beolvasása",
        permissions: "Jogosultságok kezelése",
        close_signup: "Jelentkezés lezárása",
        are_you_sure: {
            index: "Biztosan szeretnéd",
            delete: "törölni az eseményt?",
            close_signup: "lezárni a jelentkezést?",
            yes: "Igen, biztos vagyok",
            no: "Nem, mégsem",
        },
        score: "Helyezés",
        solo: "Egyéni jelentkezés",
        singup: "Jelentkezés az eseményre",
        signup_CTA: "Jelentkezz!",
        signup_type: (type: SignupTypeType): string => {
            switch (type) {
                case SignupType.Individual:
                    return "Egyéni jelentkezés";
                case SignupType.Team:
                    return "Csapatos jelentkezés";
                case SignupType.Both:
                    return "Egyéni és csapatos jelentkezés";
            }
        },
    },
    en: {
        create: "Create event",
        edit: "Edit event",
        organiser: "Organiser",
        description: "Description",
        times: "Timetable",
        starts_at: "Starts at",
        ends_at: "Ends at",
        location: "Location",
        unknown: "Unknown",
        delete: "Delete",
        scanner: "Scan attendee codes",
        permissions: "Manage permissions",
        close_signup: "Close signup",
        are_you_sure: {
            index: "Are you sure you want to",
            delete: "delete the event?",
            close_signup: "close the registration?",
            yes: "Yes, I'm sure",
            no: "No, nevermind",
        },
        score: "Score",
        solo: "Solo signup",
        singup: "Sign up for the event",
        signup_CTA: "Sign up!",
        signup_type: (type: SignupTypeType) => {
            switch (type) {
                case SignupType.Individual:
                    return "Individual signup";
                case SignupType.Team:
                    return "Team signup";
                case SignupType.Both:
                    return "Individual and team signup";
            }
        },
    },
});

const useDeleteDialogTemplate = (event: Event) =>
    useCallback(({ handleConfirm, handleCancel }: ConfirmDialogProps) => {
        return (
            <Dialog
                title={
                    locale.are_you_sure.index + " " + locale.are_you_sure.delete
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
        );
    }, []);

const useCloseSignupDialogTemplate = (event: Event) =>
    useCallback(({ handleConfirm, handleCancel }: ConfirmDialogProps) => {
        return (
            <Dialog
                title={
                    locale.are_you_sure.index +
                    " " +
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
        );
    }, []);

const EventReader = ({
    value: event,
    ...rest
}: CRUDFormImpl<Event, EventFormValues> & { value: Event }) => {
    const { user } = useUser(false);
    const { data: myteams } = teamAPI.useGetMyTeamsQuery();

    const attenderSelect = useRef<HTMLSelectElement>(null);

    const navigate = useNavigate();

    const [signup] = eventAPI.useSignUpMutation();
    const [deleteEvent] = eventAPI.useDeleteEventMutation();
    const [closeSignup] = eventAPI.useCloseSignUpMutation();

    const deleteDialogTemplate = useDeleteDialogTemplate(event);
    const closeSignupDialogTemplate = useCloseSignupDialogTemplate(event);
    const [DeleteConfirmDialog, confirmDelete] =
        useConfirm(deleteDialogTemplate);
    const [CloseSignupConfirmDialog, confirmCloseSignup] = useConfirm(
        closeSignupDialogTemplate,
    );

    const isUserOrganiser = isOrganiser(event)(user);
    const isUserScanner = isScanner(event)(user);

    const { now, starts_at, ends_at, signup_deadline } = useEventDates(event);

    const handleSignup = async () => {
        if (!event || !attenderSelect.current?.value) return;
        await signup({ attender: attenderSelect.current.value, event });
    };

    const canSignup = useMemo(() => {
        if (!event.signup_deadline) return true;
        return new Date(event.signup_deadline) < new Date();
    }, [event]);

    const signUpTeams = useMemo(() => {
        if (!myteams) return [];
        return myteams.filter(
            (team) =>
                !team.attendance?.some((a) => a.pivot.event_id === event?.id),
        );
    }, [event?.id, myteams]);

    const isEventSignupDateStillRelevant = signup_deadline
        ? now < signup_deadline
        : false;

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
                            className="mb-2 w-auto rounded-lg"
                        />
                    )}
                    <h1 className="text-4xl font-bold">{event.name}</h1>
                    <h2 className="mt-1 text-xl">
                        {locale.organiser}: {event.organiser}
                    </h2>
                    <p className="text-l mt-1 italic text-gray-50">
                        {locale.signup_type(event.signup_type)}
                    </p>
                    {canSignup && (
                        <div className="mb-5 mt-5 rounded-lg border bg-slate-500 p-2 md:mb-0 md:border-none md:bg-inherit md:p-0">
                            <h3 className="text-center font-bold">
                                {locale.signup_CTA}
                            </h3>
                            <Form.Group className="mt-3 flex w-full flex-row gap-3">
                                <Form.Select
                                    ref={attenderSelect}
                                    className="flex-1 "
                                >
                                    {event.signup_type !== SignupType.Team && (
                                        <option>{locale.solo}</option>
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
                                    className="w-1/4"
                                    onClick={handleSignup}
                                >
                                    {locale.signup_CTA}
                                </Button>
                            </Form.Group>
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
                                <Button variant="primary" className="!mb-2">
                                    {locale.scanner}
                                </Button>
                            </Link>
                        )}
                        {(isAdmin(user) || isUserOrganiser) && (
                            <Link
                                className="w-full"
                                to={`/esemeny/${event.id}/kezel/szerkeszt`}
                            >
                                <Button className="!mb-2" variant="secondary">
                                    {locale.edit}
                                </Button>
                            </Link>
                        )}
                        {isAdmin(user) && (
                            <Button
                                className="!mb-2 !rounded-md text-white"
                                variant="danger"
                                onClick={async () => {
                                    if (!(await confirmDelete())) return;
                                    await deleteEvent(event);
                                    navigate("/esemenyek");
                                }}
                            >
                                {locale.delete}
                            </Button>
                        )}
                        {(isAdmin(user) || isUserOrganiser) && (
                            <Link
                                className="w-full"
                                to={`/esemeny/${event.id}/kezel/jogosultsagok`}
                            >
                                <Button
                                    className="!mb-2 text-white"
                                    variant="info"
                                >
                                    {locale.permissions}
                                </Button>
                            </Link>
                        )}
                        {isEventSignupDateStillRelevant &&
                            (isAdmin(user) || isUserOrganiser) && (
                                <Button
                                    className="!mb-2 !rounded-md text-white"
                                    variant="warning"
                                    onClick={async () => {
                                        if (!(await confirmCloseSignup()))
                                            return;
                                        await closeSignup(event);
                                    }}
                                >
                                    {locale.close_signup}
                                </Button>
                            )}
                    </ButtonGroup>
                </div>
                <div className="col-span-2 !mt-0 sm:mt-2">
                    <Card title={locale.score} className="!bg-red-500">
                        <div>a</div>
                    </Card>
                    <Card title={locale.description} className="!bg-slate-500">
                        <p>{event.description}</p>
                    </Card>
                    <Card title={locale.times} className="!bg-slate-500">
                        <p>
                            <strong>{locale.starts_at}</strong>:{" "}
                            {starts_at?.toLocaleString("hu-HU")}
                        </p>
                        <p>
                            <strong>{locale.ends_at}</strong>:{" "}
                            {ends_at?.toLocaleString("hu-HU")}
                        </p>
                    </Card>
                    <Card title={locale.location} className="!bg-slate-500">
                        {event.location?.name ?? locale.unknown}
                    </Card>
                </div>
            </div>
        </div>
    );
};

const EventCreator = ({
    value,
    ...rest
}: CRUDFormImpl<Event, Partial<EventFormValues>>) => {
    const now = new Date();
    const [createEvent] = eventAPI.useCreateEventMutation();
    const navigate = useNavigate();
    const onSubmit = useCallback(
        async (event: EventFormValues) => {
            try {
                const res = await createEvent(event).unwrap();
                navigate(`/esemeny/${res.id}`);
            } catch (e) {
                console.error(e);
            }
        },
        [createEvent, navigate],
    );
    return (
        <EventForm
            initialValues={{
                id: value.id ?? 0,
                name: value.name ?? "",
                description: value.description ?? "",
                starts_at:
                    value.starts_at ??
                    formatDateInput(
                        value.starts_at ? new Date(value.starts_at) : now,
                    ),
                ends_at:
                    value.ends_at ??
                    formatDateInput(
                        value.ends_at ? new Date(value.ends_at) : now,
                    ),
                signup_deadline: formatDateInput(
                    value.signup_deadline
                        ? new Date(value.signup_deadline)
                        : now,
                ),
                signup_type: value.signup_type ?? "team_user",
                location_id: value.location_id ?? 0,
                organiser: value.organiser ?? "",
                capacity: value.capacity ?? null,
                is_competition: value.is_competition ?? false,
                slot_id: value.slot_id ?? null,
            }}
            onSubmit={onSubmit}
            submitLabel={locale.create}
            resetOnSubmit={true}
            {...rest}
        />
    );
};
const EventUpdater = ({
    value,
    ...rest
}: CRUDFormImpl<Event, EventFormValues>) => {
    const [changeEvent] = eventAPI.useEditEventMutation();
    const initialDates = useEventDates(value);

    return (
        <EventForm
            initialValues={{
                ...value,
                ends_at: formatDateInput(
                    initialDates.ends_at ?? initialDates.now,
                ),
                starts_at: formatDateInput(
                    initialDates.starts_at ?? initialDates.now,
                ),
                signup_deadline: initialDates.signup_deadline
                    ? formatDateInput(initialDates.signup_deadline)
                    : "",
            }}
            onSubmit={changeEvent}
            resetOnSubmit={true}
            submitLabel={locale.edit}
            {...rest}
        ></EventForm>
    );
};

const EventCRUD = {
    Creator: EventCreator,
    Updater: EventUpdater,
    Reader: EventReader,
};
export default EventCRUD;