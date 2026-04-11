"use client";

import { useState, useTransition } from "react";

import { adminUpdateUserFlagsAction } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserRow = {
  id: string;
  username: string;
  is_premium: boolean;
  is_blocked: boolean;
  is_admin: boolean;
};

export function UserFlagsTable({ rows }: { rows: UserRow[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState(rows);

  function updateLocal(id: string, patch: Partial<UserRow>) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Blocked</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">@{row.username}</TableCell>
              <TableCell>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.is_premium}
                    onChange={() => updateLocal(row.id, { is_premium: !row.is_premium })}
                  />
                  premium
                </label>
              </TableCell>
              <TableCell>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.is_blocked}
                    onChange={() => updateLocal(row.id, { is_blocked: !row.is_blocked })}
                  />
                  blocked
                </label>
              </TableCell>
              <TableCell>{row.is_admin ? "yes" : "no"}</TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      setError(null);
                      const result = await adminUpdateUserFlagsAction(
                        row.id,
                        row.is_premium,
                        row.is_blocked,
                      );
                      if (!result.ok) setError(result.error);
                    })
                  }
                >
                  Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

