import { ReactComponent as Donci } from 'assets/donci.svg'
import { Link } from 'react-router-dom'

import Locale from 'lib/locale'

const locale = Locale({
    hu: {
        title: 'Eötvös József Gimnázium Diákönkormányzata',
        privacypolicy: 'Adatvédelmi nyilatkozat',
        contact: 'Kapcsolat',
        github: 'GitHub',
    },
    en: {
        title: 'Student Union of Eötvös József Grammar School',
        privacypolicy: 'Privacy policy',
        contact: 'Contact',
        github: 'GitHub',
    },
})

const Footer = () => {
    return (
        <div className="flex flex-col justify-between bg-slate-100 px-8 py-3 align-middle dark:bg-gray-800 md:flex-row">
            <div className=" flex w-full flex-col items-center justify-start text-center md:flex-row md:gap-2">
                <Donci className="w-10 fill-black hover:animate-wiggle dark:fill-white" />
                <p className="md:my-auto">{locale.title}</p>
            </div>
            <div className="flex w-full justify-evenly gap-2 md:mt-2 md:justify-end">
                <Link to="/privacypolicy">{locale.privacypolicy}</Link>
                <Link to="mailto:dev.do@e5vos.hu">{locale.contact}</Link>
                <Link to="https://github.com/e5vos/e5vosdosite">
                    {locale.github}
                </Link>
            </div>
        </div>
    )
}

export default Footer
