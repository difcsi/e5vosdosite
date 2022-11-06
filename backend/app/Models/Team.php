<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Helpers\MembershipType;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Exceptions\EventFullException;
use App\Exceptions\AlreadySignedUpException;
use App\Exceptions\SignupRequiredException;

/**
 * App\Models\Team
 * @property string $name
 * @property string $code
 */
class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'teams';

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['code','name'];

    protected $casts = [
        'code' => 'string',
    ];


    /**
     * Get all of the members for the Team
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_memberships', 'team_code', 'user_id')->withPivot('role');
    }

    /*
    * get all attendances for the team
    */
    public function signups(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get all signups where the team was present
     */
    public function attendances(): HasMany
    {
        return $this->signups()->where('is_present', true);
    }


    /*
    * get all users that attend a specific event for the team
    */
    public function usersAttendingEvent(Event $event): BelongsToMany
    {
        return $this->attendances()->where('event_id',$event->id)->userInTeam();
    }

    /**
     * Create a new membership in the team for $user
     * @param User $user the membership to create
     * @param MembershipType $membershipType (optional) the type of membership to create (default: Invited)
     * @return TeamMembership newly created membership
     */
    public function addMember(User $user, $role=MembershipType::Invited){
        $teamMember = new TeamMembership();
        $teamMember->team()->associate($this);
        $teamMember->user()->associate($user);
        $teamMember->role=$role;
        $teamMember->save();
        return $teamMember;
    }

    /**
     * Sign up user to $event
     *
     * @param  Event $event
     * @throws EventFullException if the event is full
     * @throws AlreadySignedUpException if the user is already signed up
     * @throws SignupNotRequiredException if the event does not require signups
     * @return Attendance the newly created attendance
     */
    public function signUp(Event $event)
    {
        if (isset($event->capacity) && $event->occupancy >= $event->capacity) {
            throw new EventFullException();
        }
        if ($this->signups()->where('event_id', $event->id)->exists()) {
            throw new AlreadySignedUpException();
        }
        $signup = new Attendance();
        $signup->event()->associate($event);
        $signup->team()->associate($this);
        $signup->save();
        return $signup;
    }

    /**
     * make user attend $event
     *
     * @param  Event $event
     * @throws StudentBusyException if user is busy at the event timeslot
     * @throws EventFullException if the event is full
     * @return EventSignup the newly created EventSignup object
     */
    public function attend(Event $event)
    {
        if (isset($event->capacity) && $event->occupancy >= $event->capacity) {
            throw new EventFullException();
        }
        $signup = $this->signups()->where('event_id', $event->id)->first();
        if (!isset($signup)) {
            $signup = new Attendance();
            $signup->event()->associate($event);
            $signup->user()->associate($this);
        }
        $signup->togglePresent();
        $signup->save();
        return $signup;
    }
}
