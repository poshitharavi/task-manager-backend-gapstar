import {
  IsIn,
  IsBoolean,
  IsInt,
  ValidateIf,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class UpdateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsIn(['LOW', 'HIGH', 'MEDIUM'])
  priority: 'LOW' | 'HIGH' | 'MEDIUM';

  @IsNotEmpty()
  @IsIn(['DAILY', 'MONTHLY', 'WEEKLY', 'NONE'])
  recurrence: 'DAILY' | 'MONTHLY' | 'WEEKLY' | 'NONE';

  @IsNotEmpty()
  @IsString()
  dueDate: string;

  @IsNotEmpty()
  @IsBoolean()
  isDependent: boolean;

  @ValidateIf((o) => o.isDependent === true)
  @IsInt()
  @IsNotEmpty({ each: true })
  prerequisite?: number;
}
