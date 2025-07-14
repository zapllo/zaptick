"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Tag,
  X,
  ChevronDown,
  CheckCheck,
  Filter as FilterIcon,
  Check,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Operator type
type LogicalOperator = "AND" | "OR";

// Filter types
type FilterType = "tag" | "trait" | "event";

// Filter condition types
type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "between"
  | "more_than"
  | "exactly"
  | "after"
  | "on"
  | "before"
  | "is_unknown"
  | "has_any_value";

// Filter structure
interface Filter {
  id: string;
  type: FilterType;
  field?: string;
  operator?: ConditionOperator;
  value?: any;
  values?: string[];
}

// Props definition
interface AudienceFilterProps {
  tags: string[];
  traitFields: { label: string; key: string; type: "text" | "number" | "date" | "select"; options?: string[] }[];
  eventFields: { label: string; key: string; type: "text" | "number" | "date" | "select"; options?: string[] }[];
  onApplyFilters: (filters: {
    tags: string[];
    conditions: Filter[];
    operator: LogicalOperator;
    whatsappOptedIn: boolean;
  }) => void;
  initialFilters?: {
    tags: string[];
    conditions: Filter[];
    operator: LogicalOperator;
    whatsappOptedIn: boolean;
  };
}

const AudienceFilter = ({
  tags = [],
  traitFields = [],
  eventFields = [],
  onApplyFilters,
  initialFilters
}: AudienceFilterProps) => {
  // State for selected tags
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);

  // State for logical operator
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>(initialFilters?.operator || "AND");

  // State for conditions
  const [conditions, setConditions] = useState<Filter[]>(initialFilters?.conditions || []);

  // State for WhatsApp opted in
  const [whatsappOptedIn, setWhatsappOptedIn] = useState<boolean>(initialFilters?.whatsappOptedIn || false);

  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // State for controlling the collapse
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = selectedTags.length > 0 || conditions.length > 0 || whatsappOptedIn;

  // Function to toggle a tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Function to check if a field is already used in conditions
  const isFieldAlreadySelected = (type: FilterType, fieldKey: string) => {
    return conditions.some(condition =>
      condition.type === type && condition.field === fieldKey
    );
  };

  // Function to add a new condition
  const addCondition = (type: FilterType, field?: string) => {
    // If field is already selected, don't add a new condition
    if (field && isFieldAlreadySelected(type, field)) {
      return;
    }

    const newCondition: Filter = {
      id: Date.now().toString(),
      type,
      field: field || (type === 'trait' ? traitFields[0]?.key : eventFields[0]?.key),
      operator: type === 'trait' && getFieldType(type, field) === 'date' ? 'on' : 'equals',
      value: '',
    };

    setConditions([...conditions, newCondition]);
  };

  // Function to remove a condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  // Function to toggle a condition by field
  const toggleCondition = (type: FilterType, fieldKey: string) => {
    // Check if this field is already in a condition
    const existingCondition = conditions.find(
      condition => condition.type === type && condition.field === fieldKey
    );

    if (existingCondition) {
      // Remove the condition if it exists
      removeCondition(existingCondition.id);
    } else {
      // Add a new condition if it doesn't exist
      addCondition(type, fieldKey);
    }
  };

  // Function to update a condition
  const updateCondition = (id: string, updates: Partial<Filter>) => {
    setConditions(conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    ));
  };

  // Function to handle Apply Filters click
  const handleApplyFilters = () => {
    onApplyFilters({
      tags: selectedTags,
      conditions,
      operator: logicalOperator,
      whatsappOptedIn
    });
    
    // Always collapse the filters after applying, even if no filters are active
    setIsFiltersCollapsed(true);
  };

  // Function to expand filters again
  const handleExpandFilters = () => {
    setIsFiltersCollapsed(false);
  };

  // Function to clear all filters
  const handleClearAllFilters = () => {
    setSelectedTags([]);
    setConditions([]);
    setWhatsappOptedIn(false);
    setIsFiltersCollapsed(false);
    // Also call onApplyFilters to update the parent component
    onApplyFilters({
      tags: [],
      conditions: [],
      operator: logicalOperator,
      whatsappOptedIn: false
    });
  };

  // Get field options based on condition type
  const getFieldOptions = (type: FilterType) => {
    return type === 'trait' ? traitFields : eventFields;
  };

  // Get field type for a given field key and condition type
  const getFieldType = (type: FilterType, fieldKey?: string) => {
    if (!fieldKey) return 'text';

    const fields = type === 'trait' ? traitFields : eventFields;
    const field = fields.find(f => f.key === fieldKey);
    return field?.type || 'text';
  };

  // Function to filter fields based on search query
  const filterFieldsBySearch = (fields: any[], query: string) => {
    if (!query.trim()) return fields;

    const lowerQuery = query.toLowerCase().trim();
    return fields.filter(field =>
      field.label.toLowerCase().includes(lowerQuery) ||
      field.key.toLowerCase().includes(lowerQuery)
    );
  };

  // Filter the fields based on search query
  const filteredTraitFields = filterFieldsBySearch(traitFields, searchQuery);
  const filteredEventFields = filterFieldsBySearch(eventFields, searchQuery);

  return (
    <div className="space-y-4">
      {/* Collapsed state - show when filters are collapsed */}
      {isFiltersCollapsed && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {hasActiveFilters 
                    ? `${selectedTags.length + conditions.length + (whatsappOptedIn ? 1 : 0)} filters applied`
                    : 'No filters applied'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpandFilters}
                  className="text-sm"
                >
                  {hasActiveFilters ? 'Edit Filters' : 'Add Filters'}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main filter card - hide when collapsed */}
      {!isFiltersCollapsed && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FilterIcon className="h-5 w-5 mr-2" />
              Audience Filters
            </CardTitle>
            <CardDescription>
              Define your target audience by adding filters and conditions
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tags Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filter by Tags</Label>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="h-8 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer h-10 hover:bg-primary/90 hover:text-white transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {selectedTags.includes(tag) && (
                      <CheckCheck className="h-3 w-3 mr-1" />
                    )}
                    {tag}
                  </Badge>
                ))}

                {tags.length > 5 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        More Tags
                        <ChevronDown className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <ScrollArea className="h-80">
                        <div className="p-4 space-y-2">
                          <div className="font-medium text-sm mb-2">Select Tags</div>
                          <div className="space-y-2">
                            {tags.slice(5).map((tag) => (
                              <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`tag-${tag}`}
                                  checked={selectedTags.includes(tag)}
                                  onCheckedChange={() => toggleTag(tag)}
                                />
                                <label
                                  htmlFor={`tag-${tag}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {tag}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {selectedTags.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Select
                      value={logicalOperator}
                      onValueChange={(value) => setLogicalOperator(value as LogicalOperator)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      combine with other filters
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Conditions Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Filter by User Properties and Events</Label>

              {conditions.length > 0 && (
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={condition.id} className="border rounded-md p-3 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute right-2 top-2"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1.5 block">Field</Label>
                          <Select
                            value={condition.field}
                            onValueChange={(value) =>
                              updateCondition(condition.id, { field: value, value: '' })
                            }
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFieldOptions(condition.type).map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs mb-1.5 block">Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) =>
                              updateCondition(condition.id, { operator: value as ConditionOperator })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFieldType(condition.type, condition.field) === 'date' ? (
                                <>
                                  <SelectItem value="more_than">more than</SelectItem>
                                  <SelectItem value="exactly">exactly</SelectItem>
                                  <SelectItem value="less_than">less than</SelectItem>
                                  <SelectItem value="after">after</SelectItem>
                                  <SelectItem value="on">on</SelectItem>
                                  <SelectItem value="before">before</SelectItem>
                                  <SelectItem value="is_unknown">is unknown</SelectItem>
                                  <SelectItem value="has_any_value">has any value</SelectItem>
                                </>
                              ) : getFieldType(condition.type, condition.field) === 'number' ? (
                                <>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Does not equal</SelectItem>
                                  <SelectItem value="greater_than">Greater than</SelectItem>
                                  <SelectItem value="less_than">Less than</SelectItem>
                                  <SelectItem value="between">Between</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Does not equal</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="not_contains">Does not contain</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs mb-1.5 block">Value</Label>
                          {getFieldType(condition.type, condition.field) === 'select' ? (
                            <Select
                              value={condition.value}
                              onValueChange={(value) =>
                                updateCondition(condition.id, { value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                              <SelectContent>
                                {getFieldOptions(condition.type)
                                  .find(f => f.key === condition.field)?.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : getFieldType(condition.type, condition.field) === 'date' ? (
                            condition.operator === 'is_unknown' || condition.operator === 'has_any_value' ? (
                              <div className="text-sm text-muted-foreground py-2">
                                No value needed for this operator
                              </div>
                            ) : (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {condition.value ? (
                                      format(new Date(condition.value), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={condition.value ? new Date(condition.value) : undefined}
                                    onSelect={(date) =>
                                      updateCondition(condition.id, {
                                        value: date ? date.toISOString().split('T')[0] : ''
                                      })
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            )
                          ) : getFieldType(condition.type, condition.field) === 'number' ? (
                            <Input
                              type="number"
                              value={condition.value || ''}
                              onChange={(e) =>
                                updateCondition(condition.id, { value: e.target.value })
                              }
                            />
                          ) : (
                            <Input
                              type="text"
                              value={condition.value || ''}
                              onChange={(e) =>
                                updateCondition(condition.id, { value: e.target.value })
                              }
                              placeholder="Enter value"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3">
                      <Input
                        placeholder="Search properties and events..."
                        className="mb-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <ScrollArea className="h-60">
                        <div className="space-y-1">
                          {filteredTraitFields.length > 0 && (
                            <>
                              <div className="font-medium text-xs uppercase px-2 py-1 text-muted-foreground">
                                User Properties
                              </div>
                              {filteredTraitFields.map((field) => {
                                const isSelected = isFieldAlreadySelected('trait', field.key);
                                return (
                                  <div
                                    key={`trait-${field.key}`}
                                    className="flex items-center space-x-2 px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer"
                                    onClick={() => toggleCondition('trait', field.key)}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => {}}
                                      id={`check-trait-${field.key}`}
                                    />
                                    <label
                                      htmlFor={`check-trait-${field.key}`}
                                      className="flex-1 text-sm cursor-pointer"
                                    >
                                      {field.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {filteredTraitFields.length > 0 && filteredEventFields.length > 0 && (
                            <Separator className="my-2" />
                          )}

                          {filteredEventFields.length > 0 && (
                            <>
                              <div className="font-medium text-xs uppercase px-2 py-1 text-muted-foreground">
                                User Events
                              </div>
                              {filteredEventFields.map((field) => {
                                const isSelected = isFieldAlreadySelected('event', field.key);
                                return (
                                  <div
                                    key={`event-${field.key}`}
                                    className="flex items-center space-x-2 px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer"
                                    onClick={() => toggleCondition('event', field.key)}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => {}}
                                      id={`check-event-${field.key}`}
                                    />
                                    <label
                                      htmlFor={`check-event-${field.key}`}
                                      className="flex-1 text-sm cursor-pointer"
                                    >
                                      {field.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {filteredTraitFields.length === 0 && filteredEventFields.length === 0 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No matching fields found
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>

                {conditions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConditions([])}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* WhatsApp Opted In Section */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="whatsapp-opted"
                checked={whatsappOptedIn}
                onCheckedChange={(checked) =>
                  setWhatsappOptedIn(checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="whatsapp-opted"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Only include customers whose &apos;WhatsApp opted&apos; is true
                </label>
                <p className="text-sm text-muted-foreground">
                  Filter to only contacts who have opted in to WhatsApp communications
                </p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2 flex justify-end">
              <Button onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Summary - only show when expanded and filters are active */}
      {!isFiltersCollapsed && hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="filters">
              <AccordionItem value="filters">
                <AccordionTrigger className="text-sm">
                  {selectedTags.length + conditions.length + (whatsappOptedIn ? 1 : 0)} active filters
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    {selectedTags.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {conditions.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">Conditions</p>
                        <div className="space-y-1">
                          {conditions.map(condition => {
                            const field = getFieldOptions(condition.type).find(f => f.key === condition.field);
                            return (
                              <div key={condition.id} className="text-xs text-muted-foreground">
                                {field?.label || condition.field}
                                {' '}
                                {condition.operator?.replace('_', ' ')}
                                {' '}
                                {condition.operator !== 'is_unknown' && condition.operator !== 'has_any_value' &&
                                  (getFieldType(condition.type, condition.field) === 'date' && condition.value ?
                                    format(new Date(condition.value), 'PPP') :
                                    condition.value)
                                }
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {whatsappOptedIn && (
                      <div>
                        <p className="font-medium mb-1">WhatsApp Status</p>
                        <div className="text-xs text-muted-foreground">
                          WhatsApp opted in is true
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudienceFilter;