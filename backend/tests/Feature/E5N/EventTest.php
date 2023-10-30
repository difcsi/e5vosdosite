<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Slot;
use App\Models\User;
use App\Models\Permission;
use Tests\TestCase;

class EventTest extends TestCase
{
    /**
     * A test to check if events can be created.
     */
    public function test_events_can_be_created()
    {
        $event = Event::factory()->count(1)->make()->toArray()[0];
        $event["slot_id"] = Slot::first()->get()[0]->id;
        $event["occupancy"] = null;
        unset($event["occupancy"]);
        $user = User::first();
        Permission::where('user_id', $user->id)->delete();
        $response = $this->actingAs($user)->post('/api/events', $event);
        $response->assertStatus(201);
        $this->assertDatabaseHas('events', $event);
    }

    /**
     * A test to check if the events can be retrieved.
     */
    public function test_events_can_be_requested()
    {
        $response = $this->get('/api/events');
        $response->assertStatus(200);
    }

    /**
     * A test to check if evets can be retrieved for a slot
     */
    public function test_events_can_be_requested_for_a_slot()
    {
        $response = $this->get('/api/events/' . Slot::first()->id);
        $response->assertStatus(200);
    }

    /**
     * A test to check if an event can be retrieved.
     */
    public function test_event_can_be_requested()
    {
        $event = Event::inRandomOrder()->first();

        $response = $this->get('/api/event/' . $event->id);
        $response->assertStatus(200);
    }

    /*
    * A test to check if events can be updated.
    */
    public function test_events_can_be_updated()
    {
        $event = Event::inRandomOrder()->first();
        $eventData = Event::factory()->count(1)->make()->toArray()[0];
        $user = User::first();
        Permission::where('user_id', $user->id)->delete();

        $response = $this->actingAs($user)->put('/api/event/' . $event->id, $eventData);
        $response->assertStatus(403);

        Permission::create(['code' => 'ORG', 'user_id' => $user->id, 'event_id' => $event->id]);
        $response = $this->actingAs($user)->put('/api/event/' . $event->id, $eventData);
        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'name' => $eventData['name'],
        ]);
    }

    /**
     * A test to check if events can be deleted.
     */
    public function test_events_can_be_deleted()
    {
        $event = Event::inRandomOrder()->first();

        $user = User::first();
        Permission::where('user_id', $user->id)->delete();

        $response = $this->actingAs($user)->delete('/api/event/' . $event->id);
        $response->assertStatus(403);

        Permission::create(['code' => 'ADM', 'user_id' => $user->id]);
        $response = $this->actingAs($user)->delete('/api/event/' . $event->id);
        $response->assertStatus(200);

        $this->assertEquals(null, Event::find($event->id));
    }


    /**
     * A test to check if events can be restored.
     */
    public function test_events_can_be_restored()
    {
        $event = Event::inRandomOrder()->first();
        $event->delete();
        $user = User::first();
        Permission::where('user_id', $user->id)->delete();

        $response = $this->actingAs($user)->put('/api/event/' . $event->id . '/restore');
        $response->assertStatus(403);

        Permission::create(['code' => 'ADM', 'user_id' => $user->id]);
        $response = $this->actingAs($user)->put('/api/event/' . $event->id . '/restore');
        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id
        ]);
    }

    /**
     * A test to check if signup for an event can be closed.
     * @return void
     */
    public function test_signup_for_an_event_can_be_closed()
    {
        $this->markTestIncomplete('relies on attendance system');

        $event = Event::inRandomOrder()->first();
        $user = User::first();
        Permission::where('user_id', $user->id)->delete();

        $response = $this->actingAs($user)->put('/api/event/' . $event->id . '/close');
        $response->assertStatus(403);

        Permission::create(['code' => 'ORG', 'user_id' => $user->id, 'event_id' => $event->id]);
        $response = $this->actingAs($user)->put('/api/event/' . $event->id . '/close');
        $response->assertStatus(200);

        //assert that the event is closed
    }
}
