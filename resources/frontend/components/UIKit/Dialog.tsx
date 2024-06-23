import { Dialog as DialogHeadless } from '@headlessui/react'
import { ReactNode } from 'react'

import Locale from 'lib/locale'

import Button from './Button'
import Loader from './Loader'

const locale = Locale({
    hu: {
        close: 'Bezárás',
    },
    en: {
        close: 'Close',
    },
})

const Scroller = ({ children }: { children: ReactNode }) => {
    return <div className="scroller  h-[500px] overflow-auto">{children}</div>
}

type Closable = {
    onClose: () => void
    closable?: true
}

type Unclosable = {
    onClose?: never
    closable: false
}

const noop = (a: boolean) => {}

const Dialog = ({
    open = true,
    title,
    description,
    children,
    isLoading = false,
    onClose,
    closable,
}: {
    open?: boolean
    title?: string | ReactNode
    description?: string | ReactNode
    children?: ReactNode
    isLoading?: boolean
} & (Closable | Unclosable)) => {
    return (
        <DialogHeadless
            open={open}
            onClose={closable ? onClose! : noop}
            className="relative z-50"
        >
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
                aria-hidden="true"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogHeadless.Panel className="mx-auto flex max-h-[95%] min-w-[200px] max-w-[95%] flex-col gap-4 rounded-3xl border-8 border-slate-400 bg-slate-300 p-3 shadow-xl shadow-gray-800 dark:border-gray-700  dark:bg-gray-600">
                    <div className="overflow-auto">
                        {isLoading ? (
                            <Loader />
                        ) : (
                            <div>
                                <div className="mx-4 mb-4 text-center">
                                    {title && (
                                        <DialogHeadless.Title className="text-lg font-bold">
                                            {title}
                                        </DialogHeadless.Title>
                                    )}
                                    {description && (
                                        <DialogHeadless.Description className="mb-3 text-justify">
                                            {description}
                                        </DialogHeadless.Description>
                                    )}
                                    {children}
                                </div>
                            </div>
                        )}
                    </div>
                    {closable !== false && (
                        <div className="mx-auto w-full text-center">
                            <Button
                                onClick={onClose}
                                className="!w-full rounded-lg"
                                variant="danger"
                            >
                                {locale.close}
                            </Button>
                        </div>
                    )}
                </DialogHeadless.Panel>
            </div>
        </DialogHeadless>
    )
}

export default Object.assign(Dialog, { Scroller })
