import { useEffect, useState } from 'react'
import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number
}

const MoonFilledIcon = ({
    size = 24,
    width,
    height,
    ...props
}: IconSvgProps) => (
    <svg
        aria-hidden="true"
        focusable="false"
        height={size || height}
        role="presentation"
        viewBox="0 0 24 24"
        width={size || width}
        {...props}
    >
        <path
            d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
            fill="currentColor"
        />
    </svg>
)

const SunFilledIcon = ({
    size = 24,
    width,
    height,
    ...props
}: IconSvgProps) => (
    <svg
        aria-hidden="true"
        focusable="false"
        height={size || height}
        role="presentation"
        viewBox="0 0 24 24"
        width={size || width}
        {...props}
    >
        <g fill="currentColor">
            <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
            <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
        </g>
    </svg>
)

const SystemThemeIcon = ({
    size = 24,
    width,
    height,
    ...props
}: IconSvgProps) => (
    <svg
        width="24"
        height="24"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        imageRendering="optimizeQuality"
        fillRule="evenodd"
        clipRule="evenodd"
        viewBox="0 0 512 512"
        {...props}
    >
        <g>
            <path d="M 272.5,31.5 C 281.859,31.3674 288.026,35.7007 291,44.5C 291.667,65.1667 291.667,85.8333 291,106.5C 288.361,114.138 283.027,118.472 275,119.5C 267.259,118.637 261.925,114.637 259,107.5C 258.333,86.1667 258.333,64.8333 259,43.5C 261.196,36.7985 265.696,32.7985 272.5,31.5 Z" />
        </g>
        <g>
            <path d="M 109.5,98.5 C 114.412,98.0631 119.078,98.8964 123.5,101C 137.667,115.167 151.833,129.333 166,143.5C 169.978,151.616 169.145,159.116 163.5,166C 157.543,169.763 151.21,170.429 144.5,168C 129.695,154.196 115.195,140.029 101,125.5C 94.9325,113.54 97.7658,104.54 109.5,98.5 Z" />
        </g>
        <g>
            <path d="M 401.5,106.5 C 406.548,106.127 411.215,107.294 415.5,110C 462.966,158.712 484.133,217.212 479,285.5C 469.714,359.394 433.214,415.227 369.5,453C 313.744,482.346 255.744,487.679 195.5,469C 162.866,457.685 134.366,439.852 110,415.5C 103.673,403.142 106.84,394.309 119.5,389C 208.525,369.43 279.692,322.93 333,249.5C 361.548,209.389 380.548,165.056 390,116.5C 392.566,111.645 396.399,108.311 401.5,106.5 Z" />
        </g>
        <g>
            <path d="M 276.5,148.5 C 301.64,147.078 325.64,151.578 348.5,162C 311.391,244.776 251.725,305.443 169.5,344C 165.599,345.967 161.599,347.3 157.5,348C 137.335,297.149 142.835,249.315 174,204.5C 200.203,171.314 234.37,152.648 276.5,148.5 Z" />
        </g>
        <g>
            <path d="M 42.5,259.5 C 64.1692,259.333 85.8359,259.5 107.5,260C 117.915,265.479 120.748,273.646 116,284.5C 113.065,289.111 108.898,291.611 103.5,292C 82.7821,292.953 62.1154,292.62 41.5,291C 34.513,288.193 31.1797,283.027 31.5,275.5C 31.293,267.392 34.9597,262.059 42.5,259.5 Z" />
        </g>
    </svg>
)

export const ThemeSwitch = () => {
    const [theme, setIsDarkMode] = useState(localStorage.theme)

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.remove('light')
            document.documentElement.classList.add('dark')
            localStorage.theme = 'dark'
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
            localStorage.theme = 'light'
        } else {
            localStorage.theme = 'system'
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.remove('light')
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
                document.documentElement.classList.add('light')
            }
        }
    }, [theme])

    const toggleTheme = () => {
        setIsDarkMode((prevMode: string) =>
            prevMode === 'light'
                ? 'dark'
                : prevMode === 'dark'
                ? 'system'
                : 'light'
        )
    }

    return (
        <div onClick={toggleTheme}>
            {theme === 'dark' ? (
                <MoonFilledIcon size={22} />
            ) : theme === 'light' ? (
                <SunFilledIcon size={22} />
            ) : (
                <SystemThemeIcon
                    className="fill-black dark:fill-white"
                    size={22}
                />
            )}
        </div>
    )
}
