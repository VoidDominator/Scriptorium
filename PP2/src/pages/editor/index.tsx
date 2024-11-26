import Editor from "@/components/editor/editor";

export default function Template() {
  const emptyTemplate = {};

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <Editor template={emptyTemplate}/>
    </div>
  );
}