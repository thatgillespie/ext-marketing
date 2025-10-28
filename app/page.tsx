import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users, FolderKanban, BarChart3 } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
              A
            </div>
            <span>Agency MS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          All-in-One Agency Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your marketing agency operations with comprehensive time tracking,
          CRM, project management, and financial tools all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="text-lg h-12 px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg h-12 px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Run Your Agency
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
            <p className="text-gray-600 text-sm">
              Track billable hours, manage timesheets, and analyze time spent on projects.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">CRM</h3>
            <p className="text-gray-600 text-sm">
              Manage client relationships, contacts, and company information in one place.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FolderKanban className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Project Management</h3>
            <p className="text-gray-600 text-sm">
              Plan projects, assign tasks, track progress with Gantt charts and workback schedules.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Financial Tools</h3>
            <p className="text-gray-600 text-sm">
              Create proposals, send invoices, and track payments with ease.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="bg-primary rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Agency?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Join agencies already using our platform to streamline their operations.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg h-12 px-8">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Agency Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
