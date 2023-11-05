<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Helpers\PermissionType;
use App\Helpers\HasCompositeKey;

/**
 * App\Models\Permission
 * @property int $user_id
 * @property int|null $event_id
 * @property int $code
 */



class Permission extends Model
{
    use HasFactory, HasCompositeKey;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'permissions';

    protected $primaryKey = ['user_id', 'event_id', 'code'];

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'event_id',
        'code',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * override the find method for composite key
     */
    public static function find($id)
    {
        return static::where('user_id', $id[0])
            ->where('event_id', $id[1])
            ->where('code', $id[1] ? PermissionType::Organiser->value : $id[2])
            ->limit(1) ?? null;
    }

    /**
     * Get the user that owns the permission.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    /**
     * Get the event that has the permission.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
