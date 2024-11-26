import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Editor from "@/components/editor/editor"

export default function Template() {
  const router = useRouter()
  const { id } = router.query
  const [templateData, setTemplateData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetch(`/api/templates/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setTemplateData(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching template:", error)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!templateData) {
    return <div>Template not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <Editor template={templateData} />
    </div>
  )
}