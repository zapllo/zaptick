import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TriggerNode = ({ data, selected }: any) => {
  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md">
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium text-sm">{data.label}</span>
          </div>
          <Badge variant="outline" className="text-xs">Trigger</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Starts when a message is received
        </p>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </Card>
  );
};

export default memo(TriggerNode);
