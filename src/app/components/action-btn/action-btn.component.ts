import {Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-btn.component.html',
  styleUrl: './action-btn.component.scss'
})
export class ActionBtnComponent {
  @Input() text!: string;
  @Input() type!: string;
  @Input() estMisEnAvant!: boolean
  @Input() disabled!: boolean
  @Input() fullSize!: boolean
  @Input() isUppercase!: boolean

  // @ts-ignore
  @Output() onClick = new EventEmitter<void>(); // Ajoutez cette ligne
  buttonClicked() {
  }
}
