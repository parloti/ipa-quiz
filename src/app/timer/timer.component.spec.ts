import { ComponentFixture, TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [TimerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize minutes and seconds with leading zeros', () => {
    expect(component.minutes).toBe('00');
    expect(component.seconds).toBe('00');
  });

  it('should increment seconds every second', () => {
    vi.advanceTimersByTime(1000);
    expect(component.seconds).toBe('01');

    vi.advanceTimersByTime(1000);
    expect(component.seconds).toBe('02');
  });

  it('should format seconds with leading zero when less than 10', () => {
    vi.advanceTimersByTime(5000);
    expect(component.seconds).toBe('05');
  });

  it('should increment minutes when seconds reach 60', () => {
    vi.advanceTimersByTime(60000); // 60 seconds
    expect(component.minutes).toBe('01');
    expect(component.seconds).toBe('00');
  });

  it('should format minutes with leading zero when less than 10', () => {
    vi.advanceTimersByTime(60000); // 1 minute
    expect(component.minutes).toBe('01');
  });

  it('should not add leading zero to minutes when >= 10', () => {
    vi.advanceTimersByTime(600000); // 10 minutes
    expect(component.minutes).toBe(10);
  });

  it('should not add leading zero to seconds when >= 10', () => {
    vi.advanceTimersByTime(15000); // 15 seconds
    expect(component.seconds).toBe(15);
  });
});
