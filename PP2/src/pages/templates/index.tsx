import { useState, useEffect } from "react";
import { TemplateColumn, columns } from "@/components/template-search/columns";
import { DataTable } from "@/components/template-search/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import debounce from 'lodash/debounce';  // a deboucer function to delay the request

async function getTemplates(queryParams: Record<string, string | number>) {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`/api/templates?${queryString}`);
  return response.json();
}

export default function TemplatesPage() {
  const [data, setData] = useState<TemplateColumn[]>([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [itemPerPage, setItemPerPage] = useState("10");

  useEffect(() => {
    const fetchData = debounce(async () => {
      const templates = await getTemplates({
        title,
        tags,
        itemPerPage,
      });
      setData(templates);
    }, 300);

    fetchData();

    // Cleanup function to cancel debounce on unmount
    return () => {
      fetchData.cancel();
    };
  }, [title, tags, itemPerPage]);

  return (
    <div>
      {/* Filter Inputs */}
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Search Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Search Tags (comma separated)..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <Select value={itemPerPage} onValueChange={setItemPerPage}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable<TemplateColumn, string> columns={columns} data={data} />
    </div>
  );
}