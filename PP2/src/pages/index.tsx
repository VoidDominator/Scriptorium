import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/router";

const Homepage: FC = () => {
  const router = useRouter();

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const query = (event.target as HTMLInputElement).value;
      if (query.trim()) {
        router.push(`/search?query=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SidebarTrigger className="absolute top-4 left-4" />
      
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Scriptorium</h1>
        <p className="text-lg text-gray-600">
          Your platform to write, share, and execute code seamlessly.
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => router.push("/users/signin")}>Log In</Button>
          <Button variant="outline" onClick={() => router.push("/users/signup")}>
            Sign Up
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <Card>
          <CardHeader>
            <CardTitle>Write and Execute Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Write code in over a dozen programming languages with syntax highlighting and real-time output.</p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => router.push("/editor")}>
              Try Now
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create and Share Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Save your code as reusable templates and share them with others.</p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => router.push("/templates")}>
              Explore Templates
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Read and Write Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Learn from others and share your own experiences through blog posts.</p>
          </CardContent>
          <CardFooter>
            <Button variant="link" onClick={() => router.push("/blog/blog-post")}>
              Read Blogs
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Compatible Programming Languages */}
      <section className="my-12 text-center">
        <h2 className="text-2xl font-bold">Compatible Programming Languages</h2>
        <p className="text-gray-600 mt-2">
          Our platform supports a wide range of programming languages for your coding needs.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
          {[
            { name: "Python", icon: "/icons/python-svgrepo-com.svg" },
            { name: "JavaScript", icon: "/icons/node-16-svgrepo-com.svg" },
            { name: "C++", icon: "/icons/c.svg" },
            { name: "Java", icon: "/icons/java-4-logo-svgrepo-com.svg" },
            { name: "C", icon: "/icons/c-1.svg" },
            { name: "Ruby", icon: "/icons/ruby-svgrepo-com.svg" },
            { name: "Go", icon: "/icons/go-svgrepo-com.svg" },
            { name: "PHP", icon: "/icons/php-svgrepo-com.svg" },
            { name: "Swift", icon: "/icons/swift-svgrepo-com.svg" },
            { name: "Kotlin", icon: "/icons/kotlin-svgrepo-com.svg" },
            { name: "Rust", icon: "/icons/rust-svgrepo-com.svg" },
            { name: "TypeScript", icon: "/icons/typescript-svgrepo-com.svg" },
            { name: "Perl", icon: "/icons/perl-svgrepo-com.svg" },
            { name: "Scala", icon: "/icons/scala-svgrepo-com.svg" },
          ].map((lang) => (
            <div key={lang.name} className="flex flex-col items-center">
              <img
                src={lang.icon}
                alt={lang.name}
                className="h-12 w-12 animate-pulse"
                title={lang.name}
              />
              <p className="mt-2 text-sm text-gray-700">{lang.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coding Changing Our Daily Life */}
      <section className="my-12">
        <h2 className="text-2xl font-bold text-center mb-6">Coding Changing Our Daily Life</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Boost Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Write and test code faster than ever with our efficient tools.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Collaborate Seamlessly</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Work with your team in real-time to create amazing projects.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Learn Efficiently</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Access tutorials, blogs, and templates to enhance your skills.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Deploy Instantly</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Turn your ideas into live projects with one click.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="text-center my-12">
        <h2 className="text-3xl font-bold">Getting Started for Free</h2>
        <p className="text-lg text-gray-600 mt-2">
          Join Scriptorium today and experience how it improves your coding efficiency and collaboration.
        </p>
        <Button className="mt-6 px-6 py-3 text-lg" onClick={() => router.push("/users/signup")}>
          Get Started
        </Button>
      </section>
    </div>
  );
};

export default Homepage;
