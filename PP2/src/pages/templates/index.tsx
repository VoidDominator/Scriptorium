import { useState, useEffect } from "react";
import { TemplateColumn, columns } from "@/components/template-search/columns";
import { DataTable } from "@/components/template-search/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import debounce from 'lodash/debounce';  // a deboucer function to delay the request

async function getTemplates(queryParams: Record<string, string | number>) {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, v]) => v !== "")
  );

  const queryString = new URLSearchParams(filteredParams as any).toString();
  const response = await fetch(`/api/templates?${queryString}`);
  return response.json();
}

export default function TemplatesPage() {
  const [data, setData] = useState<TemplateColumn[]>([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [itemPerPage, setItemPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = debounce(async () => {
      const response = await getTemplates({
        title,
        tags,
        explaination: description, // Map description to explaination
        content,
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
    }, 300);

    fetchData();

    // Cleanup function to cancel debounce on unmount
    return () => {
      fetchData.cancel();
    };
  }, [title, tags, description, content, itemPerPage, currentPage]); // Update dependencies

  return (
    <div>
      {/* Filter Inputs */}
      <div className="flex flex-wrap space-x-4 mb-4">
        <Input
          placeholder="Search Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-[200px]"
        />
        <Input
          placeholder="Search Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-[200px]"
        />
        <Input
          placeholder="Search Content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-[200px]"
        />
        <Input
          placeholder="Search Tags (comma separated)..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-[250px]"
        />
        <Select
          value={itemPerPage}
          onValueChange={(value) => {
            setItemPerPage(value);
            setCurrentPage(1);
          }}
        >
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