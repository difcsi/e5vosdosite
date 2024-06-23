import { useMemo, useState } from 'react'

import { RequiredFields } from 'types/misc'
import {
    Team,
    TeamMember,
    TeamMemberRole,
    TeamMemberRoleType,
    User,
    UserStub,
} from 'types/models'

import teamAPI from 'lib/api/teamAPI'
import { isAdmin } from 'lib/gates'
import Locale from 'lib/locale'

import AttenderShowcase from 'components/AttendanceShowcase'
import Button from 'components/UIKit/Button'
import ButtonGroup from 'components/UIKit/ButtonGroup'
import Card from 'components/UIKit/Card'
import Loader from 'components/UIKit/Loader'
import UserSearchCombobox from 'components/User/UserSearch'

const cardLocale = Locale({
    hu: {
        membership: (role: TeamMemberRoleType): string => {
            switch (role) {
                case TeamMemberRole.leader:
                    return 'Kapitány'
                case TeamMemberRole.member:
                    return 'Tag'
                case TeamMemberRole.invited:
                    return 'Meghívott'
                default:
                    return 'Ismeretlen'
            }
        },
        invite: {
            pending: 'Függőben lévő meghívó',
            accept: 'Meghívó elfogadása',
            decline: 'Meghívó elutasítása',
            send: 'Meghívó küldése',
        },
        activities: 'Aktivitás',
        members: 'Tagok',
        promote: 'Előléptetés',
        kick: 'Kizárás',
        resign: 'Lemondás',
        leave: 'Kilépés',
        noAttendanceYet: 'Még nincs aktivitás',
    },
    en: {
        membership: (role: TeamMemberRoleType) => {
            switch (role) {
                case TeamMemberRole.leader:
                    return 'Captain'
                case TeamMemberRole.member:
                    return 'Member'
                case TeamMemberRole.invited:
                    return 'Invited'
                default:
                    return 'Unknown'
            }
        },
        invite: {
            pending: 'Pending invite',
            accept: 'Accept invite',
            decline: 'Decline invite',
            send: 'Send invite',
        },
        activities: 'Activities',
        members: 'Members',
        promote: 'Promote',
        kick: 'Kick',
        resign: 'Resign',
        leave: 'Leave',
        noAttendanceYet: 'No activity yet',
    },
})

const TeamCard = ({
    team,
    currentUser: user,
}: {
    team: RequiredFields<Team, 'activity' | 'members'>
    currentUser: User
}) => {
    const [promote] = teamAPI.usePromoteMutation()

    const [selectedUser, setSelectedUser] = useState<UserStub | null>(null)

    const currentUsersMembership = useMemo(
        () => team.members?.find((member) => member.id === user?.id),
        [team, user]
    )

    const moreThanOneLeader = useMemo(
        () =>
            team.members.filter((e) => e.pivot.role === TeamMemberRole.leader)
                .length > 1,
        [team]
    )

    if (!team || !user) return <Loader />

    const canPromote = (member: TeamMember) =>
        member.pivot.role === TeamMemberRole.member &&
        currentUsersMembership?.pivot.role === TeamMemberRole.leader
    const canDemote = (member: TeamMember) =>
        (member.id === user.id &&
            (member.pivot.role !== TeamMemberRole.leader ||
                moreThanOneLeader)) ||
        (member.pivot.role !== TeamMemberRole.leader &&
            currentUsersMembership?.pivot.role === TeamMemberRole.leader)

    return (
        <Card
            title={team.name}
            subtitle={team.code}
            className="!mx-0 max-w-4xl md:!mx-auto"
            titleClassName="text-3xl"
        >
            {team.description}
            {currentUsersMembership?.pivot.role === TeamMemberRole.invited && (
                <div className="mb-3">
                    <h3 className="mb-2 text-center text-xl font-bold text-yellow-500">
                        {cardLocale.invite.pending}
                    </h3>
                    <ButtonGroup className="w-full">
                        <Button
                            variant="success"
                            onClick={() =>
                                promote({
                                    user_id: user.id,
                                    team_code: team.code,
                                    promote: true,
                                })
                            }
                        >
                            {cardLocale.invite.accept}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                promote({
                                    user_id: user.id,
                                    team_code: team.code,
                                    promote: false,
                                })
                            }
                        >
                            {cardLocale.invite.decline}
                        </Button>
                    </ButtonGroup>
                </div>
            )}
            {isAdmin(user) && (
                <span className="mt-2 hidden md:block">
                    <h2 className="text-center text-lg font-bold">
                        {cardLocale.activities}
                    </h2>
                    <div>
                        {team.activity?.map((e) => (
                            <AttenderShowcase key={e.pivot.id} attender={e} />
                        )) ?? (
                            <div className="text-center italic">
                                {cardLocale.noAttendanceYet}
                            </div>
                        )}
                    </div>
                </span>
            )}
            <h2 className="mt-2 text-center text-lg font-bold">
                {cardLocale.members}
            </h2>
            <div>
                {team.members?.map((member) => (
                    <div
                        key={member.id}
                        className="mb-2 items-center rounded-lg bg-slate-200 p-2 dark:bg-gray md:grid md:grid-cols-2 lg:grid-cols-3"
                    >
                        <div className="grid-col-span py-2 text-center sm:mr-5 sm:text-left">
                            <span className="font-semibold">
                                {member.name} ({member.ejg_class})
                            </span>{' '}
                            -{' '}
                            <span className="italic">
                                {cardLocale.membership(member.pivot.role)}
                            </span>
                        </div>
                        {(canPromote(member) || canDemote(member)) && (
                            <ButtonGroup className="my-1">
                                {canPromote(member) && (
                                    <Button
                                        variant="success"
                                        onClick={() =>
                                            promote({
                                                user_id: member.id,
                                                team_code: team.code,
                                                promote: true,
                                            })
                                        }
                                    >
                                        {cardLocale.promote}
                                    </Button>
                                )}
                                {canDemote(member) && (
                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            promote({
                                                user_id: member.id,
                                                team_code: team.code,
                                                promote: false,
                                            })
                                        }
                                    >
                                        {member.id === user.id
                                            ? member.pivot.role ===
                                              TeamMemberRole.leader
                                                ? cardLocale.resign
                                                : cardLocale.leave
                                            : cardLocale.kick}
                                    </Button>
                                )}
                            </ButtonGroup>
                        )}
                    </div>
                ))}
            </div>
            {currentUsersMembership?.pivot.role === TeamMemberRole.leader && (
                <div className="mt-2 flex w-full rounded-lg bg-slate-300 dark:bg-gray">
                    <UserSearchCombobox
                        onChange={setSelectedUser}
                        className="bg-slate-300 dark:bg-gray"
                    />
                    <Button
                        className="!w-full rounded-l-none rounded-r-lg !outline-none"
                        onClick={async () => {
                            if (!selectedUser) return
                            await promote({
                                user_id: selectedUser.id,
                                team_code: team.code,
                                promote: true,
                            })
                        }}
                    >
                        {cardLocale.invite.send}
                    </Button>
                </div>
            )}
        </Card>
    )
}

export default TeamCard
