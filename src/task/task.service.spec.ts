import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { NewTaskDto } from './dtos/new-task.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as recurrenceUtils from '../../src/common/util/recurrence.utils';
import { UpdateTaskDto } from './dtos/update-task.dto';

describe('TaskService', () => {
  let service: TaskService;
  let prisma: PrismaService;

  const mockPrisma = {
    task: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    taskDependency: {
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    jest
      .spyOn(recurrenceUtils, 'calculateNextRecurrence')
      .mockReturnValue(new Date('2024-01-01'));
  });

  describe('addNewTask', () => {
    const mockNewTaskDto: NewTaskDto = {
      title: 'Test Task',
      priority: 'HIGH',
      recurrence: 'DAILY',
      dueDate: '2024-01-01',
      isDependent: false,
    };

    const createdTask = {
      id: 1,
      ...mockNewTaskDto,
      userId: 1,
      nextRecurrence: new Date('2024-01-01'),
      status: 'NOT_DONE',
      active: true,
    };

    it('should create a new task without dependencies', async () => {
      mockPrisma.task.create.mockResolvedValue(createdTask);

      const result = await service.addNewTask(mockNewTaskDto, 1);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: mockNewTaskDto.title,
          priority: mockNewTaskDto.priority,
          recurrence: mockNewTaskDto.recurrence,
          dueDate: mockNewTaskDto.dueDate,
          userId: 1,
          nextRecurrence: new Date('2024-01-01'),
        },
      });
      expect(result).toEqual(createdTask);
    });

    it('should create task with dependency when isDependent is true', async () => {
      const dependencyDto = {
        ...mockNewTaskDto,
        isDependent: true,
        prerequisite: 2,
      };
      mockPrisma.task.create.mockResolvedValue(createdTask);
      mockPrisma.taskDependency.create.mockResolvedValue({});

      await service.addNewTask(dependencyDto, 1);

      expect(prisma.taskDependency.create).toHaveBeenCalledWith({
        data: {
          dependentId: 1,
          prerequisiteId: 2,
        },
      });
    });

    it('should throw error when task creation fails', async () => {
      mockPrisma.task.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.addNewTask(mockNewTaskDto, 1)).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('updateTask', () => {
    const existingTask = {
      id: 1,
      title: 'Old Task',
      dependencies: [],
    };

    const updateDto: UpdateTaskDto = {
      title: 'Updated Task',
      priority: 'MEDIUM',
      recurrence: 'WEEKLY',
      dueDate: '2024-01-02',
      isDependent: false,
    };

    it('should update task successfully', async () => {
      mockPrisma.task.findUniqueOrThrow.mockResolvedValue(existingTask);
      mockPrisma.task.update.mockResolvedValue({
        ...existingTask,
        ...updateDto,
      });

      const result = await service.updateTask(1, updateDto, 1);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          title: 'Updated Task',
          priority: 'MEDIUM',
          recurrence: 'WEEKLY',
        }),
      });
      expect(result).toEqual(expect.objectContaining(updateDto));
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrisma.task.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

      await expect(service.updateTask(999, updateDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle dependency removal when isDependent is false', async () => {
      const taskWithDependency = {
        ...existingTask,
        dependencies: [{ id: 1, dependentId: 1, prerequisiteId: 2 }],
      };
      mockPrisma.task.findUniqueOrThrow.mockResolvedValue(taskWithDependency);

      await service.updateTask(1, updateDto, 1);

      expect(prisma.taskDependency.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should upsert dependency when isDependent is true', async () => {
      const dependencyDto = {
        ...updateDto,
        isDependent: true,
        prerequisite: 2,
      };
      mockPrisma.task.findUniqueOrThrow.mockResolvedValue(existingTask);

      await service.updateTask(1, dependencyDto, 1);

      expect(prisma.taskDependency.upsert).toHaveBeenCalledWith({
        where: {
          dependentId_prerequisiteId: { dependentId: 1, prerequisiteId: 2 },
        },
        update: { prerequisiteId: 2 },
        create: { dependentId: 1, prerequisiteId: 2 },
      });
    });
  });

  describe('deleteTask', () => {
    it('should soft delete task successfully', async () => {
      mockPrisma.task.findUniqueOrThrow.mockResolvedValue({ id: 1 });
      mockPrisma.task.update.mockResolvedValue({ id: 1, active: false });

      const result = await service.deleteTask(1, 1);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrisma.task.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

      await expect(service.deleteTask(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyTasks', () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', active: true },
      { id: 2, title: 'Task 2', active: true },
    ];

    it('should return active tasks for user', async () => {
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.getMyTasks(1);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { active: true, userId: 1 },
        include: { dependencies: true },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array if no tasks found', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const result = await service.getMyTasks(1);
      expect(result).toEqual([]);
    });
  });
});
