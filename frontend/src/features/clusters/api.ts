import type { Cluster } from "./types"
import { settings } from "@/shared/config/env"

export const getClusters = async (
  analysisId: number
): Promise<Array<Cluster>> => {
  const response = await fetch(
    `${settings.backend.api}/analyses/${analysisId}/clusters`
  )

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  const json = await response.json()
  return json.data
}

export const getCluster = async (id: number): Promise<Cluster> => {
  const response = await fetch(`${settings.backend.api}/clusters/${id}`)

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  return response.json()
}
