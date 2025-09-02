import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-action-link',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './action-link.component.html',
  styleUrl: './action-link.component.scss'
})
export class ActionLinkComponent {
  @Input() text!: string; // Texte à afficher sur le bouton
  @Input() destination!: string; // Destination (URL) pour la navigation
  @Input() estMisEnAvant!: boolean
  @Input() disabled!: boolean
  @Input() fullSize!: boolean
  @Input() isUppercase!: boolean
}
