import { Combobox } from '@headlessui/react'
import React, { FormEventHandler, ReactNode, forwardRef } from 'react'
import { useEffect } from 'react'

import Locale from 'lib/locale'

import { HTMLInputProps } from './helpers'

const locale = Locale({
    hu: {
        combobox: {
            continued: 'További találatok...',
            nonematching: 'Nincs találat',
        },
    },
    en: {
        combobox: {
            continued: 'More results...',
            nonematching: 'No results',
        },
    },
})

const Control = ({
    invalid,
    className,
    onInvalid: onInvalidCallback,
    ...rest
}: {
    invalid?: boolean
    onInvalid?: FormEventHandler<HTMLInputElement>
} & HTMLInputProps<HTMLInputElement>) => {
    const onInvalid: FormEventHandler<HTMLInputElement> = (e) => {
        e.preventDefault()
        onInvalidCallback?.(e)
    }

    return (
        <input
            pattern={invalid ? '' : undefined}
            onInvalid={onInvalid}
            {...rest}
            className={`border-b-2 border-white bg-transparent text-black invalid:border-red invalid:text-red-500 focus:border-gray-400 invalid:focus:text-white dark:text-white ${
                className ?? ''
            }`}
        />
    )
}

const Text = ({
    className,
    children,
    ...rest
}: HTMLInputProps<HTMLDivElement>) => {
    return (
        <div {...rest} className={className}>
            {children}
        </div>
    )
}

const Label = ({
    className,
    children,
    ...rest
}: HTMLInputProps<HTMLSpanElement>) => {
    return (
        <span
            className={`mr-1 font-bold underline underline-offset-4 ${
                className ?? ''
            }`}
        >
            {children}
        </span>
    )
}

const Group = ({
    className,
    children,
    ...rest
}: HTMLInputProps<HTMLLabelElement>) => {
    return (
        <label {...rest} className={`form-group mb-3 ${className ?? ''}`}>
            {children}
        </label>
    )
}

const Form = ({
    className,
    children,
    ...rest
}: { children: ReactNode } & React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
>) => {
    return (
        <form {...rest} className={`${className ?? ''}`}>
            {children}
        </form>
    )
}

const Check = ({
    className,
    invalid,
    onInvalid: onInvalidCallback,
    ...rest
}: HTMLInputProps<HTMLInputElement> & {
    type?: never
    invalid?: boolean
    onInvalid?: FormEventHandler<HTMLInputElement>
}) => {
    return (
        <input
            {...rest}
            pattern={invalid ? '' : undefined}
            onInvalid={onInvalidCallback}
            type="checkbox"
            className={`disabled:bg-gray-300 ${className}`}
        />
    )
}

const Select = forwardRef(
    (
        { children, className, ...rest }: HTMLInputProps<HTMLSelectElement>,
        ref: React.LegacyRef<HTMLSelectElement> | undefined
    ) => {
        return (
            <select
                className={`form-select max-w-sm bg-slate-300 dark:bg-gray ${
                    className ?? ''
                }`}
                {...rest}
                ref={ref}
            >
                {children}
            </select>
        )
    }
)

const Option = ({ children, ...rest }: HTMLInputProps<HTMLOptionElement>) => {
    return <option {...rest}>{children}</option>
}

const ComboBoxOption = ({
    children,
    value,
}: {
    children: ReactNode
    key: any
    value: any
}) => {
    return (
        <Combobox.Option
            value={value}
            className="hover:bg-slate-400 hover:ring-0 hover:dark:bg-gray-300"
        >
            {children}
        </Combobox.Option>
    )
}

const ComboBox = <T = any,>({
    options,
    filter,
    onChange,
    onQueryChange,
    renderElement,
    getElementName,
    className,
    initialValue = '',
    limit = 15,
}: {
    options: T[]
    filter?: (s: string) => (e: T) => boolean
    onChange?: (e: T | null) => void
    onQueryChange?: (s: string) => void
    getElementName: (e: T) => string
    renderElement: (e: T) => ReactNode
    initialValue?: string
    limit?: number
} & Omit<HTMLInputProps<HTMLInputElement>, 'onChange'>) => {
    const [query, setQuery] = React.useState(initialValue)
    const [selected, setSelected] = React.useState<T | null>(null)
    const filteredOptions = filter ? options.filter(filter(query)) : options

    useEffect(() => {
        if (filteredOptions.length === 1) setSelected(filteredOptions[0])
    }, [filteredOptions])

    return (
        <Combobox
            value={selected}
            onChange={(e) => {
                if (!e) return
                setQuery(getElementName(e))
                setSelected(e)
                if (onChange) onChange(e)
            }}
        >
            <Combobox.Input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                    onQueryChange?.(e.target.value)
                }}
                className={`mb-2 mt-0 block w-full border-0 border-b-2 border-gray-200 bg-slate-200 invalid:border-red invalid:text-red focus:border-gray-300 focus:ring-0 dark:bg-gray ${
                    className ?? ''
                }`}
            />
            <Combobox.Options className="scrollbar-track-gray- scrollbar-thumb-min-h-5 mb-2 mt-0 block max-h-64 w-full overflow-auto bg-slate-200 scrollbar-thin scrollbar-thumb-gray-50 hover:scrollbar-thumb-gray-300 dark:bg-gray">
                {filteredOptions.slice(0, limit).map((option, index) => (
                    <ComboBoxOption key={index} value={option}>
                        {renderElement(option)}
                    </ComboBoxOption>
                ))}
                {filteredOptions.length > limit && (
                    <span>{locale.combobox.continued}</span>
                )}
                {filteredOptions.length === 0 && (
                    <span className="text-red-500">
                        {locale.combobox.nonematching}
                    </span>
                )}
            </Combobox.Options>
        </Combobox>
    )
}

export default Object.assign(Form, {
    Control,
    Text,
    Label,
    Group,
    Check,
    Select,
    Option,
    ComboBox,
})
