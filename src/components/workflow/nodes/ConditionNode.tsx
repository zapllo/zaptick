import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, Settings, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ConditionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const hasCondition = data.config?.conditionType && data.config?.conditionValue;
  const preview = hasCondition ? 
    `${data.config.conditionType}: "${data.config.conditionValue}"` : 
    'No condition set';
    
  const colorClass = data.color && data.color !== 'default' ? 
    `bg-${data.color}-50 border-${data.color}-200 text-${data.color}-700` : 
    'bg-blue-50 border-blue-200 text-blue-700';

  return (
    <div
      className={cn(
        "relative group transition-all duration-200 hover:scale-105",
        "min-w-[200px] max-w-[280px]"
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 border-gray-400 hover:border-blue-500 transition-colors"
      />

      {/* Node Card */}
      <Card
        className={cn(
          "transition-all duration-200 overflow-hidden border-2",
          "hover:shadow-lg hover:border-gray-300",
          selected && "ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-105",
          colorClass
        )}
      >
        {/* Header */}
        <div className="p-3 border-b bg-white/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
              <GitBranch className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{data.label}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className="text-xs">Condition</Badge>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  hasCondition ? "bg-green-500" : "bg-yellow-500"
                )}>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <CardContent className="p-3 bg-white/30">
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            {preview}
          </p>
          
          {/* Configuration Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              {hasCondition ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">Configured</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">Setup needed</span>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Handles with Labels */}
      <div className="absolute right-0 top-0 h-full -mt-8 flex flex-col justify-between">
        {/* Yes handle with label */}
        <div className="relative flex items-center" style={{ top: '30%' }}>
          <Handle
            type="source"
            position={Position.Right}
            id="yes"
            className="w-3 h-3 bg-green-500 border-2 border-white hover:bg-green-600 transition-colors"
          />
          <span className="text-xs text-green-600 font-medium ml-1 absolute left-4">Yes</span>
        </div>

        {/* No handle with label */}
        <div className="relative flex items-center" >
          <Handle
            type="source"
            position={Position.Right}
            id="no"
            className="w-3 h-3 bg-red-500 border-2 border-white hover:bg-red-600 transition-colors"
          />
          <span className="text-xs text-red-600 font-medium ml-1 absolute left-4">No</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ConditionNode);