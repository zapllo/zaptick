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
  Calendar as CalendarIcon,
  Copy,
  Trash2,
  Move,
  GripVertical,
  Users
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

// Individual condition structure
interface Condition {
  id: string;
  type: FilterType;
  field?: string;
  operator?: ConditionOperator;
  value?: any;
  values?: string[];
}

// Condition group structure
interface ConditionGroup {
  id: string;
  conditions: Condition[];
  operator: LogicalOperator; // AND/OR within this group
}

// Filter structure
interface Filter {
  id: string;
  type: FilterType;
  field?: string;
  operator?: ConditionOperator;
  value?: any;
  values?: string[];
  groupId?: string; // Which group this condition belongs to
}

// Add this to the existing AudienceFilter component props
interface AudienceFilterProps {
  tags: string[];
  traitFields: { label: string; key: string; type: "text" | "number" | "date" | "select"; options?: string[] }[];
  eventFields: { label: string; key: string; type: "text" | "number" | "date" | "select"; options?: string[] }[];
  contactGroups?: { id: string; name: string; contactCount: number; color: string }[]; // Add this
  onApplyFilters: (filters: {
    tags: string[];
    conditionGroups: ConditionGroup[];
    groupOperator: LogicalOperator;
    whatsappOptedIn: boolean;
    contactGroups?: string[]; // Add this
  }) => void;
  initialFilters?: {
    tags: string[];
    conditionGroups: ConditionGroup[];
    groupOperator: LogicalOperator;
    whatsappOptedIn: boolean;
    contactGroups?: string[]; // Add this
  };
};


// Update the AudienceFilter component
const AudienceFilter = ({
  tags = [],
  traitFields = [],
  eventFields = [],
  contactGroups = [],
  onApplyFilters,
  initialFilters
}: AudienceFilterProps) => {
  // Add state for selected contact groups
  const [selectedContactGroups, setSelectedContactGroups] = useState<string[]>(
    initialFilters?.contactGroups || []
  );

  // State for selected tags
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);

  // State for condition groups
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>(
    initialFilters?.conditionGroups || []
  );

  // State for operator between groups
  const [groupOperator, setGroupOperator] = useState<LogicalOperator>(
    initialFilters?.groupOperator || "AND"
  );

  // State for WhatsApp opted in
  const [whatsappOptedIn, setWhatsappOptedIn] = useState<boolean>(
    initialFilters?.whatsappOptedIn || false
  );

  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // State for controlling the collapse
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Update the hasActiveFilters check
  const hasActiveFilters = selectedTags.length > 0 ||
    conditionGroups.length > 0 ||
    whatsappOptedIn ||
    selectedContactGroups.length > 0;
  // Function to toggle a tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  const handleExpandFilters = () => {
    setIsFiltersCollapsed(false);
  };

  // Add function to toggle contact group
  const toggleContactGroup = (groupId: string) => {
    setSelectedContactGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Function to add a new condition group
  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      id: Date.now().toString(),
      conditions: [],
      operator: "AND"
    };
    setConditionGroups([...conditionGroups, newGroup]);
  };

  // Function to remove a condition group
  const removeConditionGroup = (groupId: string) => {
    setConditionGroups(conditionGroups.filter(group => group.id !== groupId));
  };

  // Function to update group operator
  const updateGroupOperator = (groupId: string, operator: LogicalOperator) => {
    setConditionGroups(groups =>
      groups.map(group =>
        group.id === groupId ? { ...group, operator } : group
      )
    );
  };

  // Function to add a condition to a group
  const addConditionToGroup = (groupId: string, type: FilterType, field?: string) => {
    const newCondition: Condition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      field: field || (type === 'trait' ? traitFields[0]?.key : eventFields[0]?.key),
      operator: type === 'trait' && getFieldType(type, field) === 'date' ? 'on' : 'equals',
      value: '',
    };

    setConditionGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      )
    );
  };

  // Function to remove a condition from a group
  const removeConditionFromGroup = (groupId: string, conditionId: string) => {
    setConditionGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
          : group
      )
    );
  };

  // Function to update a condition in a group
  const updateConditionInGroup = (groupId: string, conditionId: string, updates: Partial<Condition>) => {
    setConditionGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
            ...group,
            conditions: group.conditions.map(condition =>
              condition.id === conditionId ? { ...condition, ...updates } : condition
            )
          }
          : group
      )
    );
  };

  // Function to duplicate a condition
  const duplicateCondition = (groupId: string, conditionId: string) => {
    const group = conditionGroups.find(g => g.id === groupId);
    const condition = group?.conditions.find(c => c.id === conditionId);

    if (condition) {
      const duplicatedCondition: Condition = {
        ...condition,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };

      setConditionGroups(groups =>
        groups.map(group =>
          group.id === groupId
            ? { ...group, conditions: [...group.conditions, duplicatedCondition] }
            : group
        )
      );
    }
  };

  // Function to move condition to different group
  const moveConditionToGroup = (fromGroupId: string, toGroupId: string, conditionId: string) => {
    const fromGroup = conditionGroups.find(g => g.id === fromGroupId);
    const condition = fromGroup?.conditions.find(c => c.id === conditionId);

    if (condition) {
      // Remove from source group
      setConditionGroups(groups =>
        groups.map(group => {
          if (group.id === fromGroupId) {
            return { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) };
          }
          if (group.id === toGroupId) {
            return { ...group, conditions: [...group.conditions, condition] };
          }
          return group;
        })
      );
    }
  };

  // Make sure the handleApplyFilters includes contact groups
  const handleApplyFilters = () => {
    const validGroups = conditionGroups
      .map(group => ({
        ...group,
        conditions: group.conditions.filter(c =>
          c.field && c.operator && (
            c.operator === 'is_unknown' ||
            c.operator === 'has_any_value' ||
            (c.value !== undefined && c.value !== null && c.value !== '')
          )
        )
      }))
      .filter(group => group.conditions.length > 0);

    const filtersToApply = {
      tags: selectedTags,
      conditionGroups: validGroups,
      groupOperator,
      whatsappOptedIn,
      contactGroups: selectedContactGroups
    };

    console.log('AudienceFilter - Applying filters:', JSON.stringify(filtersToApply, null, 2));

    onApplyFilters(filtersToApply);
    setIsFiltersCollapsed(true);
  };



  // Update the handleClearAllFilters function
  const handleClearAllFilters = () => {
    setSelectedTags([]);
    setConditionGroups([]);
    setWhatsappOptedIn(false);
    setSelectedContactGroups([]); // Add this
    setIsFiltersCollapsed(false);

    onApplyFilters({
      tags: [],
      conditionGroups: [],
      groupOperator,
      whatsappOptedIn: false,
      contactGroups: [] // Add this
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

  // Render value input based on field type and operator
  const renderValueInput = (groupId: string, condition: Condition) => {
    const fieldType = getFieldType(condition.type, condition.field);

    if (condition.operator === 'is_unknown' || condition.operator === 'has_any_value') {
      return (
        <div className="text-sm text-muted-foreground py-2">
          No value needed for this operator
        </div>
      );
    }

    if (fieldType === 'date') {
      // For relative date operators, show number input
      if (condition.operator === 'more_than' || condition.operator === 'exactly' || condition.operator === 'less_than') {
        return (
          <div className="space-y-2">
            <Input
              type="number"
              min="0"
              placeholder="Enter days"
              value={condition.value || ''}
              onChange={(e) =>
                updateConditionInGroup(groupId, condition.id, {
                  value: e.target.value ? parseInt(e.target.value) : ''
                })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Number of days ago
            </p>
          </div>
        );
      }

      // For absolute date operators, show date picker
      return (
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
              selected={condition.value ? new Date(condition.value + 'T00:00:00') : undefined}
              onSelect={(date) => {
                if (date) {
                  // Format the date as YYYY-MM-DD in local timezone to avoid UTC issues
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const localDateString = `${year}-${month}-${day}`;

                  updateConditionInGroup(groupId, condition.id, {
                    value: localDateString
                  });
                } else {
                  updateConditionInGroup(groupId, condition.id, {
                    value: ''
                  });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }

    if (fieldType === 'select') {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) =>
            updateConditionInGroup(groupId, condition.id, { value })
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
      );
    }

    if (fieldType === 'number') {
      return (
        <Input
          type="number"
          value={condition.value || ''}
          onChange={(e) =>
            updateConditionInGroup(groupId, condition.id, { value: e.target.value })
          }
          placeholder="Enter number"
        />
      );
    }

    return (
      <Input
        type="text"
        value={condition.value || ''}
        onChange={(e) =>
          updateConditionInGroup(groupId, condition.id, { value: e.target.value })
        }
        placeholder="Enter value"
      />
    );
  };

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
                    ? `${selectedTags.length + conditionGroups.reduce((acc, group) => acc + group.conditions.length, 0) + (whatsappOptedIn ? 1 : 0)} filters applied`
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
              Advanced Audience Filters
            </CardTitle>
            <CardDescription>
              Create complex filter logic with multiple condition groups
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
            </div>
            {/* Contact Groups Section - Add this after Tags Section */}
            {contactGroups.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Filter by Contact Groups</Label>
                    {selectedContactGroups.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedContactGroups([])}
                        className="h-8 px-2 text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {contactGroups.slice(0, 4).map((group) => (
                      <Badge
                        key={group.id}
                        variant={selectedContactGroups.includes(group.id) ? "default" : "outline"}
                        className="cursor-pointer h-10 hover:bg-primary/90 hover:text-white transition-colors"
                        onClick={() => toggleContactGroup(group.id)}
                        style={{
                          backgroundColor: selectedContactGroups.includes(group.id) ? group.color : 'transparent',
                          borderColor: group.color,
                          color: selectedContactGroups.includes(group.id) ? 'white' : group.color
                        }}
                      >
                        {selectedContactGroups.includes(group.id) && (
                          <CheckCheck className="h-3 w-3 mr-1" />
                        )}
                        <Users className="h-3 w-3 mr-1" />
                        {group.name} ({group.contactCount})
                      </Badge>
                    ))}

                    {contactGroups.length > 4 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10">
                            More Groups
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <ScrollArea className="h-80">
                            <div className="p-4 space-y-2">
                              <div className="font-medium text-sm mb-2">Select Contact Groups</div>
                              <div className="space-y-2">
                                {contactGroups.slice(4).map((group) => (
                                  <div key={group.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`group-${group.id}`}
                                      checked={selectedContactGroups.includes(group.id)}
                                      onCheckedChange={() => toggleContactGroup(group.id)}
                                    />
                                    <div
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <label
                                      htmlFor={`group-${group.id}`}
                                      className="flex-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {group.name} ({group.contactCount})
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
                </div>

                <Separator />
              </>
            )}
            <Separator />

            {/* Condition Groups Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Condition Groups</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </Button>
              </div>

              {conditionGroups.length > 0 && (
                <div className="space-y-6">
                  {conditionGroups.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Combine groups with:</Label>
                      <Select
                        value={groupOperator}
                        onValueChange={(value) => setGroupOperator(value as LogicalOperator)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {conditionGroups.map((group, groupIndex) => (
                    <div key={group.id} className="relative">
                      {groupIndex > 0 && (
                        <div className="absolute -top-3 left-6 bg-white px-2 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded">
                          {groupOperator}
                        </div>
                      )}

                      <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                Group {groupIndex + 1}
                              </span>
                              {group.conditions.length > 1 && (
                                <Select
                                  value={group.operator}
                                  onValueChange={(value) => updateGroupOperator(group.id, value as LogicalOperator)}
                                >
                                  <SelectTrigger className="w-20 h-7">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AND">AND</SelectItem>
                                    <SelectItem value="OR">OR</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeConditionGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {group.conditions.map((condition, conditionIndex) => (
                            <div key={condition.id} className="border rounded-md p-3 relative bg-white">
                              {conditionIndex > 0 && (
                                <div className="absolute -top-2 left-4 bg-white px-2 py-1 text-xs font-medium text-primary border border-primary/20 rounded">
                                  {group.operator}
                                </div>
                              )}

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    Condition {conditionIndex + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => duplicateCondition(group.id, condition.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  {conditionGroups.length > 1 && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <Move className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuLabel>Move to Group</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {conditionGroups.map((targetGroup, idx) => (
                                          targetGroup.id !== group.id && (
                                            <DropdownMenuItem
                                              key={targetGroup.id}
                                              onClick={() => moveConditionToGroup(group.id, targetGroup.id, condition.id)}
                                            >
                                              Group {idx + 1}
                                            </DropdownMenuItem>
                                          )
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeConditionFromGroup(group.id, condition.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs mb-1.5 block">Field</Label>
                                  <Select
                                    value={condition.field}
                                    onValueChange={(value) =>
                                      updateConditionInGroup(group.id, condition.id, { field: value, value: '' })
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
                                      updateConditionInGroup(group.id, condition.id, { operator: value as ConditionOperator })
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
                                  {renderValueInput(group.id, condition)}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Condition Button */}
                          <div className="flex gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Condition
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
                                          {filteredTraitFields.map((field) => (
                                            <div
                                              key={`trait-${field.key}`}
                                              className="flex items-center space-x-2 px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer"
                                              onClick={() => {
                                                addConditionToGroup(group.id, 'trait', field.key);
                                                setSearchQuery('');
                                              }}
                                            >
                                              <label className="flex-1 text-sm cursor-pointer">
                                                {field.label}
                                              </label>
                                            </div>
                                          ))}
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
                                          {filteredEventFields.map((field) => (
                                            <div
                                              key={`event-${field.key}`}
                                              className="flex items-center space-x-2 px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer"
                                              onClick={() => {
                                                addConditionToGroup(group.id, 'event', field.key);
                                                setSearchQuery('');
                                              }}
                                            >
                                              <label className="flex-1 text-sm cursor-pointer">
                                                {field.label}
                                              </label>
                                            </div>
                                          ))}
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
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
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
                  {selectedTags.length + conditionGroups.reduce((acc, group) => acc + group.conditions.length, 0) + (whatsappOptedIn ? 1 : 0)} active filters
                  {conditionGroups.length > 1 && (
                    <Badge variant="outline" className="ml-2">
                      Groups: {groupOperator}
                    </Badge>
                  )}
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

                    {conditionGroups.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">
                          Condition Groups {conditionGroups.length > 1 && `(${groupOperator})`}
                        </p>
                        <div className="space-y-2">
                          {conditionGroups.map((group, groupIndex) => (
                            <div key={group.id} className="border rounded-md p-2 bg-slate-50">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-slate-600">
                                  Group {groupIndex + 1}
                                </span>
                                {group.conditions.length > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    {group.operator}
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                {group.conditions.map((condition, conditionIndex) => {
                                  const field = getFieldOptions(condition.type).find(f => f.key === condition.field);
                                  return (
                                    <div key={condition.id} className="flex items-center gap-2 text-xs">
                                      {conditionIndex > 0 && (
                                        <span className="text-xs text-primary font-medium">
                                          {group.operator}
                                        </span>
                                      )}
                                      <div className="text-muted-foreground">
                                        {field?.label || condition.field}
                                        {' '}
                                        {condition.operator?.replace('_', ' ')}
                                        {' '}
                                        {condition.operator !== 'is_unknown' && condition.operator !== 'has_any_value' &&
                                          (getFieldType(condition.type, condition.field) === 'date' && condition.value ?
                                            (typeof condition.value === 'number' ?
                                              `${condition.value} days ago` :
                                              format(new Date(condition.value), 'PPP')
                                            ) :
                                            condition.value)
                                        }
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
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