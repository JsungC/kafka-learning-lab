import type { ReactNode } from "react";
import { Text } from "@astryxdesign/core/Text";

export type EvidenceRow = [label: string, before: ReactNode, after: ReactNode];

export function EvidenceTable({
  label,
  columns,
  rows,
}: {
  label: string;
  columns: [string, string];
  rows: EvidenceRow[];
}) {
  return (
    <table className="order-evidence" aria-label={label}>
      <thead>
        <tr>
          <th scope="col">Follow</th>
          {columns.map((name) => (
            <th scope="col" key={name}>
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, before, after]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{before}</td>
            <td>
              {typeof after !== "string" || before === after ? (
                after
              ) : (
                <Text type="label" color="accent">
                  {after}
                </Text>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
