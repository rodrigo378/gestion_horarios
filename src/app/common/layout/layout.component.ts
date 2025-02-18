import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  // menuTitle = `<i class="fas fa-user"></i> RR. HH`;
  isCollapsed = false
}
