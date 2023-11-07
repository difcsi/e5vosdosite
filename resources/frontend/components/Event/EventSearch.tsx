import useDelay from "hooks/useDelayed";
import { useState } from "react";

import { EventStub } from "types/models";

import eventAPI from "lib/api/eventAPI";

import Form from "components/UIKit/Form";

const EventSearchCombobox = ({
    onChange,
    initialValue,
}: {
    onChange: (value: EventStub) => any;
    initialValue?: EventStub;
}) => {
    const [search, setSearch] = useState("");
    const { data: options } = eventAPI.useEventSearchQuery(search);

    const onQueryChange = useDelay((value: string) => {
        if (
            options?.some((e) =>
                e.name
                    .toLocaleLowerCase()
                    .includes(value[0].toLocaleLowerCase()),
            )
        ) {
            setSearch(value[0]);
        }
    });

    return (
        <div className="max-w-sm">
            <Form.ComboBox
                options={options ?? []}
                onQueryChange={onQueryChange}
                initialValue={initialValue ? initialValue.name : ""}
                onChange={(e) => {
                    if (!e) return;
                    onChange(e);
                }}
                className="!mb-0 !border-b-0"
                getElementName={(e) => e.name}
                renderElement={(e) => <span>{e.name}</span>}
                filter={(s) => (e) =>
                    e.name.toLocaleLowerCase().startsWith(s.toLocaleLowerCase())
                }
            />
        </div>
    );
};

export default EventSearchCombobox;
