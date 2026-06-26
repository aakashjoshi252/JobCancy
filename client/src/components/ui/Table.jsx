import { useTranslation } from "react-i18next";

export default function Table({ columns, rows, getRowKey = (row) => row._id, emptyText = "No records found" }) {
  const { t } = useTranslation();
  const resolvedEmptyText = emptyText === "No records found" ? t("common.noRecords") : emptyText;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100 sm:hidden">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">{resolvedEmptyText}</div>
        ) : (
          rows.map((row) => (
            <article key={getRowKey(row)} className="space-y-3 p-4">
              {columns.map((column) => (
                <div key={column.key} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 text-sm">
                  <dt className="font-semibold text-gray-500">{column.header}</dt>
                  <dd className="min-w-0 text-gray-800">{column.render ? column.render(row) : row[column.key]}</dd>
                </div>
              ))}
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
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
    </div>
  );
}
