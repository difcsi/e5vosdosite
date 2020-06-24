<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Presentation extends Model
{
    public $timestamps = false;
    protected $table = 'presentations';

    public function signups(){
        return $this->hasMany(PresentationSignup::class);
    }
    public function students(){
        return $this->hasManyThrough(PresentationSignup::class,Student::class);
    }
}
