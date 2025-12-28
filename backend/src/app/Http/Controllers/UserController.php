<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function registerUser(Request $request)
    {
        try {
            $data = $request->json()->all();
            $uid = $data['uid'];
            $name = $data['name'];
            $email = $data['email'];
            $password = $data['password'];
            $user = User::create([
                'uid' => $uid,
                'name' => $name,
                'email' => $email,
                'password' => bcrypt($password),
            ]);

            return response()->json(['message' => 'User registered successfully!'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User registration failed!', 'message' => $e->getMessage()], 400);
        }
    }
    public function login(Request $request)
    {

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            return response()->json(['message' => 'ログイン成功', 'email' => $credentials['email']]);
        }

        return response()->json(['message' => 'ログインに失敗しました'], 401);
    }
}
