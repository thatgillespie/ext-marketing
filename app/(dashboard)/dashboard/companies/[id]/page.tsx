import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Edit,
  User,
  FolderKanban,
  FileText,
  Receipt,
  Plus,
} from "lucide-react"

async function getCompany(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: {
        orderBy: {
          isPrimary: "desc",
        },
      },
      projects: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      proposals: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      invoices: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  })

  return company
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  PROSPECT: "bg-blue-100 text-blue-800",
  ARCHIVED: "bg-red-100 text-red-800",
}

const projectStatusColors = {
  PLANNING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const company = await getCompany(params.id)

  if (!company) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[company.status]
                }`}
              >
                {company.status}
              </span>
            </div>
            {company.industry && (
              <p className="text-gray-500">{company.industry}</p>
            )}
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {company.website && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Globe className="h-4 w-4" />
                    Website
                  </div>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {company.email && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <a
                    href={`tel:${company.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {company.phone}
                  </a>
                </div>
              )}
              {company.address && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                  <p className="text-sm">
                    {company.address}
                    {company.city && <br />}
                    {company.city}
                    {company.state && `, ${company.state}`} {company.zip}
                    {company.country && <br />}
                    {company.country}
                  </p>
                </div>
              )}
            </div>

            {company.notes && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Contacts</span>
              </div>
              <span className="font-semibold">{company.contacts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Projects</span>
              </div>
              <span className="font-semibold">{company.projects.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Proposals</span>
              </div>
              <span className="font-semibold">{company.proposals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Invoices</span>
              </div>
              <span className="font-semibold">{company.invoices.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contacts</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </CardHeader>
        <CardContent>
          {company.contacts.length === 0 ? (
            <p className="text-sm text-gray-500">No contacts added</p>
          ) : (
            <div className="space-y-3">
              {company.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      {contact.jobTitle && (
                        <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline block"
                      >
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-gray-500 hover:underline block"
                      >
                        {contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CardHeader>
        <CardContent>
          {company.projects.length === 0 ? (
            <p className="text-sm text-gray-500">No projects</p>
          ) : (
            <div className="space-y-2">
              {company.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      projectStatusColors[project.status]
                    }`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
