import { useState, useEffect } from "react";
import { TemplateColumn, columns } from "@/components/template-search/columns";
import { DataTable } from "@/components/template-search/data-table";

async function getTemplates() {
  const response = await fetch(`/api/templates`);
  return response.json();
}

export default function TemplatesPage() {
  const [data, setData] = useState<TemplateColumn[]>([]);

  useEffect(() => {
    async function fetchData() {
      const templates = await getTemplates();
      setData(templates);
    }
    fetchData();
  }, []);

  return (
    <DataTable<TemplateColumn, string> columns={columns} data={data} />
  );
}