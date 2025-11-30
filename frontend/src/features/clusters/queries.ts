import { useQuery } from "@tanstack/react-query"
import { getCluster, getClusters } from "./api"

export const clustersKeys = {
  all: ["clusters"] as const,
  lists: () => [...clustersKeys.all, "list"] as const,
  list: (analysisId: number) => [...clustersKeys.lists(), analysisId] as const,
  details: () => [...clustersKeys.all, "detail"] as const,
  detail: (id: number) => [...clustersKeys.details(), id] as const
}

export const useClusters = (analysisId: number) => {
  return useQuery({
    queryKey: clustersKeys.list(analysisId),
    queryFn: () => getClusters(analysisId)
  })
}

export const useCluster = (id: number) => {
  return useQuery({
    queryKey: clustersKeys.detail(id),
    queryFn: () => getCluster(id)
  })
}
