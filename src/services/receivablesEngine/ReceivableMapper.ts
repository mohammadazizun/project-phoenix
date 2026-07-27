import { ReceivableRecord, ReceivableStatus, ReceivableSummary } from './types';

export class ReceivableMapper {
  /**
   * Derive status based on amount and paidAmount
   */
  public static deriveStatus(
    currentStatus: ReceivableStatus,
    amount: number,
    paidAmount: number
  ): ReceivableStatus {
    if (currentStatus === 'cancelled' || currentStatus === 'draft') {
      return currentStatus;
    }

    if (paidAmount >= amount && amount > 0) {
      return 'paid';
    }

    if (paidAmount > 0 && paidAmount < amount) {
      return 'partially_paid';
    }

    return 'open';
  }

  /**
   * Check if receivable is overdue
   */
  public static isOverdue(receivable: ReceivableRecord): boolean {
    if (receivable.status === 'paid' || receivable.status === 'cancelled') {
      return false;
    }
    const dueTime = new Date(receivable.dueDate).getTime();
    const nowTime = new Date().getTime();
    return dueTime < nowTime;
  }

  /**
   * Format numeric currency value cleanly
   */
  public static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calculate summary metrics for a list of receivables
   */
  public static calculateSummary(records: ReceivableRecord[]): ReceivableSummary {
    const summary: ReceivableSummary = {
      totalOutstanding: 0,
      totalOverdue: 0,
      totalOpenCount: 0,
      totalPaidAmount: 0,
      byStatusCount: {
        draft: 0,
        open: 0,
        partially_paid: 0,
        paid: 0,
        cancelled: 0,
      },
    };

    records.forEach((record) => {
      summary.byStatusCount[record.status] = (summary.byStatusCount[record.status] || 0) + 1;

      if (record.status !== 'cancelled') {
        summary.totalPaidAmount += record.paidAmount;

        if (record.status === 'open' || record.status === 'partially_paid') {
          summary.totalOutstanding += record.remainingAmount;
          summary.totalOpenCount += 1;

          if (this.isOverdue(record)) {
            summary.totalOverdue += record.remainingAmount;
          }
        }
      }
    });

    return summary;
  }
}
