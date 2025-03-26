import { Priority, Recurrence, TaskStatus } from '@prisma/client';

interface TaskDependency {
  id: number;
  dependentId: number;
  prerequisiteId: number;
}

export interface MyTaskResponse {
  id: number;
  title: string;
  status: TaskStatus;
  dueDate: Date | string;
  priority: Priority;
  recurrence: Recurrence;
  nextRecurrence: Date | string | null;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: number;
  dependencies: TaskDependency[];
}
