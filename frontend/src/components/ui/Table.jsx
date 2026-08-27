import { HiOutlineInboxStack } from 'react-icons/hi2';

const Table = ({
  headers = [],
  rows = [],
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon = HiOutlineInboxStack,
  className = '',
}) => {
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, rowIdx) => (
      <tr key={`skeleton-${rowIdx}`} className="border-b border-surface-100">
        {headers.map((_, colIdx) => (
          <td key={`skeleton-${rowIdx}-${colIdx}`} className="px-5 py-4">
            <div
              className="h-4 rounded skeleton-shimmer"
              style={{ width: `${55 + Math.random() * 30}%` }}
            />
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className={`overflow-x-auto w-full border border-surface-200 rounded-xl ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] uppercase bg-surface-50 text-gray-500 font-semibold border-b border-surface-200">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-5 py-3 tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 bg-white">
          {loading ? (
            renderSkeletonRows()
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length || 1} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-surface-50 flex items-center justify-center">
                    <EmptyIcon className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                    <p className="text-xs text-gray-400 mt-0.5">No matching records available.</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-ocean-50/30 transition-colors duration-100"
              >
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-5 py-3.5 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.displayName = 'Table';
export default Table;
