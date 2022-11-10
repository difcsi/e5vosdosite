import Gate, { gated } from "components/Gate";
import PresentationCard from "components/PresentationCard";
import Button from "components/UIKit/Button";
import ButtonGroup from "components/UIKit/ButtonGroup";
import Form from "components/UIKit/Form";
import Loader from "components/UIKit/Loader";
import useGetPresentationSlotsQuery from "hooks/useGetPresentationSlotsQuery";
import useUser from "hooks/useUser";
import { api } from "lib/api";
import { isOperator, isTeacher } from "lib/gates";
import { useState, useMemo } from "react";
import { Presentation } from "types/models";
const PresentationManagePage = () => {
  const [currentSlot, setcurrentSlot] = useState(0);
  const { data: slots } = useGetPresentationSlotsQuery();
  const {
    data: presentations,
    isLoading: isEventsLoading,
    isFetching: isEventsFetching,
  } = api.useGetEventsQuery((slots && slots[currentSlot]?.id) ?? -1);

  const { user } = useUser();

  const [searchterm, setSearchterm] = useState("");

  const filteredpresentations = presentations?.filter(
    (presentation) =>
      presentation.name.toLowerCase().includes(searchterm) ||
      presentation.organiser.toLowerCase().includes(searchterm)
  );

  const fillAllowed = useMemo(() => user && isOperator(user), [user]);

  return (
    <div className="mx-10">
      <div className="mx-auto mt-3 h-full text-center">
        <h1 className="mb-3 text-4xl font-bold">Előadások kezelése</h1>
        <Form.Group>
          <Form.Label>Keresés</Form.Label>
          <Form.Control
            className="border border-black"
            onChange={(e) => setSearchterm(e.target.value.toLowerCase())}
          />
        </Form.Group>
        <ButtonGroup className="mx-2 my-3">
          {slots?.map((slot, index) => (
            <Button
              variant="primary"
              key={index}
              disabled={index === currentSlot}
              onClick={() => setcurrentSlot(index)}
            >
              {slot.name}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      {isEventsFetching ? (
        <Loader />
      ) : (
        <div className="grid-cols-4 gap-2 md:grid">
          {filteredpresentations?.map((presentation) => (
            <PresentationCard
              key={presentation.id}
              presentation={presentation as Presentation}
              className="mb-3 md:mb-0"
              fillAllowed={fillAllowed ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default gated(PresentationManagePage, isTeacher);
