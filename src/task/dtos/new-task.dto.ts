import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class NewTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['LOW', 'HIGH', 'MEDIUM'])
  priority: 'LOW' | 'HIGH' | 'MEDIUM';
  @IsNotEmpty()
  @IsString()
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
