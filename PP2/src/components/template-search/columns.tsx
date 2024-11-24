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
    header: "ID"
    // ({ column }) => (
    //   <Button
    //     variant="ghost"
    //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //   >
    //     ID
    //     <ArrowUpDown className="ml-2 h-4 w-4" />
    //   </Button>
    // )
    ,
    accessorKey: "id",
    cell: ({ getValue }) => getValue<number>(), // Explicitly define cell
  },
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    header: "Tags",
    accessorKey: "tags",
    cell: ({ getValue }) => {
      const tags = getValue<string[]>();
      return tags.join(", ");
    },
  },
]