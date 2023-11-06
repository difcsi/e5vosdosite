import { FC } from "react";

import { Presentation } from "types/models";

import Locale from "lib/locale";

import Button from "components/UIKit/Button";
import Loader from "components/UIKit/Loader";

const getColor = (capacity: number | null) => {
    if (capacity === null) return "bg-green-400";
    switch (true) {
        case capacity > 20:
            return "bg-green-400";
        case capacity > 15:
            return "bg-yellow-400";
        case capacity > 10:
            return "bg-yellow-600";
        case capacity > 5:
            return "bg-red-400";
        default:
            return "bg-red-500";
    }
};

const locale = Locale({
    hu: {
        presentation: {
            title: "Előadás címe",
            organiser: "Előadó",
            description: "Előadás leírása",
            location: "Előadás helye",
            freeCapacity: "Szabad helyek",
            multislot: {
                starts: (SlotHref: FC) => (
                    <>
                        Ez az előadás a<SlotHref />
                        -ban kezdődik.
                    </>
                ),
                continues: (SlotHref: FC) => (
                    <>
                        Ez az előadás a<SlotHref />
                        -ban végződik.
                    </>
                ),
            },
        },
        overfilled: "Túltöltve",
        unrestricted: "Korlátlan",
        select: "Kiválaszt",
    },
    en: {
        presentation: {
            title: "Presentation title",
            organiser: "Organiser",
            description: "Presentation description",
            location: "Presentation location",
            freeCapacity: "Free capacity",
            multislot: {
                starts: (SlotHref: FC) => (
                    <>
                        This presentation starts in <SlotHref />.
                    </>
                ),
                continues: (SlotHref: FC) => (
                    <>
                        This presentation ends in <SlotHref />.
                    </>
                ),
            },
        },
        overfilled: "Overfilled",
        unrestricted: "Unrestricted",
        select: "Select",
    },
});

const PresentationsTable = ({
    presentations,
    callback,
    selectSlot,
    slotName,
    disabled,
    isLoading,
}: {
    presentations: Presentation[];
    callback?: (presentation: Presentation) => void;
    selectSlot: (id: number) => void;
    slotName: (id: number) => string | JSX.Element;
    disabled?: boolean;
    isLoading?: boolean;
}) => {
    return (
        <table className="flex w-full table-auto border-separate border-spacing-x-0.5 border-spacing-y-1 flex-col text-sm md:table md:border-spacing-y-2 md:text-lg">
            <thead className="hidden border-separate bg-gray-300 text-white md:table-header-group ">
                <tr className="shadow-md">
                    <th className="rounded-l-lg py-1">
                        {locale.presentation.title}
                    </th>
                    <th className="py-1">{locale.presentation.organiser}</th>
                    <th className="py-1">{locale.presentation.description}</th>
                    <th>{locale.presentation.location}</th>
                    <th className="rounded-r-lg py-1 md:min-w-fit">
                        {locale.presentation.freeCapacity}
                    </th>
                </tr>
            </thead>
            <tbody>
                {isLoading && (
                    <tr>
                        <td colSpan={4}>
                            <Loader />
                        </td>
                    </tr>
                )}
                {!isLoading &&
                    presentations.map((presentation, index) => (
                        <tr
                            key={index}
                            className="mb-5 flex flex-col rounded bg-gray-400 shadow-md md:table-row md:rounded-none"
                        >
                            <td className="rounded-l-lg border-hidden px-2 py-0.5  text-center text-4xl font-bold md:text-lg">
                                {presentation.name}
                            </td>
                            <td className="px-2 py-0.5 text-center underline ">
                                {presentation.organiser}
                            </td>
                            <td className=" text-center ">
                                <div className="flex h-full flex-col justify-around">
                                    <p className="flex-1 px-2 py-0.5">
                                        {presentation.description}{" "}
                                    </p>
                                    {presentation.direct_child ||
                                        (presentation.root_parent && (
                                            <div className="bg-blue-500">
                                                {presentation.root_parent_slot_id &&
                                                    locale.presentation.multislot.starts(
                                                        () => (
                                                            <span
                                                                className="text-green-400"
                                                                onClick={() => {
                                                                    console.log(
                                                                        "selecting",
                                                                        presentation.root_parent_slot_id!,
                                                                    );
                                                                    selectSlot(
                                                                        presentation.root_parent_slot_id!,
                                                                    );
                                                                }}
                                                            >
                                                                {slotName(
                                                                    presentation.root_parent_slot_id!,
                                                                )}
                                                            </span>
                                                        ),
                                                    )}
                                                {presentation.direct_child_slot_id &&
                                                    locale.presentation.multislot.continues(
                                                        () => (
                                                            <span
                                                                className="text-green-400"
                                                                onClick={() => {
                                                                    console.log(
                                                                        "Selecting slot",
                                                                        presentation.direct_child_slot_id,
                                                                    );
                                                                    selectSlot(
                                                                        presentation.direct_child_slot_id!,
                                                                    );
                                                                }}
                                                            >
                                                                {slotName(
                                                                    presentation.direct_child_slot_id!,
                                                                )}
                                                            </span>
                                                        ),
                                                    )}
                                            </div>
                                        ))}
                                </div>
                            </td>
                            <td className="text-bold text-center text-2xl font-semibold md:text-lg">
                                <span className="font-bold md:hidden">
                                    {locale.presentation.location}:{" "}
                                </span>
                                {presentation.location?.name ??
                                    "Ismeretlen hely"}
                            </td>
                            <td
                                className={
                                    "m-4 whitespace-normal rounded-l-lg rounded-r-lg border-hidden  px-2 py-2 text-center text-black md:h-24 md:rounded-l-none md:py-0 " +
                                    getColor(
                                        presentation.capacity
                                            ? presentation.capacity -
                                                  presentation.occupancy
                                            : null,
                                    )
                                }
                            >
                                <div className="py-0.5">
                                    <div>
                                        {presentation.capacity
                                            ? presentation.capacity -
                                                  presentation.occupancy <
                                              0
                                                ? locale.overfilled
                                                : presentation.capacity -
                                                  presentation.occupancy
                                            : locale.unrestricted}
                                    </div>
                                    {callback &&
                                    (!presentation.signup_deadline ||
                                        Date.parse(
                                            presentation.signup_deadline,
                                        ) >= Date.now()) &&
                                    (!presentation.capacity ||
                                        presentation.capacity >
                                            presentation.occupancy) ? (
                                        <div>
                                            <Button
                                                variant="secondary"
                                                className="px-2 py-0"
                                                onClick={() =>
                                                    callback(presentation)
                                                }
                                                disabled={disabled}
                                            >
                                                {locale.select}
                                            </Button>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default PresentationsTable;
