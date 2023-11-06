<?php

namespace App\Http\Controllers\E5N;

use App\Helpers\PermissionType;
use App\Http\Controllers\Controller;
use App\Models\{
    Slot,
    User,
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\SlotResource;
use App\Http\Resources\UserResource;

class SlotController extends Controller
{
    /**
     * return all slots
     */
    public function index()
    {
        return Cache::rememberForever('e5n.slot.all', fn () => SlotResource::collection(Slot::all())->jsonSerialize());
    }

    /**
     * create a new slot
     */
    public function store(Request $request)
    {
        $slot = Slot::create($request->all());
        $slot = new SlotResource($slot);
        Cache::forget('e5n.slot.all');
        return response(Cache::rememberForever('e5n.slot.' . $slot->id, fn () => $slot->jsonSerialize()), 201);
    }

    /**
     * update a slot
     */
    public function update(Request $request, $slotId)
    {
        $slot = (Slot::find($slotId) ?? abort(404));
        $slot->update($request->all());
        $slot = new SlotResource($slot);
        Cache::forget('e5n.slot.all');
        Cache::forever('e5n.slot.' . $slot->id, $slot->jsonSerialize());
        return Cache::get('e5n.slot.' . $slot->id);
    }

    /**
     * delete a slot
     */
    public function destroy($slotId)
    {
        $slot = Slot::findOrFail($slotId);
        $slot->delete();
        Cache::forget('e5n.slot.all');
        Cache::forget('e5n.slot.' . $slot->id);
        return response()->noContent();
    }

    /**
     * return all students who are not busy in this slot
     */
    public function freeStudents($slotId)
    {
        return Cache::remember("freeStudents" . $slotId, 60, fn () => UserResource::collection(User::whereDoesntHave('events', function ($query) use ($slotId) {
            $query->where('slot_id', $slotId);
        })->get())->jsonSerialize());
    }

    public function nonAttendingStudents($slotId)
    {
        Cache::remember("notAttendingStudents" . $slotId, 60, fn () => UserResource::collection(User::whereDoesntHave('attendances', function ($query) use ($slotId) {
            $query->where('is_present', true);
        })->whereHas('event', function ($query) use ($slotId) {
            $query->where('slot_id', $slotId);
        })->get())->jsonSerialize());
    }
    public function AttendingStudents($slotId)
    {
        return UserResource::collection(User::whereRelation('permissions', 'code', PermissionType::Student->value)->whereHas('attendances', function ($query) use ($slotId) {
            $query->where('is_present', true)->whereHas('event', function ($query) use ($slotId) {
                $query->where('slot_id', $slotId);
            });
        })->get())->jsonSerialize();
    }
}
