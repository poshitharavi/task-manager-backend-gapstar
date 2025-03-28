import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
import * as moment from 'moment';
import { calculateNextRecurrence } from 'src/common/util/recurrence.utils';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringTasks() {
    this.logger.log('Checking for tasks with due recurrences...');

    const today = moment().startOf('day');
    const tomorrowStart = moment().add(1, 'day').startOf('day');

    const tasksToRecur = await this.prisma.task.findMany({
      where: {
        active: true,
        NOT: {
          recurrence: 'NONE',
        },
        nextRecurrence: {
          gte: today.toDate(),
          lt: tomorrowStart.toDate(),
        },
      },
    });

    this.logger.log(`Found ${tasksToRecur.length} tasks to recur.`);

    for (const originalTask of tasksToRecur) {
      try {
        const nextRecurrence = calculateNextRecurrence(
          originalTask.recurrence,
          originalTask.nextRecurrence.toISOString(),
        );

        const newTaskData = {
          title: originalTask.title,
          status: TaskStatus.NOT_DONE,
          dueDate: originalTask.nextRecurrence,
          priority: originalTask.priority,
          recurrence: originalTask.recurrence,
          userId: originalTask.userId,
          nextRecurrence,
        };

        const newTask = await this.prisma.task.create({
          data: newTaskData,
        });

        this.logger.log(
          `Created new task ${newTask.id} based on recurring task ${originalTask.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error processing recurring task ${originalTask.id}: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log('Recurring task check completed.');
  }
}
