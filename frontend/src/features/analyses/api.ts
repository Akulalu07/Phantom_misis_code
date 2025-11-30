import type { Analysis } from "./types"
import { settings } from "@/shared/config/env"

export const getAnalyses = async (): Promise<Array<Analysis>> => {
  const response = await fetch(`${settings.backend.api}/analyses`)

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  const json = await response.json()
  return json.data ?? []
}

export const getAnalysis = async (id: number): Promise<Analysis> => {
  const response = await fetch(`${settings.backend.api}/analyses/${id}`)

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  return response.json()
}

export const createAnalysis = async (file: File): Promise<Analysis> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${settings.backend.api}/analyses`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  return response.json()
}

export const deleteAnalysis = async (id: number): Promise<void> => {
  const response = await fetch(`${settings.backend.api}/analyses/${id}`, {
    method: "DELETE"
  })

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
}
