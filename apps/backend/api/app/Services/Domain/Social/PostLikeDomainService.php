<?php

namespace App\Services\Domain\Social;

use App\Models\Post;
use App\Models\PostLike;
use Exception;
use Illuminate\Support\Facades\DB;

class PostLikeDomainService
{
    public function likePost(int $postId, int $userId): int
    {
        $post = Post::find($postId);

        if (!$post) {
            throw new Exception(trans('social.post_not_found') ?? 'Post not found.');
        }

        if (!$post->isActiveFeedPost()) {
            throw new Exception(trans('social.cannot_like_post') ?? 'Cannot like pending, rejected, or expired posts.');
        }

        $exists = PostLike::where('post_id', $postId)
            ->where('user_id', $userId)
            ->exists();

        if ($exists) {
            throw new Exception(trans('social.already_liked') ?? 'You have already liked this post.');
        }

        return DB::transaction(function () use ($post, $postId, $userId) {
            PostLike::create([
                'post_id' => $postId,
                'user_id' => $userId,
            ]);

            $post->increment('likes_count');

            return (int) $post->fresh()->likes_count;
        });
    }

    public function unlikePost(int $postId, int $userId): int
    {
        $post = Post::find($postId);

        if (!$post) {
            throw new Exception(trans('social.post_not_found') ?? 'Post not found.');
        }

        $like = PostLike::where('post_id', $postId)
            ->where('user_id', $userId)
            ->first();

        if (!$like) {
            throw new Exception(trans('social.not_liked') ?? 'You have not liked this post.');
        }

        return DB::transaction(function () use ($post, $like) {
            $like->delete();

            if ($post->likes_count > 0) {
                $post->decrement('likes_count');
            }

            return (int) $post->fresh()->likes_count;
        });
    }
}
