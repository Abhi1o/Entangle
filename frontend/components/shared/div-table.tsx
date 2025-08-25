"use client"
import React from "react";

type CellType = string | number | React.ReactNode;

interface CellConfig {
  content: CellType;
  className?: string;
}

interface ActionButton {
  label: string;
  onClick: (row: (CellType | CellConfig)[]) => void;
  className?: string;
  icon?: React.ReactNode;
}

interface DivTableProps {
  columns: string[];
  rows: (CellType | CellConfig)[][];
  onRowClick?: (row: (CellType | CellConfig)[]) => void;
  hoverColor?: string;
  actionButtons?: ActionButton[];
  showActions?: boolean;
  cellClassNames?: string[];
  headerClassNames?: string[];
}

const DivTable: React.FC<DivTableProps> = ({
  columns,
  rows,
  onRowClick,
  hoverColor = "hover:bg-surface-level1",
  actionButtons = [],
  showActions = false,
  cellClassNames = [],
  headerClassNames = [],
}) => {
  // Helper function to get cell content and class
  const getCellContent = (cell: CellType | CellConfig): { content: CellType; className: string } => {
    if (typeof cell === 'object' && cell !== null && 'content' in cell) {
      return { content: cell.content, className: cell.className || 'text-text-med text-bodys' };
    }
    return { content: cell, className: 'text-text-med text-bodys' };
  };
  // Calculate the number of columns including action buttons
  const totalColumns = showActions && actionButtons.length > 0 ? columns.length + 1 : columns.length;
  const gridTemplateColumns = showActions && actionButtons.length > 0 
    ? `repeat(${columns.length}, minmax(100px, 1fr)) auto`
    : `repeat(${columns.length}, minmax(100px, 1fr))`;

  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div className={`grid grid-cols-${totalColumns} gap-4 py-2 text-left text-sm font-medium`} style={{ gridTemplateColumns }}>
        {columns.map((col, index) => (
          <div key={index} className={`text-high-emphasis text-bodys ${headerClassNames[index] || ''}`}>{col}</div>
        ))}
        {showActions && actionButtons.length > 0 && (
          <div className="text-high-emphasis text-bodys">Actions</div>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid gap-4 py-3 px-4 rounded-[22px] ${hoverColor} transition ${rowIndex % 2 === 0 ? "bg-surface-level2" : "bg-surface"}`}
            style={{ gridTemplateColumns }}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {row.map((cell, cellIndex) => {
              const { content, className } = getCellContent(cell);
              return (
                <div 
                  key={cellIndex} 
                  className={`${className} ${cellClassNames[cellIndex] || ''}`}
                  onClick={(e) => onRowClick && e.stopPropagation()}
                >
                  {content}
                </div>
              );
            })}
            
            {showActions && actionButtons.length > 0 && (
              <div className="flex items-center gap-2">
                {actionButtons.map((button, btnIndex) => (
                  <button
                    key={btnIndex}
                    className={`px-3 py-1 rounded-md text-xs ${button.className || 'bg-action-primary text-white'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      button.onClick(row);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {button.icon && button.icon}
                      {button.label}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DivTable;
