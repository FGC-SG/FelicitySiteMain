import { Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLayout } from "@/components/layout-provider"

export function LayoutToggle() {
  const { layout, setLayout } = useLayout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" data-testid="button-layout-toggle">
          {layout === "desktop" ? (
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Smartphone className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle layout</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="dropdown-layout-menu">
        <DropdownMenuItem onClick={() => setLayout("desktop")} data-testid="button-desktop-layout">
          <Monitor className="h-4 w-4 mr-2" />
          Desktop
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLayout("mobile")} data-testid="button-mobile-layout">
          <Smartphone className="h-4 w-4 mr-2" />
          Mobile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
