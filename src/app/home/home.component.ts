
import { Component } from '@angular/core';
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
} from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGithub, lucideLinkedin, lucideTwitter } from '@ng-icons/lucide';

@Component({
  selector: 'app-home',
  imports: [NgIcon],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerGestureConfig,
    },
  ],
  viewProviders: [
    provideIcons({ lucideTwitter, lucideGithub, lucideLinkedin }),
  ],
})
export class HomeComponent {
  private _features: { title: string; description: string }[] = [
    {
      title: 'Interactive Quizzes',
      description:
        'Test your knowledge of IPA symbols and their corresponding sounds.',
    },
    {
      title: 'Progress Tracker',
      description: "See how far you've come and what areas need more practice.",
    },
    {
      title: 'Learning Resources',
      description:
        'Access detailed explanations and examples for each IPA symbol.',
    },
    {
      title: 'Leaderboard',
      description:
        'Compete with friends and other users to see who can master the IPA chart the fastest.',
    },
  ];
  public get features(): { title: string; description: string }[] {
    return this._features;
  }

  private _socialLinks: { href: string; icon: string; title: string }[] = [
    {
      href: 'https://github.com/parloti/ipa-quiz',
      title: 'GitHub',
      icon: 'lucideGithub',
    },
    {
      href: 'https://www.linkedin.com/in/parloti/',
      title: 'LinkedIn',
      icon: 'lucideLinkedin',
    },
    {
      href: 'https://x.com/parloti',
      title: 'Twitter',
      icon: 'lucideTwitter',
    },
  ];

  public get socialLinks(): { href: string; icon: string; title: string }[] {
    return this._socialLinks;
  }

  constructor(private router: Router) {}

  startQuiz(): void {
    this.router.navigate(['/quizzes-home']);
  }

  currentSlide: number = 0;
  setSlide(index: number): void {
    this.currentSlide = index;
  }

  onSwipeLeft(): void {
    if (this.currentSlide < this.features.length - 1) {
      this.currentSlide++;
    }
  }

  onSwipeRight(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }
}
