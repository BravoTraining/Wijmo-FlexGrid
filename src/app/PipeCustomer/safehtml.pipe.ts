import { Pipe, PipeTransform, Sanitizer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafehtmlPipe implements PipeTransform {

  constructor(private sanitized: DomSanitizer) {}

  transform(pzContent) {
    return this.sanitized.bypassSecurityTrustHtml(pzContent);
  }

}
