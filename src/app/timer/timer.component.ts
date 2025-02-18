import { Component } from '@angular/core';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent {
  date: any = new Date();
  minutes: any = 0;
  seconds: any = 0;
  ngOnInit() {
    // console.log("Seconds : ", this.seconds);
    this.minutes = '0' + this.minutes;
    this.seconds = '0' + this.seconds;
    setInterval(() => {
      if (this.seconds >= 59) {
        ++this.minutes;
        this.minutes = this.minutes < 10 ? '0' + this.minutes : this.minutes;
        this.seconds = 0;
      } else {
        ++this.seconds;
      }
      this.seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;
    }, 1000);
  }
}
