import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getCluster, getClusters } from "./api"
import { mockClusters } from "./mocks"

describe("Clusters API", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("getClusters fetches clusters successfully", async () => {
    const mockResponse = { data: mockClusters }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const analysisId = 1
    const result = await getClusters(analysisId)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/analyses/${analysisId}/clusters`)
    )
    expect(result).toEqual(mockClusters)
  })

  it("getCluster fetches a single cluster successfully", async () => {
    const mockCluster = mockClusters[0]

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockCluster
    } as Response)

    const clusterId = mockCluster.id
    const result = await getCluster(clusterId)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/clusters/${clusterId}`)
    )
    expect(result).toEqual(mockCluster)
  })

  it("throws error when response is not ok", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false
    } as Response)

    await expect(getClusters(1)).rejects.toThrow("Network response was not ok")
  })
})
