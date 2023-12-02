import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(value: String, format: String = 'dd/MM/yyyy'): string {
    if (!value) return '';
    return formatDate(value.toString(), format.toString(), 'en');
  }
}
