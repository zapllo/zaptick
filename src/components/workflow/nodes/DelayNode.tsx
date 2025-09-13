import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Timer, Settings, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DelayNode: React.FC<NodeProps> = ({ data, selected }) => {
  const hasDuration = data.config?.duration && data.config.duration > 0;
  const durationText = hasDuration ? 
    `Wait ${data.config.duration} minute${data.config.duration !== 1 ? 's' : ''}` : 
    'No duration set';
    
  const colorClass = data.color && data.color !== 'default' ? 
    `bg-${data.color}-50 border-${data.color}-200 text-${data.color}-700` : 
    'bg-amber-50 border-amber-200 text-amber-700';

  return (
    <div
      className={cn(
        "relative group transition-all duration-200 hover:scale-105",
        "min-w-[200px] max-w-[280px]"
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Input Handle - Left side like ActionNode */}
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
              <Timer className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{data.label}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className="text-xs">Delay</Badge>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  hasDuration ? "bg-green-500" : "bg-yellow-500"
                )}>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <CardContent className="p-3 bg-white/30">
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            {durationText}
          </p>
          
          {/* Configuration Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              {hasDuration ? (
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

      {/* Output Handle - Right side like ActionNode */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-gray-400 hover:border-blue-500 transition-colors"
      />
    </div>
  );
};

export default memo(DelayNode);