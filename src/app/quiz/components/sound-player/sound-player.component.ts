import { Component, computed, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { NgIconComponent } from '@ng-icons/core';
import { PhonemeSoundRef } from '../../../models/phoneme-sound';

@Component({
  selector: 'app-sound-player',
  imports: [MatIconButton, MatRipple, NgIconComponent],
  templateUrl: './sound-player.component.html',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class SoundPlayerComponent {
  public readonly sound = input.required<PhonemeSoundRef>();
  public readonly abbreviateAuthor = input<boolean>(false);
  public readonly next = output<void>();

  protected readonly authorName = computed(() => {
    const s = this.sound();
    if (!s.author) {
      return '';
    }
    if (this.abbreviateAuthor()) {
      return s.author
        .split(' ')
        .map(word => word[0] ?? '')
        .join('');
    }
    return s.author;
  });

  protected onNext(evt: Event): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.next.emit();
  }
}
