<?php

namespace App\Exceptions;

use Exception;

class WrongSignupTypeException extends Exception
{
    public function render()
    {
        return response()->json([
            'message' => 'Az esményre nem lehet ilyen típusú jelentkezést létrehozni.',
        ], 400);
    }
}
