import { Menu, Transition } from '@headlessui/react'
import { ReactComponent as Donci } from 'assets/donci.svg'
import useIsMobile from 'hooks/useIsMobile'
import { ReactNode } from 'react'

import Locale from 'lib/locale'

import { ThemeSwitch } from 'components/themeSwitch'

import { ReactComponent as Caret } from './assets/caret.svg'
import { ReactComponent as MobileMenu } from './assets/mobileMenu.svg'

const Brand = ({
    href,
    children,
    onClick,
}: {
    href?: string
    children: ReactNode
    onClick?: () => any
}) => {
    const Tag = href ? 'a' : 'span'
    return (
        <Tag href={href} className="flex items-center" onClick={onClick}>
            <Donci className="mr-5 h-full w-12 fill-black dark:fill-white" />
            <span className="self-center whitespace-nowrap text-xl font-semibold">
                {children}
            </span>
        </Tag>
    )
}

const DropDownItem = ({
    href,
    children,
}: {
    href?: string
    children: ReactNode
}) => {
    const Tag = href ? 'a' : 'span'
    return (
        <Menu.Item>
            {({ active }) => (
                <Tag href={href} className="block px-4 py-2 hover:bg-gray-100">
                    {children}
                </Tag>
            )}
        </Menu.Item>
    )
}

const DropDownComponent = ({
    toggle,
    children,
}: {
    toggle: ReactNode
    children: ReactNode
}) => {
    return (
        <Menu as="li">
            {({ open }) => (
                <>
                    <Menu.Button className="flex w-full items-center justify-between rounded py-2 pl-3 pr-4 font-medium text-gray-700 hover:bg-gray-100 md:w-auto md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-700">
                        {toggle}
                        <Caret />
                    </Menu.Button>
                    <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                        static
                    >
                        <Menu.Items
                            static
                            className="z-10 w-44 divide-y divide-gray-100 rounded bg-white font-normal shadow"
                            style={{
                                visibility: open ? 'visible' : 'hidden',
                            }}
                        >
                            <ul
                                className="py-1 text-sm text-gray-700"
                                aria-labelledby="dropdownLargeButton"
                            >
                                {children}
                            </ul>
                        </Menu.Items>
                    </Transition>
                </>
            )}
        </Menu>
    )
}

const Link = ({ href, children }: { href: string; children: ReactNode }) => {
    return (
        <li>
            <a
                href={href}
                className="block rounded py-2 pl-3 pr-4 text-black hover:bg-gray-100 dark:text-white md:p-0 md:hover:bg-inherit md:hover:text-gray-50"
            >
                {children}
            </a>
        </li>
    )
}

const Navbar = ({
    children,
    brand,
}: {
    children: ReactNode
    brand: ReactNode
}) => {
    const locale = Locale({
        hu: {
            openMenu: 'Főmenü megnyitása',
        },
        en: {
            openMenu: 'Open main menu',
        },
    })
    const isMobile = useIsMobile()
    return (
        <nav className="mb-2 rounded border-gray-200 bg-slate-50 px-2 pt-2 text-black dark:bg-gray-700 dark:text-white">
            <Menu as="div" className="">
                {({ open }) => (
                    <div>
                        <div className="container mx-auto flex flex-wrap items-center justify-between">
                            <>{brand}</>
                            {import.meta.env.DEV && (
                                <div className="rounded-lg bg-red-400 px-4 text-2xl font-bold text-gray-700 dark:bg-red-500">
                                    DEV MODE
                                </div>
                            )}

                            <div className="flex">
                                <ul className="mt-0 hidden flex-row space-x-8 rounded-lg p-4 text-sm font-medium md:flex">
                                    {children}
                                </ul>

                                <div className="flex flex-wrap items-center justify-between">
                                    <ThemeSwitch />
                                    <Menu.Button
                                        className="ml-3 inline-flex items-center justify-center rounded-lg  hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 md:hidden"
                                        aria-controls="mobile-menu-2"
                                        aria-expanded="false"
                                    >
                                        <span className="sr-only">
                                            {locale.openMenu}
                                        </span>
                                        <MobileMenu className="h-10 fill-black dark:fill-white" />
                                    </Menu.Button>
                                </div>
                            </div>
                        </div>
                        <Transition
                            show={!isMobile || open}
                            enter="transition duration-200 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-200 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                            static
                        >
                            <Menu.Items
                                className={`w-full ${
                                    isMobile && open ? 'visible' : 'hidden'
                                }`}
                                id="mobile-menu"
                                static
                                as="div"
                            >
                                <ul className="mt-4 flex flex-col rounded-lg border p-4 font-medium">
                                    {children}
                                </ul>
                            </Menu.Items>
                        </Transition>
                    </div>
                )}
            </Menu>
        </nav>
    )
}

const DropDown = Object.assign(DropDownComponent, {
    Item: DropDownItem,
})
export default Object.assign(Navbar, {
    Link,
    Dropdown: DropDown,
    Brand,
})
