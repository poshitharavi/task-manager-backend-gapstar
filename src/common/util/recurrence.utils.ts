import * as moment from 'moment';
import { Recurrence } from '@prisma/client';

export function calculateNextRecurrence(
  recurrence: Recurrence,
  dueDate: string,
): Date | null {
  if (recurrence === Recurrence.NONE) {
    return null;
  }

  const nextDate = moment(dueDate);

  switch (recurrence) {
    case Recurrence.DAILY:
      nextDate.add(1, 'day');
      break;
    case Recurrence.WEEKLY:
      nextDate.add(1, 'week');
      break;
    case Recurrence.MONTHLY:
      nextDate.add(1, 'month');
      break;
    default:
      throw new Error(`Invalid recurrence: ${recurrence}`);
  }

  return nextDate.toDate();
}
