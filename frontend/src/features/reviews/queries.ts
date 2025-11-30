import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteReview, getReview, getReviews, updateReview } from "./api"
import type { ReviewUpdate } from "./types"

export const reviewsKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewsKeys.all, "list"] as const,
  list: (analysisId: number) => [...reviewsKeys.lists(), analysisId] as const,
  details: () => [...reviewsKeys.all, "detail"] as const,
  detail: (id: number) => [...reviewsKeys.details(), id] as const
}

export const useReviews = (analysisId: number) => {
  return useQuery({
    queryKey: reviewsKeys.list(analysisId),
    queryFn: () => getReviews(analysisId)
  })
}

export const useReview = (id: number) => {
  return useQuery({
    queryKey: reviewsKeys.detail(id),
    queryFn: () => getReview(id)
  })
}

export const useUpdateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, update }: { id: number; update: ReviewUpdate }) =>
      updateReview(id, update),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.detail(data.id) })
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.list(data.analysis_id)
      })
    }
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; analysisId: number }) =>
      deleteReview(id),
    onSuccess: (_, { id, analysisId }) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.list(analysisId) })
      queryClient.removeQueries({ queryKey: reviewsKeys.detail(id) })
    }
  })
}
