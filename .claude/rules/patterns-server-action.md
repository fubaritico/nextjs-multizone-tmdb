# Pattern — Server Action + useMutation

## When to use
- User triggers a mutation: add to favorites, rate a movie, submit a form
- Need optimistic update + rollback on error
- Server-side side effect (DB write, external API POST, cache revalidation)

## Server Action (app/lib/actions.ts)

```typescript jsx
// apps/home/src/app/lib/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export type AddToFavoritesResult =
  | { success: true; movieId: number }
  | { success: false; error: string }

export async function addToFavorites(movieId: number): Promise<AddToFavoritesResult> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/account/{account_id}/favorite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        },
        body: JSON.stringify({
          media_type: 'movie',
          media_id: movieId,
          favorite: true,
        }),
      }
    )

    if (!response.ok) {
      const errorData = (await response.json()) as { status_message?: string }
      return { success: false, error: errorData.status_message ?? 'Failed to add' }
    }

    revalidateTag('favorites')
    return { success: true, movieId }
  } catch {
    return { success: false, error: 'Network error' }
  }
}
```

## Client Component with useMutation + optimistic update

```typescript jsx
// apps/home/src/components/FavoriteButton/FavoriteButton.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToFavorites } from '../../app/lib/actions'

import type { AddToFavoritesResult } from '../../app/lib/actions'
import type { FC } from 'react'

interface FavoriteButtonProps {
  movieId: number
  isFavorite?: boolean
}

const FavoriteButton: FC<FavoriteButtonProps> = ({ movieId, isFavorite = false }) => {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation<
    AddToFavoritesResult,
    Error,
    { movieId: number },
    { previousFavorites: number[] }
  >({
    mutationFn: ({ movieId: id }) => addToFavorites(id),

    // Optimistic update — apply immediately, rollback on error
    onMutate: async ({ movieId: id }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previousFavorites = queryClient.getQueryData<number[]>(['favorites']) ?? []
      queryClient.setQueryData<number[]>(['favorites'], (old = []) => [...old, id])
      return { previousFavorites }
    },

    onSuccess: (result) => {
      if (!result.success) return
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },

    onError: (_error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
    },
  })

  return (
    <button
      onClick={() => mutate({ movieId })}
      disabled={isPending}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? <span>★</span> : <span>☆</span>}
    </button>
  )
}

export default FavoriteButton
```

## Rules
- Always use JSDocs to document Server Actions, functions, components, properties, interfaces, types, etc.
- Server Actions live in `app/lib/actions.ts` — always `'use server'` at the top
- Always return a typed discriminated union result: `{ success: true } | { success: false; error: string }`
- Never throw from a Server Action — return error result instead
- Call `revalidateTag` or `revalidatePath` after successful mutations
- Client Component uses `useMutation` — never calls Server Action directly outside mutation
- Always implement `onMutate` (optimistic) + `onError` (rollback) for user-facing mutations
- `onSuccess`: check `result.success` before invalidating queries
