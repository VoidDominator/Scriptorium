export const types = ["Interpreted", "Compiled"] as const

export type LanguageType = (typeof types)[number]

export interface Language<Type = string> {
  id: string
  name: string
  description: string
  strengths?: string
  type: Type
}

export const languages: Language<LanguageType>[] = [
  {
    id: "1",
    name: "Python 3",
    description:
      "Python is a high-level, interpreted programming language known for its readability and ease of use.",
    type: "Interpreted",
    strengths:
      "Data analysis, machine learning, web development, automation, scientific computing",
  },
  {
    id: "2",
    name: "JavaScript",
    description:
      "JavaScript is a high-level, interpreted programming language that is widely used for web development.",
    type: "Interpreted",
    strengths:
      "Frontend development, backend development, web applications, mobile applications",
  },
  {
    id: "3",
    name: "C++",
    description:
      "C++ is a high-level, compiled programming language known for its performance and efficiency.",
    type: "Compiled",
    strengths:
      "Game development, system programming, embedded systems, high-performance applications",
  },
  {
    id: "4",
    name: "Java",
    description:
      "Java is a high-level, compiled programming language known for its portability and scalability.",
    type: "Compiled",
    strengths:
      "Enterprise applications, Android development, web applications, big data",
  },
  {
    id: "5",
    name: "C",
    description:
      "C is a low-level, compiled programming language that provides building blocks for many other languages.",
    type: "Compiled",
    strengths:
      "System programming, embedded systems, operating systems, compilers",
  },
  {
    id: "6",
    name: "Ruby",
    description:
      "Ruby is a high-level, interpreted programming language known for its simplicity and productivity.",
    type: "Interpreted",
    strengths:
      "Web development, scripting, prototyping, data analysis",
  },
  {
    id: "7",
    name: "Go",
    description:
      "Go is a statically typed, compiled programming language designed at Google known for its simplicity and efficiency.",
    type: "Compiled",
    strengths:
      "System programming, network programming, cloud services, concurrent applications",
  },
  {
    id: "8",
    name: "PHP",
    description:
      "PHP is a high-level, interpreted programming language widely used for server-side web development.",
    type: "Interpreted",
    strengths:
      "Web development, server-side scripting, content management systems",
  },
  {
    id: "9",
    name: "Swift",
    description:
      "Swift is a high-level, compiled programming language developed by Apple for iOS and macOS development.",
    type: "Compiled",
    strengths:
      "iOS development, macOS development, mobile applications",
  },
  {
    id: "10",
    name: "Kotlin",
    description:
      "Kotlin is a statically typed, compiled programming language that targets the JVM and Android.",
    type: "Compiled",
    strengths:
      "Android development, web development, server-side applications",
  },
  {
    id: "11",
    name: "Rust",
    description:
      "Rust is a statically typed, compiled programming language focused on safety and performance.",
    type: "Compiled",
    strengths:
      "System programming, embedded systems, safe concurrency, performance-critical applications",
  },
  {
    id: "12",
    name: "TypeScript",
    description:
      "TypeScript is a statically typed superset of JavaScript that compiles to plain JavaScript.",
    type: "Compiled",  // TypeScript is compiled to JavaScript (transpiled)
    strengths:
      "Large-scale JavaScript applications, code maintenance, developer tooling",
  },
  {
    id: "13",
    name: "Perl",
    description:
      "Perl is a high-level, interpreted programming language known for its text processing capabilities, particularly popular for legacy systems and system administration.",
    type: "Interpreted",
    strengths:
      "Text manipulation, system administration, web development, network programming",
  },
  {
    id: "14",
    name: "Scala",
    description:
      "Scala is a high-level, compiled programming language that combines object-oriented and functional programming paradigms.",
    type: "Compiled",
    strengths:
      "Data processing, distributed computing, web development, concurrency",
  },
]