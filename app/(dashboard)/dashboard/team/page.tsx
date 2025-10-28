import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Phone, Briefcase } from "lucide-react"

async function getTeamMembers() {
  const users = await prisma.user.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      department: true,
      jobTitle: true,
      avatar: true,
      hourlyRate: true,
    },
  })

  return users
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-gray-500">Manage your team members</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
                  {member.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-gray-500">{member.jobTitle || member.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span>{member.department}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="pt-2 flex items-center justify-between border-t">
                <span className="text-xs text-gray-500">{member.role}</span>
                {member.hourlyRate && (
                  <span className="text-xs font-medium">
                    ${member.hourlyRate}/hr
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No team members found</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Team Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
