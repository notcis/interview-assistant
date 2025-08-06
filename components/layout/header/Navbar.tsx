"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  User,
  Skeleton,
} from "@heroui/react";
import NextLink from "next/link";

import { Logo } from "@/config/logo";
import HeaderUser from "./HeaderUser";
import { Button, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { siteConfig } from "@/config/site";
import { signOut, useSession } from "next-auth/react";
import { UserWithDetails } from "@/interface";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data, status } = useSession();

  const user = data?.user as UserWithDetails;

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2"></NavbarItem>

        {data?.user && status === "authenticated" ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button
                className="bg-foreground font-medium text-background px-5"
                color="secondary"
                radius="full"
                variant="flat"
                as={Link}
                href="/subscribe"
              >
                Subscribe for $9.99
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden sm:flex">
              <HeaderUser user={user} />
            </NavbarItem>
          </>
        ) : (
          <>
            {status === "loading" && (
              <div className="max-w-[150px] w-full flex items-center gap-3">
                <div>
                  <Skeleton className="flex rounded-full w-12 h-12" />
                </div>
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="h-3 w-3/5 rounded-lg" />
                  <Skeleton className="h-3 w-4/5 rounded-lg" />
                </div>
              </div>
            )}
            {status === "unauthenticated" && (
              <Button
                className="bg-foreground font-medium text-background px-5"
                color="secondary"
                endContent={<Icon icon="solar:alt-arrow-right-linear" />}
                radius="full"
                variant="flat"
                as={Link}
                href="/login"
              >
                Login
              </Button>
            )}
          </>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {data?.user && status === "authenticated" ? (
          <>
            <NavbarMenuToggle aria-label="Open menu" />
            <NavbarMenu className="pt-16">
              <User
                as="button"
                avatarProps={{
                  isBordered: true,
                  src:
                    user.ProfilePicture?.url ||
                    user.image ||
                    "/images/default_user.png",
                }}
                className="transition-transform"
                description={user.email}
                name={user.name}
              />
              <NavbarMenuItem>
                <Link
                  color={"foreground"}
                  href="/admin/dashboard"
                  size="lg"
                  className="flex gap-1"
                  onPress={() => setIsMenuOpen(false)}
                >
                  <Icon icon="tabler:user-cog" /> Admin Dashboard
                </Link>
              </NavbarMenuItem>

              <NavbarMenuItem>
                <Link
                  color={"foreground"}
                  href="/app/dashboard"
                  size="lg"
                  className="flex gap-1"
                  onPress={() => setIsMenuOpen(false)}
                >
                  <Icon icon="hugeicons:ai-brain-04" /> App Dashboard
                </Link>
              </NavbarMenuItem>

              <NavbarMenuItem>
                <Link
                  color={"danger"}
                  as={Link}
                  size="lg"
                  className="flex gap-1"
                  onPress={() => signOut()}
                >
                  <Icon icon="tabler:logout-2" /> Logout
                </Link>
              </NavbarMenuItem>
            </NavbarMenu>
          </>
        ) : (
          status === "unauthenticated" && (
            <NavbarItem>
              <Button
                className="bg-foreground font-medium text-background px-5"
                color="secondary"
                endContent={<Icon icon="solar:alt-arrow-right-linear" />}
                radius="full"
                variant="flat"
                as={Link}
                href="/login"
              >
                Login
              </Button>
            </NavbarItem>
          )
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};

export default Navbar;
