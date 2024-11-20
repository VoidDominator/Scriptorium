import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

      {/* Search Bar */}
      <section className="my-8">
        <Input
          placeholder="Search blog posts, templates, or code..."
          onKeyPress={handleSearch}
        />
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <Card>
          <CardHeader>
            <CardTitle>Write and Execute Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Write code in various programming languages with syntax highlighting and real-time output.</p>
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

      {/* Testimonials */}
      <section className="my-12 text-center">
        <h2 className="text-2xl font-bold">What Our Users Say</h2>
        <p className="text-gray-600 mt-2">
          Join thousands of developers who use Scriptorium daily to enhance their coding journey.
        </p>
      </section>
    </div>
  );
};

export default Homepage;
