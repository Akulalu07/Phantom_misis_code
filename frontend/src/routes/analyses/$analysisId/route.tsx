import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate
} from "@tanstack/react-router"
import { Divider, Tab, Tabs } from "@heroui/react"
import {
  ChartNetwork,
  ChevronsLeft,
  House,
  MessageSquareText
} from "lucide-react"

export const Route = createFileRoute("/analyses/$analysisId")({
  parseParams: (params) => ({
    analysisId: Number(params.analysisId)
  }),
  component: AnalysisLayout
})

function AnalysisLayout() {
  const { analysisId } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  const navigate = useNavigate()

  const getTabKey = (path: string) => {
    if (path.endsWith("/clusters")) return "clusters"
    if (path.endsWith("/reviews")) return "reviews"
    return "home"
  }

  const activeTab = getTabKey(pathname)

  const handleTabChange = (key: string) => {
    switch (key) {
      case "home":
        navigate({ to: "/analyses/$analysisId", params: { analysisId } })
        break
      case "clusters":
        navigate({
          to: "/analyses/$analysisId/clusters",
          params: { analysisId }
        })
        break
      case "reviews":
        navigate({
          to: "/analyses/$analysisId/reviews",
          params: { analysisId }
        })
        break
    }
  }

  const menuItems = [
    {
      key: "home",
      label: "Обзор",
      icon: House,
      to: "/analyses/$analysisId",
      params: { analysisId },
      activeOptions: { exact: true }
    },
    {
      key: "clusters",
      label: "Кластеры",
      icon: ChartNetwork,
      to: "/analyses/$analysisId/clusters",
      params: { analysisId }
    },
    {
      key: "reviews",
      label: "Список отзывов",
      icon: MessageSquareText,
      to: "/analyses/$analysisId/reviews",
      params: { analysisId }
    }
  ]

  return (
    <div className="flex flex-col md:flex-row w-full gap-6 max-w-7xl px-4">
      <div className="md:hidden w-full sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <Tabs
          fullWidth
          aria-label="Navigation"
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(key as string)}
          color="default"
          variant="solid"
        >
          {menuItems.map((item) => (
            <Tab key={item.key} title={item.label} />
          ))}
        </Tabs>
      </div>

      <div className="hidden md:flex flex-col w-64 shrink-0 gap-4">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              params={item.params}
              activeOptions={item.activeOptions}
              className="group flex items-center gap-3 px-4 py-3 rounded-full transition-colors hover:bg-default-100 outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-2 rounded-full transition-colors ${isActive ? "bg-foreground text-background" : "bg-default-100 text-default-500 group-hover:text-foreground"}`}
                  >
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <span
                    className={`font-medium ${isActive ? "text-foreground" : "text-default-500 group-hover:text-foreground"}`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>

        <div className="mx-4">
          <Divider />
        </div>

        <div className="flex flex-col gap-1">
          <Link
            to="/"
            className="group flex items-center gap-3 px-4 py-3 rounded-full transition-colors hover:bg-default-100 outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <div className="p-2 rounded-full bg-default-100 text-default-500 group-hover:text-foreground">
              <ChevronsLeft size={20} strokeWidth={2} />
            </div>
            <span className="font-medium text-default-500 group-hover:text-foreground">
              К списку
            </span>
          </Link>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
