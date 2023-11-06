import { RequiredFields } from "types/misc";
import { Attender, Event, isAttenderTeam } from "types/models";

import Form from "components/UIKit/Form";

const displayName = (e: Attender) => {
    if (isAttenderTeam(e)) {
        return e.name;
    } else {
        return `${e.name} - ${e.ejg_class}}`;
    }
};

const ParticipantSearch = ({
    event,
    onChange,
}: {
    event: RequiredFields<Event, "attendees">;
    onChange: (value: Attender) => any;
}) => {
    return (
        <Form.ComboBox
            options={event.attendees}
            getElementName={(e) => e.name}
            renderElement={(e) => <span>{displayName(e)}</span>}
            filter={(s) => (e) =>
                displayName(e)
                    .toLocaleLowerCase()
                    .startsWith(s.toLocaleLowerCase())
            }
            onChange={(e) => {
                if (!e) return;
                onChange(e);
            }}
        />
    );
};

export default ParticipantSearch;
