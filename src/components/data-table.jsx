import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
  IconPencil,
  IconTrash,
  IconLoader,
  IconRefresh,
  IconFilter,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

import { activityService, activityHelpers } from "../services/activityService"

export const schema = z.object({
  _id: z.string(),
  date: z.string(),
  activityName: z.string(),
  activityType: z.string(),
  description: z.string(),
  quantity: z.object({
    value: z.number(),
    unit: z.string(),
  }),
  carbonFootprint: z.number(),
})

const DataTableContext = React.createContext(null)

const getActivityTypeColor = (type) => {
  const colors = {
    transport: "bg-blue-100 text-blue-800 border-blue-200",
    energy: "bg-yellow-100 text-yellow-800 border-yellow-200",
    food: "bg-green-100 text-green-800 border-green-200",
    waste: "bg-orange-100 text-orange-800 border-orange-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return colors[type] || colors.other
}

const columns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {activityHelpers.formatDate(row.original.date)}
      </div>
    ),
  },
  {
    accessorKey: "activityName",
    header: "Activity",
    cell: ({ row }) => <div className="font-medium">{row.original.activityName}</div>,
  },
  {
    accessorKey: "activityType",
    header: "Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge 
          variant="outline" 
          className={`text-xs px-2 py-1 capitalize ${getActivityTypeColor(row.original.activityType)}`}
        >
          {row.original.activityType}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm max-w-xs truncate" title={row.original.description}>
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="text-sm">
        {activityHelpers.formatQuantity(row.original.quantity)}
      </div>
    ),
  },
  {
    accessorKey: "carbonFootprint",
    header: "CO₂ (kg)",
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {activityHelpers.formatCarbonFootprint(row.original.carbonFootprint)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ctx = React.useContext(DataTableContext)
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => ctx.handleEdit(row.original)}
          >
            <IconPencil size={16} className="mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => ctx.handleRemove(row.original._id)}
            disabled={ctx.isDeleting === row.original._id}
          >
            {ctx.isDeleting === row.original._id ? (
              <IconLoader size={16} className="mr-1 animate-spin" />
            ) : (
              <IconTrash size={16} className="mr-1" />
            )}
            Remove
          </Button>
        </div>
      )
    },
  },
]

function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  })

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 h-12"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-2">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({ onAddActivity, onEditActivity }) {
  const [data, setData] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [sorting, setSorting] = React.useState([{ id: "date", desc: true }])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [loading, setLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(null)
  
  // FIXED: Proper filter state initialization - no "all" values
  const [filters, setFilters] = React.useState({
    activityType: "",
    activityName: "",
    startDate: "",
    endDate: "",
  })
  
  const [totalCarbonFootprint, setTotalCarbonFootprint] = React.useState(0)

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo(() => data?.map((item) => item._id) || [], [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row._id,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
  })

  // FIXED: Improved fetchActivities with proper parameter handling
  const fetchActivities = React.useCallback(async () => {
    try {
      setLoading(true)
      
      // Build clean filter parameters - only include non-empty values
      const filterParams = {}
      
      if (filters.activityType && filters.activityType.trim() !== "") {
        filterParams.activityType = filters.activityType.trim()
      }
      
      if (filters.activityName && filters.activityName.trim() !== "") {
        filterParams.activityName = filters.activityName.trim()
      }
      
      if (filters.startDate) {
        filterParams.startDate = filters.startDate
      }
      
      if (filters.endDate) {
        filterParams.endDate = filters.endDate
      }
      
      // Get all activities for client-side pagination
      filterParams.limit = 1000
      
      console.log("Sending filter params to API:", filterParams)
      
      const response = await activityService.getActivities(filterParams)
      
      console.log("API Response:", response)
      
      setData(response.activities || [])
      setTotalCarbonFootprint(response.summary?.totalCarbonFootprint || 0)
      
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      setData([])
      toast.error("Failed to fetch activities. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch activities when component mounts or filters change
  React.useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  function handleDragEnd(event) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  function handleEdit(activity) {
    if (onEditActivity) {
      onEditActivity(activity)
    } else {
      console.log("Edit activity:", activity)
    }
  }

  async function handleRemove(activityId) {
    try {
      setIsDeleting(activityId)
      await activityService.deleteActivity(activityId)
      
      // Remove from local state immediately
      setData((prev) => prev.filter((item) => item._id !== activityId))
      
      toast.success("Activity deleted successfully.")
      
      // Refresh to get updated totals
      fetchActivities()
    } catch (error) {
      console.error("Failed to delete activity:", error)
      toast.error("Failed to delete activity. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  // FIXED: Simplified filter change handler
  const handleFilterChange = (key, value) => {
    console.log(`Filter change: ${key} = "${value}"`)
    
    // Handle the special "all" case for activityType
    let actualValue = value
    if (key === "activityType" && value === "all") {
      actualValue = ""
    }
    
    setFilters((prev) => ({
      ...prev,
      [key]: actualValue,
    }))
    
    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0
    }))
  }

  // FIXED: Clear filters function
  const clearFilters = () => {
    console.log("Clearing all filters")
    setFilters({
      activityType: "",
      activityName: "",
      startDate: "",
      endDate: "",
    })
  }

  // FIXED: Check for active filters (any non-empty value)
  const hasActiveFilters = 
    filters.activityType !== "" || 
    filters.activityName !== "" || 
    filters.startDate !== "" || 
    filters.endDate !== ""

  return (
    <DataTableContext.Provider value={{ handleEdit, handleRemove, isDeleting }}>
      <Tabs defaultValue="logs" className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <TabsList>
            <TabsTrigger value="logs">
              Carbon Footprint Activity Logs
              {totalCarbonFootprint > 0 && (
                <Badge variant="secondary" className="ml-2">
                  Total: {activityHelpers.formatCarbonFootprint(totalCarbonFootprint)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchActivities}
              disabled={loading}
            >
              {loading ? (
                <IconLoader size={16} className="animate-spin" />
              ) : (
                <IconRefresh size={16} />
              )}
              <span className="hidden lg:inline">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddActivity}
            >
              <IconPlus />
              <span className="hidden lg:inline">Add Activity</span>
            </Button>
          </div>
        </div>

        {/* FIXED: Filters section with proper value handling */}
        <div className="px-4 lg:px-6">
          <div className="flex flex-wrap gap-4 items-end p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <IconFilter size={16} />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <Label htmlFor="activity-type" className="text-xs">Activity Type</Label>
              <Select
                value={filters.activityType || "all"}
                onValueChange={(value) => handleFilterChange("activityType", value)}
              >
                <SelectTrigger className="w-32 h-8" id="activity-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {activityHelpers.getActivityTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="activity-name" className="text-xs">Activity Name</Label>
              <Input
                id="activity-name"
                placeholder="Search activities..."
                value={filters.activityName}
                onChange={(e) => handleFilterChange("activityName", e.target.value)}
                className="w-40 h-8"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="start-date" className="text-xs">From Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-36 h-8"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="end-date" className="text-xs">To Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-36 h-8"
              />
            </div>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="logs" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <IconLoader className="animate-spin" />
                <span>Loading activities...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                  id={sortableId}
                >
                  <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                          {table.getRowModel().rows.map((row) => (
                            <DraggableRow key={row.id} row={row} />
                          ))}
                        </SortableContext>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="h-24 text-center">
                            {hasActiveFilters 
                              ? "No activities match your filters." 
                              : "No activities found. Add your first activity!"
                            }
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </DndContext>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4">
                <div className="flex w-full items-center gap-8 lg:w-fit">
                  <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                      Rows per page
                    </Label>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value))
                      }}
                    >
                      <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
                  </div>
                  <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      <IconChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <IconChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      <IconChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden size-8 lg:flex"
                      size="icon"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to last page</span>
                      <IconChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </DataTableContext.Provider>
  )
}
