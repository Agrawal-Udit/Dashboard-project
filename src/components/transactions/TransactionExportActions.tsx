import { Download } from "lucide-react";
import type { Transaction } from "../../types";
import { Button } from "../ui/Button";
import {
  downloadTextFile,
  transactionsToCsv,
  transactionsToJson,
} from "../../utils/exportUtils";

interface TransactionExportActionsProps {
  visibleTransactions: Transaction[];
}

function getExportDateSuffix(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TransactionExportActions({
  visibleTransactions,
}: TransactionExportActionsProps) {
  const handleExportCsv = () => {
    const dateSuffix = getExportDateSuffix();
    const csvContent = transactionsToCsv(visibleTransactions);

    downloadTextFile(
      `transactions-${dateSuffix}.csv`,
      csvContent,
      "text/csv;charset=utf-8",
    );
  };

  const handleExportJson = () => {
    const dateSuffix = getExportDateSuffix();
    const jsonContent = transactionsToJson(visibleTransactions);

    downloadTextFile(
      `transactions-${dateSuffix}.json`,
      jsonContent,
      "application/json;charset=utf-8",
    );
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <Button
        variant="secondary"
        onClick={handleExportCsv}
        className="w-full justify-center gap-2 sm:w-auto sm:justify-start"
      >
        <Download size={14} aria-hidden="true" />
        Export CSV
      </Button>

      <Button
        variant="secondary"
        onClick={handleExportJson}
        className="w-full justify-center gap-2 sm:w-auto sm:justify-start"
      >
        <Download size={14} aria-hidden="true" />
        Export JSON
      </Button>
    </div>
  );
}
