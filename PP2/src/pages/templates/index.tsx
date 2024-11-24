import { useState, useEffect } from "react";
import { TemplateColumn, columns } from "@/components/template-search/columns";
import { DataTable } from "@/components/template-search/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import debounce from 'lodash/debounce';  // a deboucer function to delay the request

async function getTemplates(queryParams: Record<string, string | number>) {
  const queryString = new URLSearchParams(queryParams as any).toString();
  const response = await fetch(`/api/templates?${queryString}`);
  return response.json();
}

export default function TemplatesPage() {
  const [data, setData] = useState<TemplateColumn[]>([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [itemPerPage, setItemPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = debounce(async () => {
      const response = await getTemplates({
        title,
        tags,
        itemPerPage,
        page: currentPage,
      });

      // Transform templates to match TemplateColumn structure
      const templates = response.templates.map((template: any) => ({
        id: template.id,
        title: template.title,
        description: template.explaination, // Map 'explaination' to 'description'
        tags: template.tags.map((tag: any) => tag.name), // Extract tag names
      }));

      setData(templates);
      setTotalPages(response.totalPages);
      console.log(templates);
    }, 300);

    fetchData();

    // Cleanup function to cancel debounce on unmount
    return () => {
      fetchData.cancel();
    };
  }, [title, tags, itemPerPage, currentPage]);

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
        <Select value={itemPerPage} onValueChange={(value) => { setItemPerPage(value); setCurrentPage(1); }}>
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
      <DataTable
        columns={columns}
        data={data}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}