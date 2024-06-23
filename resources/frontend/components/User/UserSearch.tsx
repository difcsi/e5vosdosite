import useDelay from 'hooks/useDelayed'
import { useState } from 'react'

import { UserStub } from 'types/models'

import baseAPI from 'lib/api'

import Form from 'components/UIKit/Form'

const elementName = (e: UserStub) => `${e.name} - ${e.ejg_class}`

const filter = (s: string) => (e: UserStub) =>
    elementName(e).toLocaleLowerCase().includes(s.toLocaleLowerCase())

const UserSearchCombobox = ({
    onChange,
    initialValue,
    className,
}: {
    onChange: (value: UserStub) => any
    initialValue?: UserStub
    className?: string
}) => {
    const [search, setSearch] = useState<string>('-1')

    const { data: options } = baseAPI.useUserSearchQuery(search ?? '-1')

    const onQueryChange = useDelay((value: string) => {
        if (!value.startsWith(search)) {
            setSearch(value)
        }
    }, 500)

    if (className === undefined) className = ''
    return (
        <div className="w-full">
            <Form.ComboBox
                options={options ?? []}
                initialValue={initialValue ? elementName(initialValue) : ''}
                onQueryChange={onQueryChange}
                getElementName={elementName}
                onChange={(e) => {
                    if (!e) return
                    onChange(e)
                }}
                className={'rounded-l-lg !border-b-0 ' + className}
                renderElement={(e) => (
                    <span className="mt-3">{elementName(e)}</span>
                )}
                filter={filter}
            />
        </div>
    )
}

export default UserSearchCombobox
