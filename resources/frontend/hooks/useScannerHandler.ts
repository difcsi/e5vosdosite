import { useCallback } from 'react'

import { RequiredFields } from 'types/misc'
import {
    Event,
    Team,
    TeamAttendance,
    TeamMember,
    TeamMemberAttendance,
    TeamMemberRole,
    User,
    UserAttendance,
    isTeamAttendance,
} from 'types/models'

import eventAPI from 'lib/api/eventAPI'
import teamAPI from 'lib/api/teamAPI'

export type ScannerError =
    | 'NoE5N'
    | 'SignupRequired'
    | 'PermissionDenied'
    | 'TooFewAttendees'
    | 'TooManyAttendees'
    | 'Unknown'

const useScannerHandler = ({
    event,
    teamMemberPrompt,
    onSuccess,
    onError,
}: {
    event: Pick<Event, 'id'>
    teamMemberPrompt: (member: TeamMember) => Promise<boolean>
    onSuccess?: (attendance: User | Team) => any
    onError?: (error: string) => any
}) => {
    const [getTeam] = teamAPI.useLazyGetTeamQuery()
    const [attend] = eventAPI.useAttendMutation()
    const [teamMemberAttend] = eventAPI.useTeamMemberAttendMutation()

    return useCallback(
        async (scanvalue: string) => {
            let attendance:
                | RequiredFields<TeamAttendance, 'team'>
                | RequiredFields<UserAttendance, 'user'>
            try {
                attendance = await attend({
                    event: event,
                    attender: scanvalue,
                    present: true,
                }).unwrap()
            } catch (e: any) {
                console.log(e.data.message)
                onError?.(e.data.message as string)
                return
            }
            if (!isTeamAttendance(attendance)) {
                onSuccess?.(attendance.user)
                return
            }

            let team: RequiredFields<Team, 'activity' | 'members'>
            try {
                team = await getTeam({ code: scanvalue }).unwrap()
            } catch (e) {
                return
            }
            const memberAttendances: TeamMemberAttendance[] = []

            for (const member of team.members.filter(
                (member) => member.pivot.role !== TeamMemberRole.invited
            )) {
                memberAttendances.push({
                    is_present: await teamMemberPrompt(member),
                    attendance_id: attendance.id,
                    user_id: member.id,
                })
            }

            try {
                await teamMemberAttend({ data: memberAttendances }).unwrap()
            } catch (e: any) {
                onError?.(e.data.message as string)
                return
            }
            onSuccess?.(attendance.team)
        },
        [
            attend,
            event,
            getTeam,
            onError,
            onSuccess,
            teamMemberAttend,
            teamMemberPrompt,
        ]
    )
}
export default useScannerHandler
