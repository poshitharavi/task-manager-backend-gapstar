import { BadRequestException } from '@nestjs/common';
import * as moment from 'moment';

export const validateAndFormatDate = (value: string) => {
  const dateFormat = 'YYYY-MM-DD';
  const inputDate = moment(value, dateFormat, true);

  // Check if the date is valid
  if (!inputDate.isValid()) {
    throw new BadRequestException('Invalid date format, must be YYYY-MM-DD');
  }

  // Check if the date is greater than today
  if (inputDate.isSameOrBefore(moment(), 'day')) {
    throw new BadRequestException('Date must be greater than today');
  }

  return inputDate.utc(true).format();
};
