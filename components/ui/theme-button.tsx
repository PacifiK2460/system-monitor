"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"

export function ThemeButton() {
    const { theme, setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-full p-2">
                <Button variant="ghost" className="justify-start">
                    <Palette />
                    <span>Tema</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Tema de la Aplicación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={(tema) => {
                    setTheme(tema)
                }}>
                    <DropdownMenuRadioItem value="dark">Oscuro</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">Definido por el Sistema</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
