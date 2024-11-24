"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"

export type TemplateColumn = {
    id: number
    title: string
    description: string
    tags: string[]
}

export const columns: ColumnDef<TemplateColumn>[] = [
    {
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
        accessorKey: "id",
    },
    {
        header: "Title",
        accessorKey: "title",
    },
    {
        header: "Description",
        accessorKey: "description",
    },
    {
        header: "Tags",
        accessorKey: "tags",
    },
]