<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

class E5NController extends Controller
{
    public function presentations(){
        return view('e5n.map');
    }
    public function attendancesheet($code){
        $presentation = App\Presentation::where('code',$code);
        return view('e5n.attendance',[
            'students' => $presentation->students(), // contains student data
            'signups' => $presentation->signups(), // contains attendance bool
        ]);
    }
    public function scanner(){
        Gate::authorize('e5n.scanner');
        $event = Auth::user()->currentEvent();
        return view('e5n.scanner',[
            'event'=>$event,
        ]);
    }

    public function map(){
        return view('e5n.map');
    }

    public function admin(){
        Gate::authorize('e5n-admin');
        return view('e5n.adminboard');
    }

    public function teams($team){

    }
    public function reset(){
        Gate::authorize('e5n-admin');
        App\Student::updatedatabase();
        Presentation::query()->truncate();
        Event::query()->truncate();

        return view('e5n.reset');
    }

}
