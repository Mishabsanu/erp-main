import React from 'react';

interface TableProps {
  headers: string[];
  data: (string | number)[][];
}

const Table: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className="akod-table-shell animate-fade-in">
      <div className="akod-table-scroll">
      <table className="akod-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Table;
