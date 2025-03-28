import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ScheduledTasksService } from './scheduled-tasks.service';

@Module({
  providers: [TaskService, ScheduledTasksService],
  controllers: [TaskController],
})
export class TaskModule {}
