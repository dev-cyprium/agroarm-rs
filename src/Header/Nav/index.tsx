'use client'

import React from 'react'

import type { NavItemWithChildren, NavItemLink } from '../Component'

import { CMSLink } from '@/components/Link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { Menu, SearchIcon, X } from 'lucide-react'

type HeaderNavProps = {
  resolvedNavItems: NavItemWithChildren[]
  mobileOpen: boolean
  onToggleMobileMenu: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  resolvedNavItems,
  mobileOpen,
  onToggleMobileMenu,
}) => {
  return (
    <div className="relative flex items-center">
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="gap-1">
          {resolvedNavItems.map((navItem, i) => {
            if (navItem.type === 'category' && navItem.category) {
              const label = navItem.categoryLabel || navItem.category.title
              return (
                <NavigationMenuItem key={navItem.id || i}>
                  <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-foreground/85 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 data-[state=open]:bg-white/20 dark:data-[state=open]:bg-white/10">
                    {label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-1 p-2">
                      {navItem.children?.map((child) => (
                        <li key={child.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/kategorije/${child.slug}`}
                              className="block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {child.title}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            }

            return (
              <NavigationMenuItem key={navItem.id || i}>
                <CMSLink
                  {...(navItem as NavItemLink).link}
                  appearance="link"
                  className="text-sm font-medium text-foreground/85 hover:text-foreground no-underline hover:no-underline transition-colors"
                />
              </NavigationMenuItem>
            )
          })}
          <NavigationMenuItem>
            <Link
              href="/search"
              className="text-foreground/80 hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10"
              aria-label="Search"
            >
              <SearchIcon className="w-5" />
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <button
        type="button"
        className={cn(
          'md:hidden inline-flex items-center justify-center rounded-full p-2 transition-colors',
          mobileOpen
            ? 'bg-black/40 text-white shadow-[0_8px_20px_rgba(2,6,23,0.35)] ring-1 ring-white/30 backdrop-blur-sm'
            : 'text-foreground/90 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10',
        )}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-panel"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={onToggleMobileMenu}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  )
}
