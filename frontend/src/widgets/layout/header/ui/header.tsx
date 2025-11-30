import {
  Button,
  Link as HeroLink,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from "@heroui/react"
import { Link } from "@tanstack/react-router"
import GitHub from "./github"
import { settings } from "@/shared/config/env"

export default function Header() {
  return (
    <Navbar
      shouldHideOnScroll
      isBordered
      maxWidth="xl"
      classNames={{ wrapper: "px-4" }}
    >
      <NavbarBrand>
        <Link to="/" className="font-bold text-inherit text-lg tracking-tight">
          Hack & Change
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            as={HeroLink}
            variant="flat"
            href={settings.github}
            target="_blank"
            radius="full"
            className="bg-default-100 hover:bg-default-200 text-default-foreground font-medium"
            startContent={<GitHub className="w-5 h-5" />}
          >
            GitHub
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
