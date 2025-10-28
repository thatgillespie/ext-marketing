import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Globe, Mail, Phone, MapPin } from "lucide-react"

async function getCompanies() {
  const companies = await prisma.company.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      contacts: {
        take: 1,
        where: {
          isPrimary: true,
        },
      },
      projects: {
        where: {
          status: {
            in: ["PLANNING", "IN_PROGRESS"],
          },
        },
      },
      _count: {
        select: {
          contacts: true,
          projects: true,
        },
      },
    },
  })

  return companies
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  PROSPECT: "bg-blue-100 text-blue-800",
  ARCHIVED: "bg-red-100 text-red-800",
}

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-gray-500">Manage your client companies</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="grid gap-4">
        {companies.map((company) => {
          const primaryContact = company.contacts[0]
          const activeProjects = company.projects.length

          return (
            <Link key={company.id} href={`/dashboard/companies/${company.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{company.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[company.status]
                              }`}
                            >
                              {company.status}
                            </span>
                          </div>
                          {company.industry && (
                            <p className="text-sm text-gray-500">{company.industry}</p>
                          )}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {company.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4" />
                              <span className="truncate">{company.website}</span>
                            </div>
                          )}
                          {company.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {company.city && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {company.city}
                                {company.state && `, ${company.state}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {primaryContact && (
                          <div className="text-sm">
                            <span className="text-gray-500">Primary Contact: </span>
                            <span className="font-medium">
                              {primaryContact.firstName} {primaryContact.lastName}
                            </span>
                            {primaryContact.email && (
                              <span className="text-gray-500"> • {primaryContact.email}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-semibold">{activeProjects}</span>
                          <span className="text-gray-500"> active projects</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {company._count.contacts} contacts
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No companies found</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
