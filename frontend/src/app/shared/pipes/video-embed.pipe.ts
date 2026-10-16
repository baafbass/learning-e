import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/;

/**
 * Turn a YouTube or Vimeo link into an embeddable player URL.
 * Only these two hosts are trusted; any other URL returns null and is shown as a plain link.
 */
@Pipe({ name: 'videoEmbed' })
export class VideoEmbedPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(url: string | null): SafeResourceUrl | null {
    if (!url) {
      return null;
    }
    const youtube = url.match(YOUTUBE_ID);
    if (youtube) {
      return this.trust(`https://www.youtube-nocookie.com/embed/${youtube[1]}`);
    }
    const vimeo = url.match(VIMEO_ID);
    if (vimeo) {
      return this.trust(`https://player.vimeo.com/video/${vimeo[1]}`);
    }
    return null;
  }

  private trust(embedUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
