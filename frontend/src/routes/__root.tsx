import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import { HeroUIProvider } from "@heroui/react"
import type { QueryClient } from "@tanstack/react-query"
import TanStackQueryDevtools from "@/shared/lib/tanstack-query/devtools"

import { LayoutHeader } from "@/widgets/layout/header"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root
})

function Root() {
  return (
    <HeroUIProvider>
      <LayoutHeader />
      <div className="relative mt-6 flex w-full justify-center pb-6">
        <Outlet />
      </div>
      <TanStackDevtools
        config={{
          position: "bottom-right"
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />
          },
          TanStackQueryDevtools
        ]}
      />
    </HeroUIProvider>
  )
}
