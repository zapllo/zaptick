import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Send,
  Settings,
  Type,
  MousePointer,
  Image,
  Video,
  List,
  Users,
  CheckCircle,
  Clock,
  Webhook
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const getActionIcon = (actionType?: string) => {
  switch (actionType) {
    case 'send_message': return Type;
    case 'send_button': return MousePointer;
    case 'send_media': return Image;
    case 'send_video': return Video;
    case 'send_list': return List;
    case 'assign_conversation': return Users;
    default: return Send;
  }
};

const getActionColor = (actionType?: string, customColor?: string) => {
  if (customColor && customColor !== 'default') {
    const colorMap = {
      'blue': 'bg-blue-50 border-blue-200 text-blue-700',
      'green': 'bg-green-50 border-green-200 text-green-700',
      'purple': 'bg-purple-50 border-purple-200 text-purple-700',
      'orange': 'bg-orange-50 border-orange-200 text-orange-700',
      'red': 'bg-red-50 border-red-200 text-red-700',
      'yellow': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      'pink': 'bg-pink-50 border-pink-200 text-pink-700',
    };
    return colorMap[customColor as keyof typeof colorMap] || 'bg-white border-gray-200 text-gray-700';
  }

  switch (actionType) {
    case 'send_message': return 'bg-green-50 border-green-200 text-green-700';
    case 'send_button': return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'send_media': return 'bg-purple-50 border-purple-200 text-purple-700';
    case 'send_video': return 'bg-red-50 border-red-200 text-red-700';
    case 'send_list': return 'bg-orange-50 border-orange-200 text-orange-700';
    case 'assign_conversation': return 'bg-cyan-50 border-cyan-200 text-cyan-700';
    default: return 'bg-purple-50 border-purple-200 text-purple-700';
  }
};

const getActionPreview = (actionType?: string, config?: any) => {
  switch (actionType) {
    case 'send_message':
      return config?.message ?
        `"${config.message.substring(0, 30)}${config.message.length > 30 ? '...' : ''}"` :
        'No message set';
    case 'send_button':
      const buttonCount = config?.buttons?.length || 0;
      if (buttonCount > 0) {
        const buttonLabels = config.buttons.map((btn: any) => btn.text || 'Button').slice(0, 2);
        return `${buttonCount} buttons: ${buttonLabels.join(', ')}${buttonCount > 2 ? '...' : ''}`;
      }
      return 'No buttons configured';
    case 'send_media':
      return config?.mediaUrl ? 'Media file ready' : 'No media selected';
    case 'send_video':
      return config?.videoUrl ? 'Video file ready' : 'No video selected';
    case 'send_list':
      const sectionCount = config?.sections?.length || 0;
      return sectionCount > 0 ?
        `${sectionCount} section${sectionCount !== 1 ? 's' : ''} configured` :
        'No sections configured';
    case 'assign_conversation':
      return config?.assignedTo ? 'User assigned' : 'No user selected';
    default:
      return 'Action configured';
  }
};

const ActionNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const actionType = data.config?.actionType || 'send_message';
  const Icon = data.type === 'webhook' ? Webhook : getActionIcon(actionType);
  const colorClass = getActionColor(actionType, data.color);
  const preview = data.type === 'webhook'
    ? (data.config?.webhookUrl ? 'Webhook configured' : 'No URL set')
    : getActionPreview(actionType, data.config);
  const hasConfig = data.config && Object.keys(data.config).length > 1;

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
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{data.label}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className="text-xs capitalize">
                  {data.type === 'webhook' ? 'webhook' : actionType.replace('_', ' ')}
                </Badge>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  hasConfig ? "bg-green-500" : "bg-yellow-500"
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
              {hasConfig ? (
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
      {/* Output Handles - Special handling for button actions */}
      {actionType === 'send_button' && data.config?.buttons?.length > 0 ? (
        <div className="relative">
          {/* Button handle container */}
          <div className="absolute top-0 left-full ml-4" style={{ top: '0%' }}>
            {data.config.buttons.map((button: any, index: number) => {
              const buttonId = button.id || `btn_${index + 1}`;
              const totalButtons = data.config.buttons.length;

              // Calculate vertical positioning (one below the other)
              const topPosition = index * 40; // 60px spacing between buttons

              return (
                <div
                  key={buttonId}
                  className="absolute"
                  style={{
                    left: '0px',
                    top: `${topPosition + 10}px`
                  }}
                >
                  {/* Visual button indicator */}
                  <div className="flex items-center gap-2">
                    {/* Handle */}
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={buttonId}
                      style={{
                        position: 'relative',
                        left: '-20px',
                        top: 'auto',
                        transform: 'none',
                        margin: '0'
                      }}
                      className="w-4 h-4 bg-blue-500 border-2  border-white hover:bg-blue-600 transition-colors shadow-lg relative z-10"
                    />



                    {/* Button label */}
                    <div className="bg-blue-100 border border-blue-300 -ml-[228px] mt-1 w-[200px] rounded px-2 py-1 shadow-sm">
                      <span className="text-xs text-blue-700 font-medium whitespace-nowrap">
                        {button.text || `Button ${index + 1}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spacer to account for buttons on the right */}
          <div style={{ height: `${Math.max(data.config.buttons.length * 40 - 20, 0)}px` }}></div>
        </div>
      ) : actionType === 'send_list' && data.config?.sections?.length > 0 ? (
        <div className="relative">
          {/* List handle container */}
          <div className="absolute top-0 left-full ml-4" style={{ top: '0%' }}>
            {data.config.sections.flatMap((section: any, sectionIndex: number) =>
              section.rows?.map((row: any, rowIndex: number) => {
                const rowId = row.id || `list_${sectionIndex}_${rowIndex}`;
                const totalRows = data.config.sections.reduce((acc: number, s: any) => acc + (s.rows?.length || 0), 0);
                const currentRowIndex = data.config.sections.slice(0, sectionIndex).reduce((acc: number, s: any) => acc + (s.rows?.length || 0), 0) + rowIndex;

                // Calculate vertical positioning (one below the other) - exactly like buttons
                const topPosition = currentRowIndex * 40; // Same 40px spacing as buttons

                return (
                  <div
                    key={rowId}
                    className="absolute"
                    style={{
                      left: '0px',
                      top: `${topPosition + 10}px` // Same offset as buttons
                    }}
                  >
                    {/* Visual list indicator - exactly like button */}
                    <div className="flex items-center gap-2">
                      {/* Handle - styled exactly like button handle */}
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={rowId}
                        style={{
                          position: 'relative',
                          left: '-20px', // Same positioning as button
                          top: 'auto',
                          transform: 'none',
                          margin: '0'
                        }}
                        className="w-4 h-4 bg-orange-500 border-2 border-white hover:bg-orange-600 transition-colors shadow-lg relative z-10"
                      />

                      {/* List label - styled exactly like button label */}
                      <div className="bg-orange-100 border border-orange-300 -ml-[228px] mt-1 w-[200px] rounded px-2 py-1 shadow-sm">
                        <span className="text-xs text-orange-700 font-medium whitespace-nowrap">
                          {row.title || `Row ${currentRowIndex + 1}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) || []
            )}
          </div>

          {/* Spacer to account for list items on the right - same calculation as buttons */}
          <div style={{
            height: `${Math.max(
              data.config.sections.reduce((acc: number, s: any) => acc + (s.rows?.length || 0), 0) * 40 - 20,
              0
            )}px`
          }}></div>
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-white border-2 border-gray-400 hover:border-blue-500 transition-colors"
        />
      )}
    </div>
  );
};

export default memo(ActionNode);