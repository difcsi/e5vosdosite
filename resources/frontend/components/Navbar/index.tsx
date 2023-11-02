import { ReactComponent as Donci } from "assets/donci.svg";
import useUser from "hooks/useUser";
import { useState } from "react";
import QRCode from "react-qr-code";

import Locale from "lib/locale";

import Dialog from "components/UIKit/Dialog";
import Navbar from "components/UIKit/Navbar";

const locale = Locale({
    hu: {
        presentationSignup: "Előadásjelentkezés",
        homepage: "Főoldal",
        login: "Bejelentkezés",
        logout: "Kijelentkezés",
        info: "DÖ Információk",
        noe5code: "Nincs E5 kódod :(",
    },
    en: {
        presentationSignup: "Presentation signup",
        homepage: "Homepage",
        login: "Login",
        logout: "Logout",
        info: "SU Information",
        noe5code: "You have no E5 code :(",
    },
});

const CustomNavbar = () => {
    const { user } = useUser(false);
    const [showCode, setShowCode] = useState(false);
    return (
        <>
            {user && (
                <Dialog
                    title={`${user.name} (${user.ejg_class})`}
                    onClose={() => setShowCode(false)}
                    open={showCode}
                >
                    <span className="w-full text-center">
                        {user.e5code ?? locale.noe5code}
                    </span>
                    {user.e5code ? (
                        <QRCode className="max-w-full" value={user.e5code} />
                    ) : (
                        <Donci className="mx-auto animate-pulse fill-red" />
                    )}
                </Dialog>
            )}
            <Navbar
                brand={
                    <Navbar.Brand onClick={() => setShowCode(true)}>
                        {user ? user.name : locale.homepage}
                    </Navbar.Brand>
                }
            >
                <Navbar.Link href="https://info.e5vosdo.hu">
                    {locale.info}
                </Navbar.Link>
                <Navbar.Link href="/eloadas">
                    {locale.presentationSignup}
                </Navbar.Link>
                {!user && (
                    <Navbar.Link href="/login">{locale.login}</Navbar.Link>
                )}
                {user && (
                    <Navbar.Link href="/logout">{locale.logout}</Navbar.Link>
                )}
            </Navbar>
        </>
    );
};
export default CustomNavbar;
