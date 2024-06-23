import { ReactNode } from 'react'

import DebugDump from 'components/Debug/DebugDump'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'

export const BaseLayout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <DebugDump />
            <Navbar />
            <main className="px-2">{children}</main>
            <Footer />
        </>
    )
}
