import { useState, useEffect } from "react";
import { TemplateColumn, columns } from "@/components/template-search/columns";
import { DataTable } from "@/components/template-search/data-table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import debounce from 'lodash/debounce';  // a deboucer function to delay the request
import { useUser } from "@/context/user-context";
import { useRouter } from 'next/router';
import { toast } from "sonner";

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
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {

    const fetchData = debounce(async () => {
      if (!user) {
        toast.error("You need to sign in to view your templates.");
        router.push('/users/signin');
      }
      
      const response = await getTemplates({
        title,
        tags,
        explaination: description, // Map description to explaination
        content,
        userId: user?.id,
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
    <div className="flex h-full flex-col mx-auto px-4 sm:px-6 lg:px-8 my-6">
      {/* Header */}
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold">Templates</h2>
        {/* Add additional header content here if needed */}
        <div className="ml-auto flex w-full space-x-2 sm:justify-end"></div>
      </div>
      <Separator />
      {/* Main Content */}
      <div className="">
        {/* Filter Inputs */}
        <div className="mt-6">
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/3 lg:w-1/5 px-2 mb-4">
              <Input
                placeholder="Search Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3 lg:w-1/5 px-2 mb-4">
              <Input
                placeholder="Search Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3 lg:w-1/5 px-2 mb-4">
              <Input
                placeholder="Search Content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3 lg:w-1/5 px-2 mb-4">
              <Input
                placeholder="Search Tags (comma separated)..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3 lg:w-1/5 px-2 mb-4">
              <Select
                value={itemPerPage}
                onValueChange={(value) => {
                  setItemPerPage(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
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
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-4" />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}