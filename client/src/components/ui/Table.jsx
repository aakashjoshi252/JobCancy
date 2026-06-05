import { useTranslation } from "react-i18next";

export default function Table({ columns, rows, getRowKey = (row) => row._id, emptyText = "No records found" }) {
  const { t } = useTranslation();
  const resolvedEmptyText = emptyText === "No records found" ? t("common.noRecords") : emptyText;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-semibold text-gray-700">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={columns.length}>
                {resolvedEmptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-gray-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
