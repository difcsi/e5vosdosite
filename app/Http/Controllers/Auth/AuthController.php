<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\InvalidCodeException;
use App\Http\Controllers\{
    Controller
};
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function redirect($provider = 'google')
    {
        if (auth()->check()) {
            return response('Already logged in', 400);
        }

        return ['url' => Socialite::driver($provider)->stateless()->redirect()->getTargetUrl()];
    }

    public function callback(Request $request, $provider = 'google')
    {
        $userData = Socialite::driver($provider)->stateless()->user();
        $user = User::firstWhere('email', $userData->email);

        if (! isset($user)) {
            $user = User::create([
                'name' => $userData->name,
                'email' => $userData->email,
                'img_url' => $userData->avatar,
            ]);
            Permission::firstOrCreate([
                'user_id' => $user->id,
                'code' => 'STD',
            ]);
        }
        if (! $user->google_id) {
            $user->google_id = Hash::make($userData->id);
        }

        if (! Hash::check($userData->id, $user->google_id)) {
            abort(400);
        }
        $user->save();
        Auth::login($user);
        $tokenName = $request->header('User-Agent');
        $tokenName = strlen($tokenName) > 100 ? substr($tokenName, 0, 100) : $tokenName;
        $token = $user->createToken($tokenName, ['JOIN THE USSR'])->plainTextToken;

        return view('oauth.callback', ['token' => $token]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        return response();
    }

    /**
     * validate with pál ádám
     */
    public function setE5code(Request $request)
    {
        $validated = env('E5VOS_FAKE_API') || Http::post(env('E5VOS_API_URL'), [
            'email' => $request->user()->email,
            'studentId' => $request->e5code,
            'api_token' => env('E5VOS_API_TOKEN'),
        ])->body() === 'true';

        if (! $validated) {
            throw new InvalidCodeException();
        }

        $request->user()->e5code = $request->e5code;
        $ejgLetter = $request->e5code[4];
        $codeYear = intval($request->e5code);
        $ejgYear = date('Y') - $codeYear;
        $currmonth = date('m');

        if ($currmonth < 9) {
            $ejgYear--;
        }

        if ($ejgLetter === 'N') {

            $ejgYear += 8;
            if (($currmonth < 9 && $codeYear == date('Y') - 1) || ($currmonth > 8 && $codeYear == date('Y'))) {
                $ejgYear++;
                $ejgLetter = 'NY';
            } else {
                $ejgLetter = 'E';
            }
        } elseif ($ejgLetter === 'A' || $ejgLetter === 'B') {
            $ejgYear += 7;
        } else {
            $ejgYear += 9;
        }
        $request->user()->ejg_class = strval($ejgYear).'.'.$ejgLetter;
        $request->user()->save();
        Permission::firstOrCreate([
            'user_id' => $request->user()->id,
            'code' => 'STD',
        ]);

        return response()->json([
            'message' => 'E5 code set',
        ], 200);
    }
}
