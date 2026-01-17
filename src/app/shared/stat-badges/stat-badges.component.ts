import { Component, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-stat-badges',
  imports: [MatBadgeModule, MatTooltipModule],
  templateUrl: './stat-badges.component.html',
  styleUrl: './stat-badges.component.scss',
})
export class StatBadgesComponent {
  public readonly correct = input.required<number>();
  public readonly wrong = input.required<number>();
  public readonly longest = input.required<number>();
  public readonly current = input.required<number>();
}
