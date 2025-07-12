import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ConditionNode = ({ data, selected }: any) => {
  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <GitBranch className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium text-sm">{data.label}</span>
          </div>
          <Badge variant="outline" className="text-xs">Condition</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Branch based on conditions
        </p>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">Yes</Badge>
            <Badge variant="secondary" className="text-xs">No</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '25%' }}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '75%' }}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </Card>
  );
};

export default memo(ConditionNode);
