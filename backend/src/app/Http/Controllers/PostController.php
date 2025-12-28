<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;

class PostController extends Controller
{
    public function getPosts(Request $request)
    {
        try {
            $posts = Post::all();
            $comments = Comment::all();
            $users = User::all();
            return response()->json([
                'users' => $users,
                'posts' => $posts,
                'comments' => $comments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to retrieve posts',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function getPost(Request $request)
    {
        try {

            $post_id = $request->query('post_id');
            $post = Post::find($post_id);
            return response()->json([
                'post' => $post,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to retrieve this post ',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function share(Request $request)
    {
        try {
            $data = $request->json()->all();

            $uid = $data['user_id'];
            $message = $data['message'];
            $post = Post::create([
                'user_id' => $uid,
                'message' => $message,
            ]);

            return response()->json([
                'message' => 'New message created successfully!',
                'post_id' => $post->id,
                'user_id' => $uid,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'New message not created', 'message' => $e->getMessage()], 400);
        }
    }
    public function delete(Request $request)
    {
        try {
            $data = $request->json()->all();

            $post_id = $data['post_id'];
            $uid = $data['user_id'];
            $record = Post::where('id', $post_id)->where('user_id', $uid)->first();
            if ($record != null) {
                $record->delete();
                return response()->json([
                    'message' => 'Message deleted successfully!',
                ], 200);
            } else {
                return response()->json([
                    'message' => 'This message not yours.',
                ], 201);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Message not deleted', 'message' => $e->getMessage()], 400);
        }
    }
    public function getTargetPost(Request $request)
    {
        try {
            $postId = $request->query('id');

            if (!$postId) {
                return response()->json(['error' => 'ID is required'], 400);
            }
            $post = Post::find($postId);
            $users = User::all();
            return response()->json([
                'post' => $post,
                'users' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to retrieve posts',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function savePosts(Request $request)
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (isset($data['messages'])) {
                $messages = $data['messages'];
                foreach ($messages as $message) {
                    $post = Post::find($message['id']);
                    if ($post) {
                        $post['user_id'] = $message['user_id'];
                        $post['message'] = $message['inputValue'];
                        $post['totalMyLikeCount'] = $message['totalLikeCount'];
                        $post['firstMyLikeCount'] = $message['firstMyLikeCount'];
                        $post['lastMyLikeCount'] = $message['lastMyLikeCount'];
                        $post['isLikeClicked'] = $message['isLikeClicked'];

                        $post->save();
                    } else {
                        Post::create([
                            'user_id' => $message->user_id,
                            'message' => $message->inputValue,
                        ]);
                    }
                }
            }
            return response()->json([
                'post' => "ok",
                'messages' => $messages,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getComments(Request $request)
    {
        try {
            $postId = $request->query('id');

            $comments = Comment::where('post_id', $postId)->get();
            $users = User::all();
            return response()->json([
                'comments' => $comments,
                'users' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Unable to retrieve comments',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function addComment(Request $request)
    {
        try {
            $data = $request->json()->all();
            $post_id = $data['post_id'];
            $uid = $data['user_id'];
            $comment = $data['comment'];
            $comment = Comment::create([
                'post_id' => $post_id,
                'user_id' => $uid,
                'comment' => $comment,
            ]);

            return response()->json([
                'message' => 'New comment created successfully!',
                'id' => $comment->id,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'New comment not created', 'message' => $e->getMessage()], 400);
        }
    }
    public function removeComments(Request $request)
    {
        try {
            $data = $request->json()->all();
            $data = $request;

            $postId = $data['post_id'];

            Comment::where('Post_id', $postId)->delete();
            return response()->json([
                'message' => 'Message and Comments deleted successfully!',
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Message and Comments not deleted', 'message' => $e->getMessage()], 400);
        }
    }

    public function setLikeCount(Request $request)
    {
        try {
            $data = $request->all();
            $messages = $data['messages'] ?? [];
            $loginUserId = $data['login_user_id'] ?? null;

            if (empty($messages)) {
                return response()->json(['messages' => []], 200);
            }

            $postIds = array_column($messages, 'id');

            $totalLikes = Like::whereIn('post_id', $postIds)
                ->selectRaw('post_id, count(*) as count')
                ->groupBy('post_id')
                ->pluck('count', 'post_id');

            $myLikes = Like::whereIn('post_id', $postIds)
                ->where('user_id', $loginUserId)
                ->pluck('post_id')
                ->toArray();


            foreach ($messages as &$message) {
                $pid = $message['id'];
                $message['totalMyLikeCount'] = $totalLikes[$pid] ?? 0;
                $message['firstMyLikeCount'] = in_array($pid, $myLikes) ? 1 : 0;
                $message['lastMyLikeCount']  = $message['firstMyLikeCount'];
                $message['isLikeClicked']    = false;
            }

            return response()->json(['post' => 'ok', 'messages' => $messages], 200);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function syncLikes(Request $request)
    {
        try {
            $userId = $request->input('user_id');
            $messages = $request->input('messages');

            foreach ($messages as $message) {
                $postId = $message['id'];
                $first = $message['firstMyLikeCount'];
                $last = $message['lastMyLikeCount'];

                if ($first == 0 && $last == 1) {
                    Like::updateOrCreate([
                        'post_id' => $postId,
                        'user_id' => $userId
                    ]);
                }
                elseif ($first == 1 && $last == 0) {
                    Like::where('post_id', $postId)
                        ->where('user_id', $userId)
                        ->delete();
                }
            }

            return response()->json(['status' => 'success'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
