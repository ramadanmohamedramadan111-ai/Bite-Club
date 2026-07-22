'use server';

import { actionClient } from '@/lib/safe-action';
import { idSchema } from '@/schemas/common/id-schema';
import { createOrderPostSchema } from '@/schemas/feed/create-post-schema';
import { ApiResponse } from '@/types/api/api-response';
import { getUserId } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

import { PostType } from '@/types/social/posts';

export const createPostAction = actionClient
  .inputSchema(async () => {
    const t = await getTranslations('forms.createPost');
    return createOrderPostSchema(t);
  })
  .action(async ({ parsedInput }) => {
    const formData = new FormData();
    formData.append('order_id', parsedInput.order_id.toString());
    if (parsedInput.caption) {
      formData.append('caption', parsedInput.caption);
    }
    parsedInput.images.forEach((file) => {
      formData.append('images[]', file);
    });

    const response = await serverFetch<ApiResponse<PostType>>(
      '/posts',
      'POST',
      {
        body: formData,
      },
    );

    updateTag(`posts`);

    return response;
  });

export const likePostAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<null>>(
      `/posts/${parsedInput}/like`,
      'POST',
    );

    updateTag(`posts`);

    return response;
  });

export const unlikePostAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const response = await serverFetch<ApiResponse<null>>(
      `/posts/${parsedInput}/like`,
      'DELETE',
    );

    updateTag(`posts`);

    return response;
  });

export const copyOrderAction = actionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput }) => {
    const userId = await getUserId();
    const response = await serverFetch<ApiResponse<null>>(
      `/posts/${parsedInput}/copy`,
      'POST',
    );

    updateTag(`cart-${userId}`);

    return response;
  });

