import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createAnalysis, deleteAnalysis, getAnalyses, getAnalysis } from "./api"
import { mockAnalyses } from "./mocks"

describe("Analyses API", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("getAnalyses fetches analyses successfully", async () => {
    const mockResponse = { data: mockAnalyses }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await getAnalyses()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/analyses")
    )
    expect(result).toEqual(mockAnalyses)
  })

  it("getAnalysis fetches a single analysis successfully", async () => {
    const mockAnalysis = mockAnalyses[0]

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAnalysis
    } as Response)

    const analysisId = mockAnalysis.id
    const result = await getAnalysis(analysisId)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/analyses/${analysisId}`)
    )
    expect(result).toEqual(mockAnalysis)
  })

  it("createAnalysis uploads a file successfully", async () => {
    const file = new File(["content"], "test.csv", { type: "text/csv" })
    const mockAnalysis = mockAnalyses[0]

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAnalysis
    } as Response)

    const result = await createAnalysis(file)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/analyses"),
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      })
    )
    expect(result).toEqual(mockAnalysis)
  })

  it("deleteAnalysis deletes an analysis successfully", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true
    } as Response)

    const analysisId = 1
    await deleteAnalysis(analysisId)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/analyses/${analysisId}`),
      expect.objectContaining({
        method: "DELETE"
      })
    )
  })

  it("throws error when response is not ok", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false
    } as Response)

    await expect(getAnalyses()).rejects.toThrow("Network response was not ok")
  })
})
