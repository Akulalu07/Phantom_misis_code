import { createFileRoute } from "@tanstack/react-router"
import { AnalysesCreate } from "@/widgets/analyses/create"
import { AnalysesList } from "@/widgets/analyses/list"

export const Route = createFileRoute("/")({
  component: App
})

function App() {
  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 px-4">
      <div className="flex gap-4 justify-between items-center flex-wrap">
        <h1 className="text-2xl font-bold">Мои файлы</h1>
        <AnalysesCreate />
      </div>
      <AnalysesList />
    </div>
  )
}
