import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Card, CardContent } from "@/components/ui/card";

export default function BrowseFilters({
  searchTerm,
  setSearchTerm,
  selectedField,
  setSelectedField,
  sortBy,
  setSortBy,
  fields,
  journalCount
}) {
  const fieldOptions = [
    { label: "All Fields", value: "all" },
    ...fields.map((field) => ({
      label: field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: field,
    })),
  ];

  const sortOptions = [
    { label: "Title A-Z", value: "title" },
    { label: "Impact Factor", value: "impact_factor" },
    { label: "Field", value: "field" },
  ];

  return (
    <Card className="mb-8 border-surface-200 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
          <span className="p-input-icon-left min-w-0 flex-1">
            <i className="pi pi-search" />
            <InputText
              placeholder="Search journals, keywords, or scope..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full !pl-12"
            />
          </span>

          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            <div className="flex items-center gap-2">
              <i className="pi pi-filter text-surface-500" />
              <Dropdown
                value={selectedField}
                onChange={(e) => setSelectedField(e.value)}
                options={fieldOptions}
                className="w-48"
                aria-label="Filter by field"
              />
            </div>

            <div className="flex items-center gap-2">
              <i className="pi pi-sort-alt text-surface-500" />
              <Dropdown
                value={sortBy}
                onChange={(e) => setSortBy(e.value)}
                options={sortOptions}
                className="w-40"
                aria-label="Sort journals"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-surface-600">
          Showing {journalCount} journal{journalCount !== 1 ? "s" : ""}
          {selectedField !== "all" && ` in ${selectedField.replace(/_/g, " ")}`}
        </div>
      </CardContent>
    </Card>
  );
}
