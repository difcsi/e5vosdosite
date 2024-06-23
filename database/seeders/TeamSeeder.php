<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\TeamMembership;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $teamsize = 10;
        $users = User::all();
        Team::factory()
            ->has(
                TeamMembership::factory()
                    ->count($teamsize)
                    ->state(
                        fn ($attributes, Team $team) => [
                            'user_id' => $users->shuffle()
                                ->filter(
                                    fn ($user) => ! array_search($user->id, $team->members->toArray())
                                )->first()->id,
                        ]
                    ),
                'memberships'
            )
            ->count(10)
            ->create();
    }
}
