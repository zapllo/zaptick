import React from 'react';
import { Handle, Position } from 'reactflow';

const SimpleNode = ({ data, selected }: any) => {
  return (
    <div
      style={{
        padding: '10px',
        border: selected ? '2px solid #0066cc' : '1px solid #ddd',
        borderRadius: '5px',
        background: 'white',
        minWidth: '150px',
        fontSize: '12px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        {data.label}
      </div>
      <div style={{ color: '#666' }}>
        {data.type} node
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default SimpleNode;
