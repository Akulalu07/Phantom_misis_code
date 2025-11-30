import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createAnalysis, deleteAnalysis, getAnalyses, getAnalysis } from "./api"

export const analysesKeys = {
  all: ["analyses"] as const,
  lists: () => [...analysesKeys.all, "list"] as const,
  details: () => [...analysesKeys.all, "detail"] as const,
  detail: (id: number) => [...analysesKeys.details(), id] as const
}

export const useAnalyses = () => {
  return useQuery({
    queryKey: analysesKeys.lists(),
    queryFn: getAnalyses,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false

      return data.some((analysis) => analysis.status === "pending")
        ? 5000
        : false
    }
  })
}

export const useAnalysis = (id: number) => {
  return useQuery({
    queryKey: analysesKeys.detail(id),
    queryFn: () => getAnalysis(id),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false

      return data.status === "pending" ? 1000 : false
    }
  })
}

export const useCreateAnalysis = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() })
    }
  })
}

export const useDeleteAnalysis = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() })
    }
  })
}
