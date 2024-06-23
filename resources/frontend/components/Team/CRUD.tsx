import useUser from 'hooks/useUser'
import { useCallback } from 'react'

import { CRUDFormImpl, CRUDInterface, RequiredFields } from 'types/misc'
import { Team } from 'types/models'

import teamAPI from 'lib/api/teamAPI'
import Locale from 'lib/locale'

import TeamForm from 'components/Forms/TeamForm'
import Loader from 'components/UIKit/Loader'

import TeamCard from './TeamCard'

const locale = Locale({
    hu: {
        create: 'Csapat létrehozása',
        edit: 'Csapat szerkesztése',
    },
    en: {
        create: 'Create team',
        edit: 'Edit team',
    },
})

export type TeamFormValues = Pick<Team, 'name' | 'code' | 'description'>

const TeamCreator = ({
    value = {},
    ...rest
}: CRUDFormImpl<Team, Partial<TeamFormValues>>) => {
    const [createTeam] = teamAPI.useCreateTeamMutation()
    const onSubmit = useCallback(
        async (team: TeamFormValues) => {
            await createTeam(team)
        },
        [createTeam]
    )
    return (
        <TeamForm
            initialValues={{
                code: value.code ?? '',
                description: value.description ?? '',
                name: value.name ?? '',
            }}
            onSubmit={onSubmit}
            submitLabel={locale.create}
            resetOnSubmit={true}
            {...rest}
        />
    )
}

const TeamUpdater = ({
    value: team,
    ...rest
}: CRUDFormImpl<Team, TeamFormValues>) => {
    const [updateTeam] = teamAPI.useEditTeamMutation()
    const { refetch: refetchTeams } =
        teamAPI.endpoints.getAllTeams.useQuerySubscription()
    const { refetch: refetchTeam } =
        teamAPI.endpoints.getTeam.useQuerySubscription({
            code: team.code,
        })

    const onSubmit = useCallback(
        async (team: TeamFormValues) => {
            await updateTeam(team)
            refetchTeams()
            refetchTeam()
        },
        [updateTeam, refetchTeams, refetchTeam]
    )
    return (
        <TeamForm
            initialValues={team}
            onSubmit={onSubmit}
            submitLabel={locale.edit}
            enableReinitialize={true}
            {...rest}
        />
    )
}

const TeamReader = ({
    value: team,
}: CRUDFormImpl<Team, TeamFormValues> & { value: Team }) => {
    const [getTeam, { data: apiTeam, isFetching }] =
        teamAPI.useLazyGetTeamQuery()
    const { user } = useUser(false)
    const refetchTeam = !team.activity || !team.members
    if (!apiTeam && refetchTeam && !isFetching) {
        getTeam({ code: team.code })
    }
    if (!user || (refetchTeam && !apiTeam)) return <Loader />
    return (
        <TeamCard
            currentUser={user}
            team={
                apiTeam ??
                (team as RequiredFields<Team, 'activity' | 'members'>)
            }
        />
    )
}

const TeamCRUD: CRUDInterface<Team, TeamFormValues> = {
    Creator: TeamCreator,
    Updater: TeamUpdater,
    Reader: TeamReader,
}
export default TeamCRUD
