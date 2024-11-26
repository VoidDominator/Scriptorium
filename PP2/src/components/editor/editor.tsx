import { Button } from "../ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SidebarTrigger } from "../ui/sidebar";
import { Progress } from "../ui/progress";

import { RotateCcw } from "lucide-react";
import { useState, useEffect } from "react"
import MonacoEditor from "@monaco-editor/react"
import { useRouter } from "next/router"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { fetchWithAuthRetry } from "../../utils/fetchWithAuthRetry"

import { PresetSelector } from "./preset-selector";
import { LanguageSelector } from "./language-selector";
import { DeleteTemplateButton } from "./delete-button";
import { SaveTemplateButton } from "./save-button";

import { languages, types } from "./data/languages";
import { presets } from "./data/presets";
import { Language } from "./data/languages";

interface EditorProps {
  template: any
}

export default function Editor({ template }: EditorProps) {
  const [code, setCode] = useState(template.fileContent || "")
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0])
  const [isExecuting, setIsExecuting] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [output, setOutput] = useState("")
  const [stdin, setStdin] = useState("")
  const [isForking, setIsForking] = useState(false)
  const router = useRouter()
  // const { toast } = useToast()

  useEffect(() => {
    // Set code from template when it changes
    setCode(template.fileContent || "")

    // Find and set the language based on template data
    const languageName = template.language || "plaintext"
    const language = languages.find(
      (lang) => lang.name.toLowerCase() === languageName.toLowerCase()
    )
    if (language) {
      setSelectedLanguage(language)
    }
  }, [template])

  function getMonacoLanguageId(languageName: string): string {
    switch (languageName.toLowerCase()) {
      case "python 3":
        return "python"
      case "javascript":
        return "javascript"
      case "typescript":
        return "typescript"
      case "c++":
        return "cpp"
      case "java":
        return "java"
      case "c":
        return "c"
      case "ruby":
        return "ruby"
      case "go":
        return "go"
      case "php":
        return "php"
      case "swift":
        return "swift"
      case "kotlin":
        return "kotlin"
      case "rust":
        return "rust"
      case "perl":
        return "perl"
      case "scala":
        return "scala"
      default:
        return "plaintext"
    }
  }

  const executeCode = async () => {
    setIsExecuting(true)
    setElapsedTime(0)
    setOutput("")

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    try {
      console.log(stdin)
      console.log(code)
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          language: getMonacoLanguageId(selectedLanguage.name),
          stdin: stdin,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOutput(data.output)
      } else {
        setOutput(data.error)
      }
    } catch (error) {
      setOutput("Error executing code.")
    } finally {
      clearInterval(timer)
      setIsExecuting(false)
      setElapsedTime(0)
    }
  }

  const handleFork = async () => {
    setIsForking(true)
    try {
      const response = await fetchWithAuthRetry(`/api/templates/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast(`Template forked successfully to id ${data.templateId}. You are now seeing the forked template.`);
        router.push(`/editor/${data.templateId}`)
      } else {
        toast("Failed to fork the template.")
      }
    } catch (error) {
      toast("An error occurred while forking the template.")
    } finally {
      setIsForking(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold flex-1">{template.title || "Editor"}</h2>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">
          <PresetSelector presets={presets} />
          <div className="hidden space-x-2 md:flex">
            {/* <CodeViewer /> */}
            {/* <PresetShare /> */}
          </div>
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="complete" className="flex-1 flex flex-col">
        <div className="container h-full py-6">
          <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
            <div className="hidden flex-col space-y-4 sm:flex md:order-2">
              <div className="grid gap-2">
                <HoverCard openDelay={200}>
                  <HoverCardContent className="w-[320px] text-sm" side="left">
                    Choose the interface that best suits your task. You can
                    run a simple script, provide stdin, and view
                    the output/errors that occurs.
                  </HoverCardContent>
                  <HoverCardTrigger asChild>
                    <div>
                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mode
                      </span>

                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="complete">
                          <span className="sr-only">Complete</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                            <rect x="4" y="3" width="12" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="4" y="7" width="12" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="4" y="11" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="4" y="15" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="8.5" y="11" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="8.5" y="15" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="13" y="11" width="3" height="2" rx="1" fill="currentColor"></rect>
                          </svg>
                        </TabsTrigger>
                        <TabsTrigger value="insert">
                          <span className="sr-only">Insert</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                            <path fillRule="evenodd" clipRule="evenodd" d="M14.491 7.769a.888.888 0 0 1 .287.648.888.888 0 0 1-.287.648l-3.916 3.667a1.013 1.013 0 0 1-.692.268c-.26 0-.509-.097-.692-.268L5.275 9.065A.886.886 0 0 1 5 8.42a.889.889 0 0 1 .287-.64c.181-.17.427-.267.683-.269.257-.002.504.09.69.258L8.903 9.87V3.917c0-.243.103-.477.287-.649.183-.171.432-.268.692-.268.26 0 .509.097.692.268a.888.888 0 0 1 .287.649V9.87l2.245-2.102c.183-.172.432-.269.692-.269.26 0 .508.097.692.269Z" fill="currentColor"></path>
                            <rect x="4" y="15" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="8.5" y="15" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="13" y="15" width="3" height="2" rx="1" fill="currentColor"></rect>
                          </svg>
                        </TabsTrigger>
                        <TabsTrigger value="edit">
                          <span className="sr-only">Edit</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                            <rect x="4" y="3" width="12" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="4" y="7" width="12" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="4" y="11" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="4" y="15" width="4" height="2" rx="1" fill="currentColor"></rect>
                            <rect x="8.5" y="11" width="3" height="2" rx="1" fill="currentColor"></rect>
                            <path d="M17.154 11.346a1.182 1.182 0 0 0-1.671 0L11 15.829V17.5h1.671l4.483-4.483a1.182 1.182 0 0 0 0-1.671Z" fill="currentColor"></path>
                          </svg>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </HoverCardTrigger>
                </HoverCard>
              </div>
              <LanguageSelector types={types} languages={languages} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
              <div className="mt-4">
                <h3 className="text-md font-semibold">Explanation</h3>
                <p className="text-sm">{template.explaination || "No explanation provided."}</p>
              </div>
              {template.tags && template.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-sm bg-gray-200 rounded-md"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <Button onClick={handleFork} disabled={isForking} className="w-full">
                  {isForking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Forking...
                    </>
                  ) : (
                    "Fork"
                  )}
                </Button>
                <SaveTemplateButton template={template} code={code} />
                <DeleteTemplateButton templateId={template.id} />
              </div>
            </div>
            <div className="md:order-1">
              <TabsContent value="complete" className="flex-1 flex flex-col mt-0 border-0 p-0">
                <div className="flex h-full flex-col space-y-4">
                  <MonacoEditor
                    height="75vh"
                    language={getMonacoLanguageId(selectedLanguage.name)}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                  />
                  <div className="flex items-center space-x-2">
                    {!isExecuting ? (
                      <>
                        <Button onClick={executeCode}>Execute</Button>
                        <Button variant="secondary">
                          <span className="sr-only">Show history</span>
                          <RotateCcw />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full">
                        <Progress value={(elapsedTime / 10) * 100} />
                      </div>
                    )}
                  </div>
                  <div id="stdout" className="rounded-md border bg-muted">
                    <pre>{output}</pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="insert" className="mt-0 border-0 p-0">
                <div className="flex flex-col space-y-4">
                  <div className="grid h-full grid-rows-2 gap-6 lg:grid-cols-2 lg:grid-rows-1">
                    <MonacoEditor
                      height="75vh"
                      language={getMonacoLanguageId(selectedLanguage.name)}
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      theme="vs-dark"
                    />
                    <div id="stdout" className="rounded-md border bg-muted">
                      <pre>{output}</pre>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isExecuting ? (
                      <>
                        <Button onClick={executeCode}>Execute</Button>
                        <Button variant="secondary">
                          <span className="sr-only">Show history</span>
                          <RotateCcw />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full">
                        <Progress value={(elapsedTime / 10) * 100} />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="edit" className="mt-0 border-0 p-0">
                <div className="flex flex-col space-y-4">
                  <div className="grid h-full gap-6 lg:grid-cols-2">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-1 flex-col space-y-2">
                        <Label htmlFor="input">Code</Label>
                        <MonacoEditor
                          height="75vh"
                          language={getMonacoLanguageId(selectedLanguage.name)}
                          value={code}
                          onChange={(value) => setCode(value || "")}
                          theme="vs-dark"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="input">Input</Label>
                        <Textarea
                          id="input"
                          placeholder="stdin"
                          value={stdin}
                          onChange={(e) => setStdin(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-[21px] min-h-[400px] rounded-md border bg-muted lg:min-h-[700px]">
                      <pre>{output}</pre>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isExecuting ? (
                      <>
                        <Button onClick={executeCode}>Execute</Button>
                        <Button variant="secondary">
                          <span className="sr-only">Show history</span>
                          <RotateCcw />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full">
                        <Progress value={(elapsedTime / 10) * 100} />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}