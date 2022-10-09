export interface User {
  first_name: string;
  last_name: string;
  id: number;
  class: string;
  activity?: IndivitualActivity[]
  teams?: Team[]
}
interface BasicAttendance {
  present: boolean;
  created_at: string;
  updated_at: string;
  scan_at: string;
  place?: number;
  point: number;
}
export interface IndivitualAttendance extends BasicAttendance {
  user: User;
}
export interface TeamAttendance extends BasicAttendance {
  team: Team;
  users: User[];
}

export const isTeamAttendance = (
  attendance: IndivitualAttendance | TeamAttendance
): attendance is TeamAttendance => {
  return (attendance as TeamAttendance).team !== undefined;
};

export type Attendance = IndivitualAttendance | TeamAttendance;

export type UserRole = "operator" | "admin" | "user";
export type TeamMemberRole = "captain" | "member" | "invited";
export interface Team {
  name: string;
  code: string;
  description: string;
  members: { user: User; role: TeamMemberRole }[];
  activity?: TeamActivity[]
}
export interface BaseActivity {
  event: Event;
  attendance: Attendance;
}
export interface IndivitualActivity extends BaseActivity {
  attendance: IndivitualAttendance;
}
export interface TeamActivity extends BaseActivity {
  attendance: TeamAttendance;
}

export type Activity = IndivitualActivity | TeamActivity; 

export interface Event {
  name: string;
  id: string;
  description: string;
  organiser: string;
  capacity: number;
  attendees?: Attendance[]
  //TODO
}

export interface Presentation extends Event {}
export interface Challange extends Event {}