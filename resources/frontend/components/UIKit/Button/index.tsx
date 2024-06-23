import React from 'react'

const Button = ({
    variant = 'primary',
    type = 'button',
    children,
    className,
    ...rest
}: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    variant?:
        | 'primary'
        | 'outline-primary'
        | 'secondary'
        | 'outline-secondary'
        | 'danger'
        | 'outline-danger'
        | 'success'
        | 'outline-success'
        | 'warning'
        | 'outline-warning'
        | 'info'
        | 'outline-info'
}) => {
    if (type === 'submit' && !variant) variant = 'success'

    let buttonclass = 'outline outline-5 dark:outline-2 outline-offset-0  '
    switch (variant) {
        case 'primary':
            buttonclass +=
                'bg-blue-300 text-black outline-blue-300 enabled:hover:bg-blue-500 enabled:hover:text-white disabled:bg-blue-600 disabled:text-white dark:bg-blue-400 dark:text-white dark:outline-blue-400 enabled:hover:dark:bg-blue-600 disabled:dark:bg-blue-700'
            break
        case 'outline-primary':
            buttonclass +=
                'text-black outline-blue-400 enabled:hover:bg-blue-400 disabled:bg-blue-700 dark:text-white'
            break
        case 'secondary':
            buttonclass +=
                'bg-slate-200 text-black outline-slate-200 enabled:hover:bg-slate-500 enabled:hover:text-white disabled:bg-slate-400 dark:bg-white dark:outline-white enabled:hover:dark:bg-gray-600 disabled:dark:bg-gray-600 disabled:dark:text-white'
            break
        case 'outline-secondary':
            buttonclass +=
                'text-black outline-slate-300 enabled:hover:bg-slate-300 enabled:hover:text-black disabled:bg-white disabled:text-black dark:text-white dark:outline-white enabled:hover:dark:bg-white'
            break
        case 'danger':
            buttonclass +=
                'bg-rose-500 text-black outline-rose-500 enabled:hover:bg-red-500 enabled:hover:text-white disabled:bg-red-600 disabled:text-white dark:bg-red-500 dark:text-white dark:outline-red-500 enabled:hover:dark:bg-red-700 disabled:dark:bg-red-700'
            break
        case 'outline-danger':
            buttonclass +=
                'text-black outline-red enabled:hover:bg-red enabled:hover:text-white disabled:bg-red disabled:text-white dark:text-white'
            break
        case 'success':
            buttonclass +=
                'bg-green text-black outline-green enabled:hover:bg-green-700 enabled:hover:text-white disabled:bg-green-700 disabled:text-white dark:text-white'
            break
        case 'outline-success':
            buttonclass +=
                'text-black outline-green enabled:hover:bg-green enabled:hover:text-black disabled:bg-green disabled:text-black dark:text-white'
            break
        case 'warning':
            buttonclass +=
                'bg-goldenrod text-black outline-goldenrod enabled:hover:bg-goldenrod-700 enabled:hover:text-white disabled:bg-goldenrod-700 disabled:text-white'
            break
        case 'outline-warning':
            buttonclass +=
                'disabled:bg-godlenrod text-black outline-goldenrod enabled:hover:bg-goldenrod enabled:hover:text-black disabled:text-black dark:text-white'
            break
        case 'info':
            buttonclass +=
                'bg-blue-400 text-black outline-blue-400 enabled:hover:bg-blue-600 enabled:hover:text-white disabled:bg-blue-700 disabled:text-white dark:bg-blue-600 dark:text-white dark:outline-blue-600 enabled:hover:dark:bg-blue-700'
            break
        case 'outline-info':
            buttonclass +=
                'text-black outline-blue-600 enabled:hover:bg-blue-600 enabled:hover:text-white disabled:bg-blue disabled:text-white dark:text-white'
            break
        default:
    }

    return (
        <button
            {...rest}
            type={type}
            className={`rounded px-4 py-2 font-semibold ${buttonclass} ${
                className ?? ''
            }`}
        >
            {children}
        </button>
    )
}
export default Button
