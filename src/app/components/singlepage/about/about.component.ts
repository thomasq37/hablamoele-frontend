import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CountUpDirective} from "../../../shared/count-up.directive";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CountUpDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {}
