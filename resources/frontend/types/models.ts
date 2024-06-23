import { RequiredAndOmitFields, RequiredFields } from './misc'

export const PermissionCode = {
    organiser: 'ORG',
    scanner: 'SCN',
    admin: 'ADM',
    teacher: 'TCH',
    student: 'STD',
    operator: 'OPT',
    teacheradmin: 'TAD',
} as const

export type PermissionCodeType =
    (typeof PermissionCode)[keyof typeof PermissionCode]

export interface Permission {
    user_id: number
    event_id?: number | null
    code: PermissionCodeType
}

export interface TeamMemberAttendance {
    user_id: number
    attendance_id: number
    is_present: boolean
}

export const EJGClass = {
    sevenA: '7.A',
    sevenB: '7.B',
    eightA: '8.A',
    eightB: '8.B',
    nineA: '9.A',
    nineB: '9.B',
    nineC: '9.C',
    nineD: '9.D',
    nineE: '9.E',
    nineF: '9.F',
    nineNy: '9.NY',
    tenA: '10.A',
    tenB: '10.B',
    tenC: '10.C',
    tenD: '10.D',
    tenE: '10.E',
    tenF: '10.F',
    elevenA: '11.A',
    elevenB: '11.B',
    elevenC: '11.C',
    elevenD: '11.D',
    elevenE: '11.E',
    elevenF: '11.F',
    twelveA: '12.A',
    twelveB: '12.B',
    twelveC: '12.C',
    twelveD: '12.D',
    twelveE: '12.E',
    twelveF: '12.F',
    teacher: 'tanár',
    exstudent: 'öregdiák',
}

export type EJGClassType = (typeof EJGClass)[keyof typeof EJGClass]

export interface User {
    e5code: string | null
    name: string
    id: number
    ejg_class: EJGClassType | null
    teams?: Team[]
    permissions?: Permission[]
    activity?: Attender[]
    img_url?: string
    email?: string
}
export type UserStub = Required<Pick<User, 'id' | 'name' | 'ejg_class'>>

export const isTeam = (team: any): team is Team => {
    return team.code !== undefined && team.code !== null
}
interface BasicAttendance {
    id: number
    is_present: boolean
    rank: number | null
    event_id: number
}
export interface UserAttendance extends BasicAttendance {
    user_id: number
    user?: User
}
export interface TeamAttendance extends BasicAttendance {
    team_code: string
    team?: Team
    team_member_attendances: TeamMemberAttendance[]
}

export type AttendingTeam = RequiredAndOmitFields<
    Team,
    'members',
    'activity'
> & {
    pivot: Omit<TeamAttendance, 'team'>
}
export type AttendingUser = Omit<User, 'activity'> & {
    pivot: Omit<UserAttendance, 'user'>
}

export type Attender = AttendingUser | AttendingTeam

export type Attendance = UserAttendance | TeamAttendance

export const isTeamAttendance = (
    attendance: any
): attendance is TeamAttendance => {
    return attendance.team_code !== undefined && attendance.team_code !== null
}
export const isUserAttendance = (
    attendance: any
): attendance is UserAttendance => {
    return attendance.user_id !== undefined && attendance.team_code !== null
}

export const isAttenderUser = (
    attendance: any
): attendance is AttendingUser => {
    return isUserAttendance(attendance.pivot)
}

export const isAttenderTeam = (
    attendance: any
): attendance is AttendingTeam => {
    return isTeamAttendance(attendance.pivot)
}

export const TeamMemberRole = {
    invited: 'meghívott',
    member: 'tag',
    leader: 'vezető',
} as const

export type TeamMemberRoleType =
    (typeof TeamMemberRole)[keyof typeof TeamMemberRole]

export type TeamMembership = {
    team_code: string
    user_id: number
    role: TeamMemberRoleType
}
export type TeamMember = RequiredFields<
    Omit<User, 'teams' | 'attendances'>,
    'ejg_class' | 'id' | 'name'
> & {
    pivot: TeamMembership
}
export interface Team {
    name: string
    code: string
    description: string
    members?: TeamMember[]
    activity?: AttendingTeam[]
}
export const SlotType = {
    Presentation: 'Előadássáv',
    Program: 'Programsáv',
} as const

export type SlotTypeType = (typeof SlotType)[keyof typeof SlotType]

export interface Slot {
    id: number
    starts_at: string
    ends_at: string
    slot_type: SlotTypeType
    name: string

    events?: Event[]
}

export const SignupType = {
    Individual: 'user',
    Team: 'team',
    Both: 'team_user',
} as const

export type SignupTypeType = (typeof SignupType)[keyof typeof SignupType]

export interface Event {
    id: number
    name: string
    description: string
    organiser: string
    capacity: number | null
    occupancy: number
    slot_id: number | null
    location_id?: number
    is_competition: boolean
    img_url?: string | null
    signup_deadline: string | null
    starts_at: string
    ends_at: string
    direct_child?: number | null
    direct_child_slot_id?: number | null
    root_parent?: number | null
    root_parent_slot_id?: number | null
    signup_type: SignupTypeType
    min_team_size?: number | null
    max_team_size?: number | null

    attendances?: Attender[]

    slot?: Slot
    location?: Location
}

export type EventStub = RequiredAndOmitFields<
    Event,
    'slot' | 'location',
    'attendances'
>

export const FloorType = {
    basement: 'alagsor',
    ground: 'földszint',
    half: 'félemelet',
    first: 'első emelet',
    second: 'második emelet',
    third: 'harmadik emelet',
} as const
export type FloorTypeType = (typeof FloorType)[keyof typeof FloorType]

export interface Location {
    id: number
    name: string
    floor: FloorTypeType
    events?: Event[]
    currentEvent?: Event
}

export interface Presentation extends Event {
    slot_id: number
}

export interface Rating {
    user_id: number
    event_id: number
    rating: number

    author?: UserStub
    event?: EventStub
}

export const isTeamCode = (code: string): boolean =>
    code.match(/^[a-zA-Z]{1,10}$/) !== null

export const isE5Code = (code: string): boolean =>
    code.match(/^20[0-9]{2}[A-FN][0-9]{2}EJG[0-9]{3}$/) !== null
