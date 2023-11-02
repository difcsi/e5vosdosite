import useUser from "hooks/useUser";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import { Team } from "types/models";

import teamAPI from "lib/api/teamAPI";
import Locale from "lib/locale";

import TeamCRUD from "components/Team/CRUD";
import TeamCard from "components/Team/TeamCard";
import Button from "components/UIKit/Button";
import ButtonGroup from "components/UIKit/ButtonGroup";
import Card from "components/UIKit/Card";
import Dialog from "components/UIKit/Dialog";
import Loader from "components/UIKit/Loader";
import { Title } from "components/UIKit/Typography";

const locale = Locale({
    hu: {
        your_teams: "Csapataid",
        view_team: "Csapat megtekintése",
        view_code: "Csapat kódjának megtekintése",
        leave_team: "Csapat elhagyása",
        new_team: "Új csapat",
        team_code: (team_name: string) => `A(z) ${team_name} csapat kódja:`,
    },
    en: {
        your_teams: "Your teams",
        view_team: "View team",
        view_code: "View team code",
        leave_team: "Leave team",
        new_team: "New Team",
        team_code: (team_name: string) =>
            `The code of the ${team_name} team is:`,
    },
});

const YourTeamsPage = () => {
    const [shownTeam, setShownTeam] = useState<Team | null>(null);
    const [shownQR, setShownQR] = useState<Team | null>(null);
    const { user } = useUser();
    const { data: teams, isFetching } = teamAPI.useGetAllTeamsQuery();
    const [leave] = teamAPI.useLeaveMutation();

    useEffect(() => {
        if (shownTeam && !teams?.find((e) => e.code === shownTeam.code))
            setShownTeam(null);
    }, [shownTeam, teams]);

    if (!user) return <Loader />;
    return (
        <>
            <Dialog
                title={locale.team_code(shownQR?.name ?? "")}
                open={shownQR !== null}
                onClose={() => setShownQR(null)}
            >
                <span className="w-full text-center">
                    {shownQR?.code ?? ""}
                </span>
                {shownQR && <QRCode value={shownQR?.code} />}
            </Dialog>
            <Dialog open={shownTeam != null} onClose={() => setShownTeam(null)}>
                {shownTeam && <TeamCard team={shownTeam} currentUser={user} />}
            </Dialog>
            <div>
                <Title>{locale.your_teams}</Title>
                <div className="gap-5 md:grid md:grid-cols-3 xl:grid-cols-4">
                    <div className="my-auto h-1/2 w-full px-6">
                        <h3 className="mb-4 text-center text-2xl font-bold">
                            {locale.new_team}
                        </h3>
                        <TeamCRUD.Creator />
                    </div>
                    {isFetching ? (
                        <div className="h-full md:grid-cols-2 xl:col-span-3">
                            <Loader className="" />
                        </div>
                    ) : (
                        <div className="gap-2 md:col-span-2 md:grid md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
                            {teams?.map((team) => (
                                <Card
                                    key={team.code}
                                    title={team.name}
                                    subtitle={team.code}
                                    buttonBar={
                                        <ButtonGroup>
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    setShownTeam(team)
                                                }
                                            >
                                                {locale.view_team}
                                            </Button>
                                            <Button
                                                variant="info"
                                                onClick={() => setShownQR(team)}
                                            >
                                                {locale.view_code}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    leave({
                                                        user_id: user.id,
                                                        team_code: team.code,
                                                    })
                                                }
                                            >
                                                {locale.leave_team}
                                            </Button>
                                        </ButtonGroup>
                                    }
                                >
                                    {team.description}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default YourTeamsPage;
