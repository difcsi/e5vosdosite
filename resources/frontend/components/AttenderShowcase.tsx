import { Disclosure } from '@headlessui/react'

import {
    Attender,
    AttendingTeam,
    AttendingUser,
    isAttenderTeam,
} from 'types/models'

import Locale from 'lib/locale'
import { getInitials } from 'lib/util'

const locale = Locale({
    hu: {
        individual: 'Egyéni',
        team: 'Csapat',
        rank: (rank: number) => `${rank}. hely`,
    },
    en: {
        individual: 'Individual',
        team: 'Team',
        rank: (rank: number) => `${rank}. place`,
    },
})

const TeamAttenderShowcase = ({ attender }: { attender: AttendingTeam }) => {
    return (
        <Disclosure>
            <Disclosure.Button>
                {attender.pivot.event.slot &&
                    `${attender.pivot.event.slot.name} :`}
                {attender.pivot.event.name} - {attender.name}
                {attender.pivot.event.img_url && (
                    <div>
                        <img
                            alt={attender.pivot.event.name}
                            src={attender.pivot.event.img_url}
                        />
                    </div>
                )}
            </Disclosure.Button>
            <Disclosure.Panel>
                <div>{locale.team}</div>
                <div className="w-full overflow-auto">
                    {attender.members.map((member) => (
                        <div className="rounded-full">
                            {member.img_url ? (
                                <img alt={member.name} src={member.img_url} />
                            ) : (
                                <span>{getInitials(member.name)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </Disclosure.Panel>
        </Disclosure>
    )
}

const UserAttenderShowcase = ({ attender }: { attender: AttendingUser }) => {
    return (
        <Disclosure>
            <Disclosure.Button>
                {attender.pivot.event.slot &&
                    `${attender.pivot.event.slot.name} :`}
                {attender.pivot.event.name} - {attender.name}
            </Disclosure.Button>
            <Disclosure.Panel>
                <div>{locale.individual}</div>
                {attender.pivot.rank && (
                    <div>{locale.rank(attender.pivot.rank)}</div>
                )}
            </Disclosure.Panel>
        </Disclosure>
    )
}

const AttenderShowcase = ({ attender, ...rest }: { attender: Attender }) => {
    if (isAttenderTeam(attender)) {
        return <TeamAttenderShowcase attender={attender} {...rest} />
    } else {
        return <UserAttenderShowcase attender={attender} {...rest} />
    }
}

export default AttenderShowcase
