import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  template: '',
})
export default class IndexPage implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    this.router.navigate(['/dashboard']);
  }
}
