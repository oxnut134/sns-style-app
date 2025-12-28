<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('register/user', [UserController::class, 'registerUser']);
Route::post('/login', [UserController::class, 'login']);

Route::get('/get/posts', [PostController::class, 'getPosts']);
Route::get('/get/post', [PostController::class, 'getPost']);
Route::post('/share', [PostController::class, 'share']);
Route::post('/delete', [PostController::class, 'delete']);
Route::post('/save/posts', [PostController::class, 'savePosts']);

Route::get('/get/target/post', [PostController::class, 'getTargetPost']);
Route::get('/get/comments', [PostController::class, 'getComments']);
Route::post('/add/comment', [PostController::class, 'addComment']);
Route::post('/delete/comments', [PostController::class, 'removeComments']);

Route::post('/set/likeCount', [PostController::class, 'setLikeCount']);
Route::post('/sync/likes', [PostController::class, 'syncLikes']);






