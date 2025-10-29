import { CompanyForm } from "@/components/forms/company-form"

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Company</h1>
        <p className="text-gray-500">Create a new client company</p>
      </div>

      <CompanyForm />
    </div>
  )
}
