import { TemplateColumn, columns } from "@/components/template-search/colums";
import { DataTable } from "@/components/template-search/data-table";

async function getTemplates() {
    const response = await fetch("/api/templates");
    return response.json();
}

export default async function TemplatesPage() {
    const data = await getTemplates();
    return (
        <DataTable<TemplateColumn, string> columns={columns} data={data} />
    );
}