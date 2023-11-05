<?php

namespace App\Http\Controllers\E5N;

use App\Exceptions\NotAllowedException;
use App\Exceptions\ResourceDidNoExistException;
use App\Http\Controllers\{
    Controller
};


use App\Models\{
    Attendance,
    Event,
    User,
    Team,
    Slot,
};

use App\Helpers\SlotType;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\{
    Cache,
    DB,
};
use App\Http\Resources\EventResource;
use App\Http\Resources\SlotResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\TeamResource;

class EventController extends Controller
{

    /**
     * return event list
     * @return \Illuminate\Http\Response
     */
    public function index(int $slotId = null)
    {
        if (isset($slotId)) {
            if (isset(request()->q)) {
                return response()->json(EventResource::collection(
                    Event::with('slot', 'location')
                        ->where('slot_id', $slotId)
                        ->where('name', 'like', '%' . request()->q . '%')
                        ->get()->load('slot', 'location')
                ));
            }
            return Cache::rememberForever('e5n.events.slot.' . $slotId, fn () => EventResource::collection(Event::with('slot', 'location')->where('slot_id', $slotId)->get())->jsonSerialize());
        }
        if (isset(request()->q)) {
            return response()->json(EventResource::collection(
                Event::where('name', 'like', '%' . request()->q . '%')
                    ->get()->load('slot', 'location')
            ));
        }
        return Cache::rememberForever('e5n.events.all', fn () => EventResource::collection(Event::all()->load('slot', 'location'))->jsonSerialize());
    }

    /**
     * Create an event.
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $slot = Slot::find($request->slot_id);
        if (!isset($request->signup_type)) {
            $request->signup_deadline = null;
            $request->capacity = null;
        } else {
            $request->signup_deadline = $request->signup_deadline ?? $slot->starts_at;
        }
        if ($request->starts_at < $slot->starts_at) {
            $request->starts_at = $slot->starts_at;
        }
        if ($request->ends_at > $slot->ends_at) {
            $request->ends_at = $slot->ends_at;
        }
        $event = Event::create($request->all());
        $event = new EventResource($event);
        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        return Cache::rememberForever('e5n.events.' . $event->id, fn () => $event->jsonSerialize());
    }

    /**
     * return specific event
     * @return \Illuminate\Http\Response
     */
    public function show(int $id)
    {
        return Cache::rememberForever('e5n.events.' . $id, function () use ($id) {
            $data = new EventResource(Event::findOrFail($id)->load('slot', 'location'));
            return $data->jsonSerialize();
        });
    }

    /**
     * edit a specific event.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $eventId)
    {
        $slot = Slot::find($request->slot_id);
        if (!isset($request->signup_type)) {
            $request->signup_deadline = null;
            $request->capacity = null;
        } else {
            $request->signup_deadline = $request->signup_deadline ?? $slot->starts_at;
        }
        if ($request->starts_at < $slot->starts_at) {
            $request->starts_at = $slot->starts_at;
        }
        if ($request->ends_at > $slot->ends_at) {
            $request->ends_at = $slot->ends_at;
        }
        $event  = Event::findOrFail($eventId)->update($request->all());
        $event = new EventResource($event);
        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        Cache::forever('e5n.events.' . $eventId, $event->jsonSerialize());
        return Cache::get('e5n.events.' . $eventId);
    }

    /**
     * delete a specific event.
     *
     * @return \Illuminate\Http\Response
     */
    public function delete($eventId)
    {
        $event = Event::findOrFail($eventId);
        Cache::forget('e5n.events.slot.' . $event->slot_id);
        $event->delete();
        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        Cache::forget('e5n.events.' . $eventId);
        return response()->noContent();
    }

    /**
     * restore a specific event.
     *
     * @return \Illuminate\Http\Response
     */
    public function restore($eventId)
    {
        $event = Event::withTrashed()->findOrFail($eventId);
        $event->restore();
        $event = new EventResource($event);
        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        Cache::forever('e5n.events.' . $event->id, $event->jsonSerialize());
        return Cache::get('e5n.events.' . $event->id);
    }

    /**
     * close signup of event
     * @return \Illuminate\Http\Response
     */
    public function close_signup($eventId)
    {
        $event = Event::findOrFail($eventId);
        $event->signup_deadline = now()->format('Y-m-d H:i:s');
        $event->save();
        $event = new EventResource($event);
        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        Cache::forever('e5n.events.' . $event->id, $event->jsonSerialize());
        return Cache::get('e5n.events.' . $event->id);
    }

    /**
     * return all presentations
     * @return \Illuminate\Http\Response
     */
    public function presentations()
    {
        return Cache::rememberForever('e5n.events.presentations', fn () => SlotResource::collection(Slot::where('slot_type', SlotType::presentation)->get()->load('events'))->jsonSerialize());
    }

    /**
     * signup user or team to event
     */
    public function signup(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);
        if (!is_numeric($request->attender)) {
            $attender = strlen($request->attender) == 13 ? User::where('e5code', $request->attender)->firstOrFail() : Team::where('code', $request->attender)->firstOrFail();
        } else {
            $attender = User::findOrFail($request->attender);
        }
        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        Cache::forget('e5n.events.mypresentations.' . ($attender->e5code ?? $attender->code));
        Cache::forget('e5n.events.' . $event->id . '.signups');
        Cache::forget('e5n.events.slot.' . $event->slot_id);
        Cache::forget('e5n.events.' . $event->id);
        return response($attender->signUp($event), 201);
    }

    /**
     * unsignup user or team from event
     */
    public function unsignup(Request $request, $eventId, $force = false)
    {
        $event = Event::findOrFail($eventId);
        if (!$force && $event->root_parent !== null) {
            return EventController::unsignup($request, $event->root_parent);
        }
        $attender = strlen($request->attender) == 13 || is_numeric($request->attender) ? 'user_id' : 'team_code';
        $attenderId = $attender === 'user_id' && !is_numeric($request->attender) ? User::where('e5code', $request->attender)->firstOrFail()->id : $request->attender;
        $attendance = Attendance::where('event_id', $eventId)->where($attender, $attenderId)->first();
        if ($attendance === null) {
            throw new ResourceDidNoExistException();
        }
        if ($attendance->is_present) {
            throw new NotAllowedException();
        }
        if ($event->direct_child !== null) {
            EventController::unsignup($request, $event->direct_child, true);
        }
        $attendance->teamMemberAttendances()->delete();
        $attendance->delete();

        Cache::forget('e5n.events.all');
        Cache::forget('e5n.events.presentations');
        Cache::forget('e5n.events.mypresentations.' . $request->attender);
        Cache::forget('e5n.events.' . $eventId . '.signups');
        Cache::forget('e5n.events.slot.' . Event::find($eventId)?->slot_id);
        Cache::forget('e5n.events.' . $eventId);
        $event->forget('occupancy');
        return $event->root_parent === null ? response()->noContent() : null;
    }

    /**
     * make user atend at an event
     */
    public function attend(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);
        $attender = is_numeric($request->attender)
            ? User::findOrFail($request->attender)
            : (strlen($request->attender) == 13
                ? User::where('e5code', $request->attender)->firstOrFail()
                : Team::where('code', $request->attender)->firstOrFail());
        Cache::forget('e5n.events.' . $event->id . '.signups');
        return response($attender->attend($event), 200);
    }

    public function teamMemberAttend($attendanceId)
    {
        $attendance = Attendance::findOrFail($attendanceId);
        if (!request()->user()->can('attend', $attendance->event)) {
            throw new NotAllowedException();
        }
        $presentAttendanceIds = [];
        $absentAttendanceIds = [];
        foreach (json_decode(request()->memberAttendances) as $memberAttendance) {
            if ($memberAttendance->is_present) {
                $presentAttendanceIds[] = $memberAttendance->user_id;
            } else {
                $absentAttendanceIds[] = $memberAttendance->user_id;
            }
        }
        $attendance->teamMemberAttendances()->whereIn('user_id', $presentAttendanceIds)->update(['is_present' => true]);
        $attendance->teamMemberAttendances()->whereIn('user_id', $absentAttendanceIds)->update(['is_present' => false]);
        return response()->json($attendance->teamMemberAttendances, 200);
    }

    /**
     * return all participating entities for an event
     */
    public function participants($eventId)
    {
        return Cache::rememberForever(
            'e5n.events.' . $eventId . '.signups',
            function () use ($eventId) {
                $event = Event::findOrFail($eventId)->load('attendances.user:id,name,ejg_class', 'attendances.team.members:id,name,ejg_class', 'attendances.teamMemberAttendances'); // roland to check
                return UserResource::collection($event->users)->concat(TeamResource::collection($event->teams->with("members")))->jsonSerialize();
            }
        );
    }

    /**
     * return all presentations where the user has signed up
     */
    public function myPresentations(Request $request)
    {
        $user = User::findOrFail($request->user()->id)->load('presentations');
        return Cache::rememberForever(
            'e5n.events.mypresentations.' . $user->e5code,
            fn () => EventResource::collection($user->presentations->load("location"))->jsonSerialize()
        );
    }
}
