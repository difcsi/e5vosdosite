import { ReactNode } from 'react'

import ButtonGroup from '../ButtonGroup'

const Card = ({
    title,
    subtitle,
    children,
    className,
    titleClassName,
    subtitleClassName,
    buttonBar: buttonGroup,
    ...rest
}: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> & {
    title?: ReactNode
    subtitle?: ReactNode
    children?: ReactNode
    buttonBar?: ReturnType<typeof ButtonGroup>
    titleClassName?: string
    subtitleClassName?: string
}) => (
    <div
        className={`mb-3 flex flex-col justify-between rounded-lg bg-slate-200 p-2 dark:bg-gray-600 ${
            className ?? ''
        }`}
        {...rest}
    >
        {title && (
            <div>
                <h3
                    className={`px-2 text-center text-xl font-bold ${
                        titleClassName ?? ''
                    }`}
                >
                    {title}
                </h3>
                {subtitle && (
                    <>
                        <h4
                            className={`px-2 text-center text-sm ${
                                subtitleClassName ?? ''
                            }`}
                        >
                            {subtitle}
                        </h4>
                    </>
                )}
            </div>
        )}
        {children && <div className="my-2">{children}</div>}
        {buttonGroup}
    </div>
)

export default Card
